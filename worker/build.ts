import { createHmac, randomBytes } from "node:crypto";
import http from "node:http";
import { mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Manifest } from "@/lib/contracts";
import { transition } from "@/lib/core/transitions";
import { decryptBlob, decryptValue, encryptValue } from "@/lib/crypto/envelope";
import { prisma } from "@/lib/db";
import type { Space } from "@/lib/generated/prisma/client";
import { DEMO_DOMAIN, slugify } from "@/lib/spaces";
import { readStored } from "@/lib/storage";
import { DOCKERIGNORE, appPort, dockerfile, shellEnvFile } from "./dockerfile";
import { StageError } from "./errors";
import { mustRun, run } from "./exec";
import { readProjectDotenv } from "./dotenv";
import { loadManifest } from "./manifest";
import { ensureTenantDatabase, resetTenantDatabase } from "./tenant";

// Une installation : archive → image Docker → démo en ligne sur <app>.<DEMO_DOMAIN>.
// L'ancienne version reste en ligne jusqu'à ce que la nouvelle réponde : le dev ne voit jamais de coupure.

const EDGE_CONTAINER = process.env.EDGE_CONTAINER ?? "infra-edge-1";
const EDGE_HTTP_URL = process.env.EDGE_HTTP_URL ?? "http://127.0.0.1:8088";
const TENANT_DB_CONTAINER = process.env.TENANT_DB_CONTAINER ?? "infra-tenant-db-1";

const BUILD_TIMEOUT_MS = 15 * 60_000;
const STEP_TIMEOUT_MS = 5 * 60_000;
const HEALTH_TIMEOUT_MS = 90_000;

// Limites d'une démo : de quoi faire tourner une application de gestion, pas davantage.
const LIMITS = ["--memory", "512m", "--cpus", "0.5", "--pids-limit", "256"];
const HARDENING = ["--cap-drop", "ALL", "--security-opt", "no-new-privileges"];

// Contrôle de santé Docker : tant que le conteneur n'est pas « healthy », le routeur ne lui envoie rien.
// Pendant une mise à jour, l'ancienne version sert donc seule jusqu'à ce que la nouvelle soit prête.
// Vérification légère (le port accepte les connexions) : une page lente ne doit pas faire retirer la démo.
// La réponse HTTP, elle, est contrôlée par le worker avant la bascule (waitHealthy).
function healthFlags(m: Manifest) {
  const port = appPort(m);
  const cmd =
    m.type === "static"
      ? `wget -q -O /dev/null http://127.0.0.1:${port}/`
      : `node -e "require('net').connect(${port},'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))"`;
  return ["--health-cmd", cmd, "--health-interval", "2s", "--health-timeout", "5s", "--health-retries", "5", "--health-start-period", "60s"];
}

/** Journal d'installation, écrit par lots (lu par le dev en direct). */
class BuildLogger {
  private seq = 0;
  private buffer: { buildId: string; seq: number; stream: "stdout" | "stderr" | "system"; line: string }[] = [];
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly buildId: string) {}

  line(line: string, stream: "stdout" | "stderr" | "system" = "stdout") {
    if (this.seq >= 5000) return;
    this.buffer.push({ buildId: this.buildId, seq: this.seq++, stream, line: line.slice(0, 2000) });
    this.timer ??= setTimeout(() => void this.flush(), 400);
  }

  system = (line: string) => this.line(line, "system");

  async flush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const batch = this.buffer.splice(0);
    if (batch.length) await prisma.buildLog.createMany({ data: batch, skipDuplicates: true });
  }
}

