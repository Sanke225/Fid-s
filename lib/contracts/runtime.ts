import { z } from "zod";
import { Id, IsoDate } from "./common";

export const BuildStage = z.enum(["unpack", "manifest", "install", "build", "package", "timeout", "oom"]);
export type BuildStage = z.infer<typeof BuildStage>;

export const SpaceStage = z.enum(["capacity", "database", "migrate", "start", "healthcheck", "runtime"]);
export type SpaceStage = z.infer<typeof SpaceStage>;

// Commande du dev, écrite telle quelle dans le Dockerfile : une seule ligne.
const Command = z.string().trim().min(1).max(500).regex(/^[^\r\n]+$/, "Une commande tient sur une seule ligne");

// Le fichier fids.json (ou recette.json) à la racine du projet du dev (cahier des charges, 6.6).
// Champs absents : déduits de package.json par le worker (voir worker/manifest.ts).
export const Manifest = z
  .object({
    version: z.literal(1).default(1),
    type: z.enum(["node", "static"]),
    nodeVersion: z.enum(["22", "24"]).default("22"),
    install: Command.optional(),
    build: Command.optional(),
    start: Command.optional(),
    port: z.int().min(1).max(65535).optional(),
    healthcheck: z.string().startsWith("/").default("/"),
    migrate: Command.optional(),
    // Données de démonstration : lancé à la création de la démo et à chaque « Réinitialiser ».
    seedDemo: Command.optional(),
    // Passation : crée le compte admin du client (Fid’s fournit FIDS_ADMIN_EMAIL et FIDS_ADMIN_PASSWORD).
    admin: Command.optional(),
    // Compte de démo affiché au client dans le bandeau Fid’s.
    demoLogin: z.object({ login: z.string().min(1).max(200), password: z.string().min(1).max(200) }).optional(),
    outputDir: z.string().min(1).regex(/^[\w./-]+$/).refine((d) => !d.includes(".."), "Chemin invalide").optional(),
    env: z.record(z.string().regex(/^[A-Z_][A-Z0-9_]*$/), z.string()).default({}),
    generate: z.array(z.string().regex(/^[A-Z_][A-Z0-9_]*$/)).default([]),
  })
  .refine((m) => m.type !== "node" || m.start, {
    message: "« start » est obligatoire pour une application de type node",
    path: ["start"],
  })
  .refine((m) => m.type !== "static" || m.outputDir, {
    message: "« outputDir » est obligatoire pour une application de type static",
    path: ["outputDir"],
  });
export type Manifest = z.infer<typeof Manifest>;

export const Build = z.object({
  id: Id,
  deliveryId: Id,
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  failure: z.object({ stage: BuildStage, message: z.string() }).nullable(),
  manifest: Manifest.nullable(),
  queuedAt: IsoDate,
  startedAt: IsoDate.nullable(),
  finishedAt: IsoDate.nullable(),
});
export type Build = z.infer<typeof Build>;

export const BuildLogLine = z.object({
  seq: z.int(),
  stream: z.enum(["stdout", "stderr", "system"]),
  line: z.string(),
  at: IsoDate,
});
export type BuildLogLine = z.infer<typeof BuildLogLine>;

// GET /api/v1/deliveries/:id/builds/:buildId/logs?after=<seq>
export const BuildLogPage = z.object({
  lines: z.array(BuildLogLine),
  nextAfter: z.int(),
  done: z.boolean(),
});
export type BuildLogPage = z.infer<typeof BuildLogPage>;

export const Space = z.object({
  id: Id,
  deliveryId: Id,
  kind: z.enum(["demo", "client"]),
  status: z.enum(["provisioning", "running", "failed", "destroyed"]),
  url: z.url(),
  lastHealthAt: IsoDate.nullable(),
  failure: z.object({ stage: SpaceStage, message: z.string() }).nullable(),
});
export type Space = z.infer<typeof Space>;

// Variables d'environnement du projet (clés d'API, etc.), fournies par le dev. Chiffrées en base ;
// la valeur n'est jamais renvoyée, seulement le nom. Disponibles à la construction et au lancement.
export const EnvVarName = z
  .string()
  .trim()
  .regex(/^[A-Z_][A-Z0-9_]{0,99}$/, "Majuscules, chiffres et _ uniquement (ex. RESEND_API_KEY)")
  .refine((n) => !RESERVED_ENV.includes(n) && !n.startsWith("FIDS_"), "Ce nom est réservé par Fid’s");

// Posées par Fid’s pour chaque démo : le dev ne peut pas les remplacer.
export const RESERVED_ENV = ["DATABASE_URL", "PORT", "HOSTNAME", "HOST", "NODE_ENV"];

// PUT /api/v1/deliveries/:id/env — crée ou remplace une variable.
export const SetEnvVarInput = z.object({
  name: EnvVarName,
  value: z.string().max(8000),
});
export type SetEnvVarInput = z.infer<typeof SetEnvVarInput>;

export const EnvVarSummary = z.object({ name: z.string(), createdAt: IsoDate });
export type EnvVarSummary = z.infer<typeof EnvVarSummary>;

// GET /api/v1/deliveries/:id/preview — page « Voir l'application », pour le dev et pour son client.
export const DemoPreview = z.object({
  deliveryId: Id,
  projectName: z.string(),
  devName: z.string(),
  viewer: z.enum(["dev", "client"]),
  // Nul tant que la démo n'est pas visible pour ce lecteur (côté client : avant « Terminé »).
  demoUrl: z.url().nullable(),
  // Compte de démonstration déclaré par le dev (fids.json → demoLogin).
  demoLogin: z.object({ login: z.string(), password: z.string() }).nullable(),
  // Version affichée : installation en ligne, et date de mise en ligne.
  version: z.object({ id: Id, at: IsoDate }).nullable(),
  // Une installation (nouvelle version ou réinitialisation) est en cours.
  updating: z.boolean(),
  canReset: z.boolean(),
});
export type DemoPreview = z.infer<typeof DemoPreview>;
