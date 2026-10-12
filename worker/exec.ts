import { spawn } from "node:child_process";

// Lance une commande (docker, unzip…) sans shell : les arguments ne sont jamais interprétés.
// Chaque ligne de sortie est remontée à onLine ; la commande est tuée au-delà de timeoutMs.
export function run(
  cmd: string,
  args: string[],
  opts: { onLine?: (line: string, stream: "stdout" | "stderr") => void; timeoutMs?: number; cwd?: string } = {},
): Promise<{ code: number; output: string; timedOut: boolean }> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let timedOut = false;
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGKILL");
        }, opts.timeoutMs)
      : null;

    const pipe = (stream: "stdout" | "stderr") => {
      let rest = "";
      child[stream].on("data", (chunk: Buffer) => {
        const text = rest + chunk.toString("utf8");
        const lines = text.split(/\r?\n/);
        rest = lines.pop() ?? "";
        for (const line of lines) {
          if (output.length < 200_000) output += line + "\n";
          opts.onLine?.(line, stream);
        }
      });
      child[stream].on("end", () => {
        if (rest) {
          output += rest;
          opts.onLine?.(rest, stream);
        }
      });
    };
    pipe("stdout");
    pipe("stderr");

    child.on("error", reject);
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({ code: code ?? 1, output, timedOut });
    });
  });
}

// Comme run, mais échoue si la commande échoue.
export async function mustRun(cmd: string, args: string[], opts: Parameters<typeof run>[2] = {}) {
  const r = await run(cmd, args, opts);
  if (r.code !== 0) throw new Error(`${cmd} ${args[0]} : ${r.output.trim().split("\n").slice(-3).join(" ")}`);
  return r.output;
}