export async function processBuild(buildId: string) {
  const build = await prisma.build.findUniqueOrThrow({
    where: { id: buildId },
    include: { sourceArchive: true, delivery: { select: { id: true, project: { select: { name: true } } } } },
  });
  const log = new BuildLogger(buildId);
  const work = await mkdtemp(path.join(tmpdir(), "fids-build-"));
  let stage: "build" | "space" = "build";
  let newContainer: string | null = null;

  try {
    log.system("Installation démarrée.");

    // 1. Déballage de l'archive.
    const root = await unpack(build.sourceArchive, work, log);

    // 2. Manifeste.
    const manifest = await loadManifest(root);
    log.system(`Type : ${manifest.type} · Node ${manifest.nodeVersion} · port ${appPort(manifest)}`);
    await prisma.build.update({ where: { id: buildId }, data: { manifest } });

    // Réinitialisation : on garde l'image déjà construite si elle existe encore (pas de nouvelle construction).
    const reuse = build.resetDemo && build.imageRef && (await run("docker", ["image", "inspect", build.imageRef])).code === 0;
    if (build.resetDemo) log.system(reuse ? "Réinitialisation de la démo (même version)." : "Réinitialisation : image absente, reconstruction.");

    // 3. Image.
    const imageRef = reuse ? build.imageRef! : `fids/demo-${build.deliveryId.slice(0, 8)}:${buildId.slice(0, 8)}`;
    await writeFile(path.join(root, "Dockerfile.fids"), dockerfile(manifest));
    await writeFile(path.join(root, ".dockerignore"), DOCKERIGNORE);
    const fromFiles = await readProjectDotenv(root);
    if (fromFiles.found.length) {
      log.system(`Variables lues dans ${fromFiles.found.join(", ")} : ${Object.keys(fromFiles.vars).join(", ") || "aucune"}`);
    }
    // Celles saisies dans Fid’s remplacent celles des fichiers.
    const devEnv = { ...fromFiles.vars, ...(await loadDevEnv(build.deliveryId)) };
    const names = Object.keys(devEnv);
    if (names.length) log.system(`Variables du projet : ${names.join(", ")}`);
    // Hors du contexte de construction : le fichier n'entre jamais dans l'image.
    const secretFile = path.join(work, "build.env");
    await writeFile(secretFile, shellEnvFile(devEnv), { mode: 0o600 });
    const envRev = createHmac("sha256", process.env.MASTER_KEY ?? "").update(JSON.stringify(devEnv)).digest("hex").slice(0, 16);
    log.system(reuse ? "Image existante réutilisée." : "Construction de l’image…");
    const built = reuse ? { code: 0, output: "", timedOut: false } : await run("docker", [
      "build", "--progress=plain", "-f", "Dockerfile.fids", "-t", imageRef, "--label", "fids.build=true",
      "--secret", `id=fidsenv,src=${secretFile}`, "--build-arg", `FIDS_ENV_REV=${envRev}`, ".",
    ], {
      cwd: root,
      timeoutMs: BUILD_TIMEOUT_MS,
      onLine: (l) => log.line(l),
    });
    if (built.timedOut) throw new StageError("timeout", "L’installation a dépassé 15 minutes.");
    if (built.code !== 0) {
      // Cause la plus fréquente sur un vrai projet : une clé d'API absente au moment du build.
      const missing = /missing|not set|is not defined|undefined.*env|API key/i.test(built.output);
      throw new StageError(
        "build",
        missing
          ? "La construction a échoué, probablement une variable d’environnement manquante : ajoutez-la dans « Variables d’environnement » puis renvoyez le code."
          : "La construction a échoué : voir le journal ci-dessus.",
      );
    }
    await prisma.build.update({ where: { id: buildId }, data: { imageRef } });

    // 4. Démo.
    stage = "space";
    const { space, firstRun } = await ensureDemoSpace(build.deliveryId, build.delivery.project.name);
    const env = await prepareNetworkAndEnv(space, manifest, work, devEnv);
    log.system(`Démo : ${space.hostname}`);

    if (build.resetDemo && !firstRun) {
      log.system("Base de la démo vidée.");
      try {
        await resetTenantDatabase(space.dbName);
      } catch (e) {
        console.error("[worker] reset db", e);
        throw new StageError("database", "La base de la démo n’a pas pu être réinitialisée.");
      }
    }
    if (manifest.migrate) await oneOff(imageRef, space, env, manifest.migrate, "migrate", "Migrations", log);
    if ((firstRun || build.resetDemo) && manifest.seedDemo) await oneOff(imageRef, space, env, manifest.seedDemo, "migrate", "Données de démonstration", log);

    newContainer = `${space.containerName}-${buildId.slice(0, 8)}`;
    await run("docker", ["rm", "-f", newContainer]);
    const router = space.containerName;
    await mustRun("docker", [
      "run", "-d", "--name", newContainer, "--network", space.networkName, "--env-file", env,
      "--restart", "unless-stopped", ...LIMITS, ...HARDENING, ...healthFlags(manifest),
      "--label", "fids.space=true",
      "--label", `fids.space.id=${space.id}`,
      "--label", "traefik.enable=true",
      "--label", `traefik.docker.network=${space.networkName}`,
      // Même routeur et même service pour toutes les versions : la nouvelle rejoint l'ancienne, puis l'ancienne part.
      "--label", `traefik.http.routers.${router}.rule=Host(\`${space.hostname}\`)`,
      "--label", `traefik.http.routers.${router}.entrypoints=web`,
      "--label", `traefik.http.routers.${router}.service=${router}`,
      "--label", `traefik.http.services.${router}.loadbalancer.server.port=${appPort(manifest)}`,
      imageRef,
    ]).catch((e) => {
      throw new StageError("start", `Le démarrage a échoué : ${(e as Error).message}`);
    });

    log.system("Vérification que l’application répond…");
    await waitHealthy(newContainer, space.hostname, manifest.healthcheck, log);

    // 5. Bascule : on retire les anciennes versions, la nouvelle sert seule.
    const old = (await run("docker", ["ps", "-aq", "--filter", `label=fids.space.id=${space.id}`])).output.split("\n").filter(Boolean);
    const current = (await run("docker", ["ps", "-aq", "--filter", `name=^${newContainer}$`])).output.trim();
    for (const id of old) if (!current.startsWith(id) && !id.startsWith(current)) await run("docker", ["rm", "-f", id]);

    await prisma.$transaction(async (tx) => {
      await tx.space.update({
        where: { id: space.id },
        data: { status: "running", imageRef, lastHealthAt: new Date(), failureStage: null, failureMessage: null },
      });
      await tx.build.update({ where: { id: buildId }, data: { status: "succeeded", finishedAt: new Date() } });
      await tx.delivery.update({ where: { id: build.deliveryId }, data: { currentBuildId: buildId } });
      await transition(build.deliveryId, { type: "space.ready", actor: "system", payload: { buildId, hostname: space.hostname } }, { tx });
    });
    log.system("Démo en ligne.");
  } catch (error) {
    const known = error instanceof StageError;
    const failure = known ? error.stage : stage === "build" ? "build" : "runtime";
    const message = known ? error.message : "Erreur interne de l’installation. L’équipe Fid’s est prévenue.";
    if (!known) console.error(`[worker] build ${buildId}`, error);
    log.system(`Échec (${failure}) : ${message}`);
    if (newContainer) await run("docker", ["rm", "-f", newContainer]);
    await prisma.build.update({
      where: { id: buildId },
      data: { status: "failed", failureStage: failure, failureMessage: message, finishedAt: new Date() },
    });
    await transition(build.deliveryId, {
      type: stage === "build" ? "build.failed" : "space.failed",
      actor: "system",
      payload: { buildId, stage: failure, message },
    }).catch((e) => console.error("[worker] transition", e));
  } finally {
    await log.flush();
    await rm(work, { recursive: true, force: true });
  }
}

