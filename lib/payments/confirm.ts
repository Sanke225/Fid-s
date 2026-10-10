import { transition } from "@/lib/core/transitions";
import type { Payment, Prisma } from "@/lib/generated/prisma/client";

// Déblocage : le paiement passe à « confirmé » et la livraison à « payée », dans la même transaction.
// Appelé par le dev (dépôt confirmé), par le dev depuis un ticket, ou par l'admin qui tranche un ticket.
// L'appelant a déjà verrouillé la livraison et vérifié qui a le droit de confirmer.
export async function confirmPayment(tx: Prisma.TransactionClient, payment: Payment, actorId: string) {
  const confirmed = await tx.payment.update({
    where: { id: payment.id },
    data: {
      status: "confirmed",
      // Index unique : un seul paiement confirmé par livraison, garanti par la base.
      confirmedFor: payment.deliveryId,
      decidedById: actorId,
      decidedAt: new Date(),
    },
  });
  await transition(
    payment.deliveryId,
    {
      type: "payment.confirmed",
      actor: `user:${actorId}`,
      payload: { paymentId: confirmed.id, provider: confirmed.provider, amountXof: confirmed.amountXof },
    },
    { tx },
  );
  return confirmed;
}
