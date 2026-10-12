import { HttpError, notFound } from "@/lib/api/http";
import { transition } from "@/lib/core/transitions";
import type { PaymentProvider } from "@/lib/contracts";
import type { PlatformFee, Prisma } from "@/lib/generated/prisma/client";
import { computeFee, FEE_MIN_XOF, FEE_RATE } from "./fee-rules";

// Frais de service Fid’s : la règle de calcul vit dans fee-rules.ts (partagée avec l'interface).
export { computeFee, FEE_MIN_XOF, FEE_RATE };
// Délai laissé à l'administration pour confirmer la réception des frais.
export const FEE_CONFIRMATION_DELAY_MS = 48 * 60 * 60 * 1000;

const ENV_BY_PROVIDER: Record<PaymentProvider, string> = {
  wave: "FIDS_PAYOUT_WAVE",
  orange_money: "FIDS_PAYOUT_ORANGE_MONEY",
  moov_money: "FIDS_PAYOUT_MOOV_MONEY",
  mtn_momo: "FIDS_PAYOUT_MTN_MOMO",
};

/** Numéros de réception de Fid’s (variables FIDS_PAYOUT_*). Aucun numéro configuré : frais impayables. */
export function platformPayoutMethods() {
  return (Object.entries(ENV_BY_PROVIDER) as [PaymentProvider, string][])
    .map(([provider, key]) => ({ provider, phone: (process.env[key] ?? "").trim(), label: "Fid’s" }))
    .filter((m) => m.phone.length > 0);
}

/** Un paiement de frais « déclaré » non encore périmé. */
export const activeFeeWhere = (deliveryId: string, now = new Date()): Prisma.PlatformFeeWhereInput => ({
  deliveryId,
  status: "declared",
  expiresAt: { gt: now },
});

/**
 * L'administration a bien reçu les frais : le paiement des frais est confirmé et la livraison
 * passe de fee_pending à paid (la passation peut commencer), dans la même transaction.
 */
export async function confirmFee(tx: Prisma.TransactionClient, fee: PlatformFee, adminId: string) {
  const confirmed = await tx.platformFee.update({
    where: { id: fee.id },
    data: { status: "confirmed", confirmedFor: fee.deliveryId, decidedById: adminId, decidedAt: new Date() },
  });
  await transition(
    fee.deliveryId,
    { type: "fee.confirmed", actor: `admin:${adminId}`, payload: { feeId: confirmed.id, amountXof: confirmed.amountXof } },
    { tx },
  );
  return confirmed;
}

/** Verrouille la livraison puis relit le paiement de frais : il doit encore être « déclaré ». */
export async function lockDeclaredFee(tx: Prisma.TransactionClient, feeId: string) {
  const fee = await tx.platformFee.findUnique({ where: { id: feeId }, select: { deliveryId: true } });
  if (!fee) throw notFound("Paiement de frais introuvable.");
  await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${fee.deliveryId} FOR UPDATE`;
  const fresh = await tx.platformFee.findUniqueOrThrow({ where: { id: feeId } });
  if (fresh.status !== "declared") {
    throw new HttpError(409, "FEE_NOT_DECIDABLE", "Ce paiement de frais a déjà été traité.");
  }
  return fresh;
}