// Variables saisies par le dev pour cette livraison, déchiffrées le temps de l'installation.
async function loadDevEnv(deliveryId: string) {
  const rows = await prisma.deliveryEnvVar.findMany({ where: { deliveryId }, select: { name: true, valueEncrypted: true } });
  return Object.fromEntries(rows.map((r) => [r.name, decryptValue(r.valueEncrypted)]));
}

async function unpack(archive: { storagePath: string; wrappedKey: Uint8Array; iv: Uint8Array; authTag: Uint8Array }, work: string, log: BuildLogger) {
  const plain = decryptBlob({
    ciphertext: await readStored(archive.storagePath),
    wrappedKey: Buffer.from(archive.wrappedKey),
    iv: Buffer.from(archive.iv),
    authTag: Buffer.from(archive.authTag),
  });
  const zip = path.join(work, "source.zip");
  const src = path.join(work, "src");
  await writeFile(zip, plain, { mode: 0o600 });
  // unzip refuse les chemins absolus et retire les « ../ » : rien ne sort du dossier de travail.
  const r = await run("unzip", ["-qq", "-o", zip, "-d", src], { timeoutMs: STEP_TIMEOUT_MS });
  await rm(zip, { force: true });
  if (r.code > 1) throw new StageError("unpack", "L’archive .zip est illisible.");
  // Liens symboliques supprimés : ils pourraient pointer hors du projet pendant la construction.
  await run("find", [src, "-type", "l", "-delete"]);

  // Archive « projet/… » (GitHub, Finder) : on descend dans l'unique dossier.
  const entries = (await readdir(src)).filter((e) => e !== "__MACOSX" && e !== ".DS_Store");
  if (entries.length === 1 && (await stat(path.join(src, entries[0]))).isDirectory()) {
    log.system(`Dossier racine : ${entries[0]}/`);
    return path.join(src, entries[0]);
  }
  return src;
}

