import { z } from "zod";
import { Id, IsoDate } from "./common";

export const BuildStage = z.enum(["unpack", "manifest", "install", "build", "package", "timeout", "oom"]);
export type BuildStage = z.infer<typeof BuildStage>;

export const SpaceStage = z.enum(["capacity", "database", "migrate", "start", "healthcheck", "runtime"]);
export type SpaceStage = z.infer<typeof SpaceStage>;

// Le fichier recette.json à la racine du projet du dev (cahier des charges, 6.6).
export const Manifest = z
  .object({
    version: z.literal(1),
    type: z.enum(["node", "static"]),
    nodeVersion: z.enum(["22", "24"]),
    install: z.string().min(1),
    build: z.string().min(1).optional(),
    start: z.string().min(1).optional(),
    port: z.int().min(1).max(65535).optional(),
    healthcheck: z.string().startsWith("/").default("/"),
    migrate: z.string().min(1).optional(),
    seedDemo: z.string().min(1).optional(),
    outputDir: z.string().min(1).optional(),
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
