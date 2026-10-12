import { readFile } from "node:fs/promises";
import path from "node:path";
import { Manifest } from "@/lib/contracts";
import { StageError } from "./errors";

// Lit fids.json (ou recette.json). Sans fichier, ou pour les champs absents, déduit ce qu'il faut
// de package.json : la plupart des projets Node.js n'ont rien à écrire.

async function readJson(file: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new StageError("manifest", `${path.basename(file)} n’est pas un JSON valide.`);
  }
}

async function exists(file: string) {
  return readFile(file).then(
    () => true,
    () => false,
  );
}

export async function loadManifest(root: string): Promise<Manifest> {
  const declared = ((await readJson(path.join(root, "fids.json"))) ?? (await readJson(path.join(root, "recette.json"))) ?? {}) as Record<string, unknown>;
  const pkg = (await readJson(path.join(root, "package.json"))) as { scripts?: Record<string, string> } | null;

  const detected: Record<string, unknown> = {};
  if (pkg) {
    const pm = (await exists(path.join(root, "pnpm-lock.yaml")))
      ? "pnpm"
      : (await exists(path.join(root, "yarn.lock")))
        ? "yarn"
        : "npm";
    detected.install = {
      pnpm: "corepack enable && pnpm install --frozen-lockfile",
      yarn: "corepack enable && yarn install --frozen-lockfile",
      npm: (await exists(path.join(root, "package-lock.json"))) ? "npm ci" : "npm install",
    }[pm];
    const runScript = pm === "npm" ? "npm run" : pm;
    if (pkg.scripts?.build) detected.build = `${runScript} build`;
    if (pkg.scripts?.start) {
      detected.type = "node";
      detected.start = `${runScript} start`;
    } else {
      detected.type = "static";
      detected.outputDir = "dist";
    }
  } else if (await exists(path.join(root, "index.html"))) {
    detected.type = "static";
    detected.outputDir = ".";
  }

  const parsed = Manifest.safeParse({ ...detected, ...declared });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const where = first?.path.join(".") || "fids.json";
    throw new StageError(
      "manifest",
      Object.keys(declared).length || pkg
        ? `fids.json : ${where} — ${first?.message ?? "invalide"}`
        : "Aucun package.json, index.html ni fids.json à la racine de l’archive.",
    );
  }
  return parsed.data;
}