// Un espace « démo » par livraison, réutilisé d'une version à l'autre : même adresse, même base.
async function ensureDemoSpace(deliveryId: string, projectName: string): Promise<{ space: Space; firstRun: boolean }> {
  const key = `demo:${deliveryId}`;
  const existing = await prisma.space.findUnique({ where: { idempotencyKey: key } });
  if (existing) return { space: existing, firstRun: false };

  const id = randomBytes(6).toString("hex");
  const name = `sp_${id}`;
  const space = await prisma.space.create({
    data: {
      deliveryId,
      kind: "demo",
      hostname: `${slugify(projectName)}-${id.slice(0, 4)}.${DEMO_DOMAIN}`,
      imageRef: "",
      containerName: `fids-${name.replace("_", "-")}`,
      networkName: `fids_${name}`,
      dbName: name,
      dbUser: name,
      dbPasswordEncrypted: encryptValue(randomBytes(24).toString("base64url")),
      envEncrypted: encryptValue("{}"),
      idempotencyKey: key,
    },
  });
  return { space, firstRun: true };
}

// Réseau interne (aucune sortie vers Internet), base de l'espace, et fichier d'environnement du conteneur.
async function prepareNetworkAndEnv(space: Space, manifest: Manifest, work: string, devEnv: Record<string, string>) {
  try {
    const exists = await run("docker", ["network", "inspect", space.networkName]);
    if (exists.code !== 0) await mustRun("docker", ["network", "create", "--internal", "--label", "fids.space=true", space.networkName]);
    // Le routeur et la base des espaces rejoignent ce réseau ; « déjà connecté » n'est pas une erreur.
    await run("docker", ["network", "connect", space.networkName, EDGE_CONTAINER]);
    await run("docker", ["network", "connect", "--alias", "tenant-db", space.networkName, TENANT_DB_CONTAINER]);
  } catch (e) {
    throw new StageError("capacity", `Réseau de la démo indisponible : ${(e as Error).message}`);
  }

  const password = decryptValue(space.dbPasswordEncrypted);
  try {
    await ensureTenantDatabase(space.dbName, password);
  } catch (e) {
    console.error("[worker] tenant db", e);
    throw new StageError("database", "La base de données de la démo n’a pas pu être créée.");
  }

  // Secrets demandés par le manifeste (generate) : tirés une fois, puis conservés d'une version à l'autre.
  const stored = JSON.parse(decryptValue(space.envEncrypted)) as Record<string, string>;
  let changed = false;
  for (const name of manifest.generate) {
    if (!stored[name]) {
      stored[name] = randomBytes(32).toString("base64url");
      changed = true;
    }
  }
  if (changed) await prisma.space.update({ where: { id: space.id }, data: { envEncrypted: encryptValue(JSON.stringify(stored)) } });

  const env: Record<string, string> = {
    ...manifest.env,
    ...devEnv,
    ...stored,
    DATABASE_URL: `postgresql://${space.dbUser}:${encodeURIComponent(password)}@tenant-db:5432/${space.dbName}`,
    NODE_ENV: "production",
    PORT: String(appPort(manifest)),
    HOSTNAME: "0.0.0.0",
    FIDS_DEMO: "true",
  };
  // Fichier (et non arguments) : les secrets n'apparaissent pas dans la liste des processus.
  const file = path.join(work, "space.env");
  await writeFile(file, Object.entries(env).map(([k, v]) => `${k}=${v.replace(/\n/g, " ")}`).join("\n"), { mode: 0o600 });
  return file;
}

