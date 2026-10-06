import { HttpError } from "@/lib/api/http";
import { deliveryInclude } from "@/lib/api/serializers";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

// Charge une livraison appartenant au dev. Celle d'un autre dev répond 404, comme si elle n'existait pas.
export async function findOwnedDelivery(devId: string, deliveryId: string) {
  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, project: { ownerId: devId } },
    include: deliveryInclude,
  });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Livraison introuvable.");
  return delivery;
}

// Vrai si un paiement est déclaré (en attente du dev), confirmé, ou contesté par un ticket non résolu :
// la livraison ne se modifie plus, ne s'annule plus, et n'accepte pas d'autre déclaration.
export async function hasActivePayment(deliveryId: string, tx: Prisma.TransactionClient = prisma) {
  const [payments, tickets] = await Promise.all([
    tx.payment.count({ where: { deliveryId, status: { in: ["declared", "confirmed"] } } }),
    tx.ticket.count({ where: { deliveryId, status: { in: ["open", "awaiting_dev"] } } }),
  ]);
  return payments + tickets > 0;
}
