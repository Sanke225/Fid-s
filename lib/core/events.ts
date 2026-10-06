import type { Prisma } from "@/lib/generated/prisma/client";

// Écrit un événement dans l'historique d'une livraison, dans la transaction de l'appelant :
// le fait et son enregistrement réussissent ou échouent ensemble.
// La diffusion aux abonnés (dispatchedAt) arrivera avec le worker.
export function recordEvent(
  tx: Prisma.TransactionClient,
  event: { deliveryId: string; type: string; actor: string; payload?: Prisma.InputJsonValue },
) {
  return tx.event.create({
    data: {
      deliveryId: event.deliveryId,
      type: event.type,
      actor: event.actor,
      payload: event.payload ?? {},
    },
  });
}
