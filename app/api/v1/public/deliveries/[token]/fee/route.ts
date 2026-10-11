import { auth } from "@/lib/auth";
import { DeclareFeeInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { recordEvent } from "@/lib/core/events";
import { FEE_CONFIRMATION_DELAY_MS, activeFeeWhere, computeFee, platformPayoutMethods } from "@/lib/payments/fee";
import { payerTokenFrom } from "@/lib/payments/payer-token";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toPlatformFeeDto } from "@/lib/api/serializers";

type Context = { params: Promise<{ token: string }> };

// POST /api/v1/public/deliveries/:token/fee — le client déclare avoir payé les frais de service Fid’s (5 %).
// Réservé à l'appareil qui a payé le dev (X-Payer-Token du paiement confirmé) ou au client connecté propriétaire. Rien n'est débloqué
// tant qu'un administrateur n'a pas confirmé la réception sur le numéro de Fid’s.
export const POST = handle<Context>(async (request, { params }) => {
  const { token } = await params;
  const input = await parseJson(request, DeclareFeeInput);

  const payerHash = payerTokenFrom(request);
  // Sans jeton payeur, le client connecté propriétaire de la livraison peut aussi régler les frais.
  const session = payerHash ? null : await auth.api.getSession({ headers: request.headers });
  if (!payerHash && session?.user.role !== "client") {
    throw new HttpError(403, "PAYER_TOKEN_REQUIRED", "Seul l’appareil qui a payé le développeur peut régler les frais.");
  }

  const delivery = await prisma.delivery.findUnique({ where: { publicToken: token }, select: { id: true } });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Cette livraison n'est plus disponible.");

  // Le numéro de Fid’s choisi doit être configuré.
  const method = platformPayoutMethods().find((m) => m.provider === input.provider);
  if (!method) {
    throw new HttpError(422, "FEE_PROVIDER_UNAVAILABLE", "Ce moyen de paiement n’est pas proposé pour les frais Fid’s.");
  }

  const now = new Date();
  try {
    const fee = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${delivery.id} FOR UPDATE`;
      const current = await tx.delivery.findUniqueOrThrow({ where: { id: delivery.id }, select: { status: true, amountXof: true, clientUserId: true } });
      if (current.status !== "fee_pending") {
        throw new HttpError(409, "FEE_NOT_DUE", "Aucun frais n’est à régler pour cette livraison pour le moment.");
      }

      const isOwner = Boolean(session && current.clientUserId === session.user.id);
      const payer = payerHash
        ? await tx.payment.findFirst({ where: { deliveryId: delivery.id, status: "confirmed", payerToken: payerHash }, select: { id: true } })
        : null;
      if (!payer && !isOwner) {
        throw new HttpError(403, "PAYER_TOKEN_REQUIRED", "Seul l’appareil qui a payé le développeur peut régler les frais.");
      }

      if (await tx.platformFee.findFirst({ where: activeFeeWhere(delivery.id, now), select: { id: true } })) {
        throw new HttpError(409, "FEE_ALREADY_DECLARED", "Le paiement des frais a déjà été déclaré et attend sa confirmation.");
      }

      const created = await tx.platformFee.create({
        data: {
          deliveryId: delivery.id,
          provider: method.provider,
          payeePhone: method.phone,
          // Toujours calculé depuis la livraison, jamais envoyé par le client.
          amountXof: computeFee(current.amountXof),
          payerName: input.payerName,
          payerPhone: input.payerPhone,
          transactionRef: input.transactionRef,
          expiresAt: new Date(now.getTime() + FEE_CONFIRMATION_DELAY_MS),
        },
      });
      await recordEvent(tx, {
        deliveryId: delivery.id,
        type: "fee.declared",
        actor: session ? `user:${session.user.id}` : "client",
        payload: { feeId: created.id, provider: created.provider, amountXof: created.amountXof },
      });
      return created;
    });
    return Response.json(toPlatformFeeDto(fee), { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "TRANSACTION_REF_ALREADY_USED", "Cette référence de transaction a déjà été utilisée.");
    }
    throw error;
  }
});