async function oneOff(image: string, space: Space, envFile: string, command: string, stage: "migrate", label: string, log: BuildLogger) {
  log.system(`${label}…`);
  const r = await run(
    "docker",
    ["run", "--rm", "--network", space.networkName, "--env-file", envFile, ...LIMITS, ...HARDENING, image, "sh", "-c", command],
    { timeoutMs: STEP_TIMEOUT_MS, onLine: (l, s) => log.line(l, s) },
  );
  if (r.code !== 0) throw new StageError(stage, `${label} : la commande a échoué (code ${r.code}).`);
}

// fetch() ignore un en-tête Host imposé : requête http brute vers le routeur, avec le nom de la démo.
function probe(url: URL, host: string) {
  return new Promise<{ status: number; body: string }>((resolve, reject) => {
    const req = http.request(url, { headers: { host }, timeout: 5000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (c: string) => body.length < 2000 && (body += c));
      res.on("end", () => resolve({ status: res.statusCode ?? 0, body }));
    });
    req.on("timeout", () => req.destroy(new Error("délai dépassé")));
    req.on("error", reject);
    req.end();
  });
}

// Interroge l'application à travers le routeur, avec la vraie adresse : vérifie aussi le routage.
async function waitHealthy(container: string, hostname: string, healthPath: string, log: BuildLogger) {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;
  let last = "";
  while (Date.now() < deadline) {
    const [state, health] = (await run("docker", ["inspect", "-f", "{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}", container])).output.trim().split(" ");
    if (state === "exited" || state === "dead") {
      const logs = (await run("docker", ["logs", "--tail", "30", container])).output;
      for (const l of logs.split("\n").filter(Boolean)) log.line(l, "stderr");
      throw new StageError("start", "L’application s’est arrêtée au démarrage : voir le journal.");
    }
    if (health !== "healthy") {
      last = `santé : ${health || "inconnue"}`;
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }
    try {
      const res = await probe(new URL(healthPath, EDGE_HTTP_URL), hostname);
      // 404 « page not found » du routeur : la nouvelle version n'est pas encore branchée.
      const routerMiss = res.status === 404 && res.body.trim() === "404 page not found";
      if (res.status < 500 && !routerMiss) return;
      last = `HTTP ${res.status}`;
    } catch (e) {
      last = (e as Error).message;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new StageError("healthcheck", `L’application ne répond pas après 90 s (${last}). Vérifiez qu’elle écoute sur le port $PORT.`);
}
