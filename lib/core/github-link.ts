import { createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "@/lib/api/http";
import { prisma } from "@/lib/db";
import { installationRepos } from "@/lib/github";

// « state » signé de l'aller-retour GitHub : qui a lancé la connexion, et où revenir (10 min).
const key = () => `${process.env.BETTER_AUTH_SECRET ?? ""}:github`;

export function signState(userId: string, returnTo: string) {
  const body = Buffer.from(JSON.stringify({ u: userId, r: returnTo, exp: Date.now() + 10 * 60_000 })).toString("base64url");
  return `${body}.${createHmac("sha256", key()).update(body).digest("base64url")}`;
}

export function readState(state: string | null) {
  const [body, mac] = (state ?? "").split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(createHmac("sha256", key()).update(body).digest("base64url"));
  if (expected.length !== Buffer.from(mac).length || !timingSafeEqual(expected, Buffer.from(mac))) return null;
  const p = JSON.parse(Buffer.from(body, "base64url").toString()) as { u: string; r: string; exp: number };
  return p.exp > Date.now() ? p : null;
}

// Retour seulement vers l'espace dev (pas de redirection ouverte).
export const safeDevReturn = (path: string | null) => (path && /^\/dev\/[\w/-]*$/.test(path) ? path : "/dev/projects");

export async function ownedInstallation(userId: string, id: string) {
  const inst = await prisma.githubInstallation.findFirst({ where: { id, userId } });
  if (!inst) throw new HttpError(404, "NOT_FOUND", "Compte GitHub non connecté à Fid’s.");
  return inst;
}

// Le dépôt doit faire partie de ceux que le dev a autorisés pour l'App (vérifié auprès de GitHub).
export async function assertRepoAllowed(installationId: bigint, repo: string) {
  const repos = await installationRepos(installationId);
  const found = repos.find((r) => r.fullName.toLowerCase() === repo.toLowerCase());
  if (!found) throw new HttpError(404, "NOT_FOUND", "Ce dépôt n’est pas autorisé pour Fid’s : ajoutez-le dans les réglages de l’App sur GitHub.");
  return found;
}
