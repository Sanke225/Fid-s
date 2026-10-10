import { HttpError, notFound } from "@/lib/api/http";
import type { Prisma } from "@/lib/generated/prisma/client";

// Paiement d'une livraison du dev, verrouillé avec sa livraison pour la durée de la transaction.
// Celui d'un autre dev répond 404.
export async function lockOwnedDeclaredPayment(tx: Prisma.TransactionClient, devId: string, paymentId: string) {
  const payment = await tx.payment.findFirst({
    where: { id: paymentId, delivery: { project: { ownerId: devId } } },
  });
  if (!payment) throw notFound("Paiement introuvable.");

  await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${payment.deliveryId} FOR UPDATE`;
  const fresh = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
  if (fresh.status !== "declared") {
    throw new HttpError(409, "PAYMENT_NOT_DECIDABLE", "Ce paiement a déjà été traité.");
  }
  return fresh;
}
