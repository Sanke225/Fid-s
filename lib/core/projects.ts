import { randomBytes } from "node:crypto";
import { HttpError, notFound } from "@/lib/api/http";
import type { AssignClientInput, ProjectStatus } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";
import { createClientAccount, findClientAccount } from "./client-accounts";
import { isPlaceholderEmail } from "./placeholder-email";
import { recordEvent } from "./events";

// Cycle de vie du projet : unassigned → assigned → in_progress → finished.
// SEUL point d'écriture de projects.status. Chaque étape est aussi écrite dans l'historique
// de la livraison du projet (créée à l'assignation) : le dev et le client y voient la même chose.

const PROJECT_TRANSITIONS = {
  "project.started": { from: "assigned", to: "in_progress", stamp: "startedAt" },
  // Accepté seulement si la démo est en ligne (voir assertDemoReady) : le client voit ce qui fonctionne.
  "project.finished": { from: "in_progress", to: "finished", stamp: "finishedAt" },
} as const satisfies Record<string, { from: ProjectStatus; to: ProjectStatus; stamp: "startedAt" | "finishedAt" }>;

export type ProjectEvent = keyof typeof PROJECT_TRANSITIONS;

// Verrou sur la ligne : deux clics simultanés s'exécutent l'un après l'autre.
// ownerId dans le filtre : le projet d'un autre dev répond 404, comme s'il n'existait pas.
async function lockOwnedProject(tx: Prisma.TransactionClient, projectId: string, ownerId: string) {
  const rows = await tx.$queryRaw<{ status: ProjectStatus }[]>`
    SELECT status FROM projects WHERE id = ${projectId} AND owner_id = ${ownerId} FOR UPDATE`;
  if (rows.length === 0) throw notFound("Projet introuvable.");
  return rows[0].status;
}

export async function transitionProject(projectId: string, ownerId: string, event: ProjectEvent) {
  const rule = PROJECT_TRANSITIONS[event];
  return prisma.$transaction(async (tx) => {
    const current = await lockOwnedProject(tx, projectId, ownerId);
    // Événement rejoué (double clic) : déjà fait, rien à écrire.
    if (current === rule.to) return;
    if (current !== rule.from) {
      throw new HttpError(409, "INVALID_TRANSITION", "Cette action n'est pas possible à cette étape du projet.", {
        status: current,
        event,
      });
    }
    if (event === "project.finished") await assertDemoReady(tx, projectId);
    const now = new Date();
    await tx.project.update({ where: { id: projectId }, data: { status: rule.to, [rule.stamp]: now } });
    const delivery = await tx.delivery.findFirst({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (delivery) {
      await recordEvent(tx, {
        deliveryId: delivery.id,
        type: event,
        actor: `user:${ownerId}`,
        payload: { from: current, to: rule.to },
      });
    }
  });
}

// « Terminé » : la dernière livraison a une démo installée sans erreur et en ligne.
async function assertDemoReady(tx: Prisma.TransactionClient, projectId: string) {
  const delivery = await tx.delivery.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { status: true, spaces: { where: { kind: "demo", status: "running" }, select: { id: true } } },
  });
  if (delivery?.status !== "demo_ready" || delivery.spaces.length === 0) {
    throw new HttpError(409, "DEMO_NOT_READY", "Envoyez le code et attendez que la démo soit en ligne avant de marquer le projet terminé.");
  }
}

// Assigne un client (existant, ou créé par le dev) et crée la livraison du projet.
// Les identifiants provisoires ne sont renvoyés qu'ici, une seule fois.
export async function assignClient(projectId: string, ownerId: string, input: AssignClientInput) {
  return prisma.$transaction(async (tx) => {
    const current = await lockOwnedProject(tx, projectId, ownerId);
    if (current !== "unassigned") {
      throw new HttpError(409, "PROJECT_ALREADY_ASSIGNED", "Ce projet a déjà un client.");
    }

    const created = input.client.mode === "create" ? await createClientAccount(tx, input.client) : null;
    const client = created?.user ?? (input.client.mode === "existing" ? await findClientAccount(tx, input.client.login) : null);
    if (!client) throw new HttpError(422, "VALIDATION_ERROR", "Client manquant.");

    const now = new Date();
    await tx.project.update({
      where: { id: projectId },
      data: { status: "assigned", clientUserId: client.id, assignedAt: now },
    });
    const delivery = await tx.delivery.create({
      data: {
        projectId,
        // 32 octets aléatoires : le lien de livraison n'est pas devinable.
        publicToken: randomBytes(32).toString("base64url"),
        amountXof: input.amountXof,
        includeSource: input.includeSource,
        clientUserId: client.id,
        clientName: client.name,
        clientEmail: isPlaceholderEmail(client.email) ? null : client.email,
        clientPhone: client.phone,
      },
    });
    await recordEvent(tx, {
      deliveryId: delivery.id,
      type: "delivery.created",
      actor: `user:${ownerId}`,
      payload: { amountXof: delivery.amountXof },
    });
    await recordEvent(tx, {
      deliveryId: delivery.id,
      type: "project.assigned",
      actor: `user:${ownerId}`,
      payload: { clientAccountCreated: created !== null },
    });

    return { deliveryId: delivery.id, credentials: created?.credentials ?? null };
  });
}
