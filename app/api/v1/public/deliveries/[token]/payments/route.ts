import { DeclarePaymentInput } from "@/lib/contracts";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { hasActivePayment } from "@/lib/core/deliveries";
import { recordEvent } from "@/lib/core/events";
import { newPayerToken } from "@/lib/payments/payer-token";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toPaymentDto } from "@/lib/api/serializers";

type Context = { params: Promise<{ token: string }> };

// Délai laissé au dev pour confirmer la réception ; au-delà, le client peut ouvrir un ticket.
const CONFIRMATION_DELAY_MS = 48 * 60 * 60 * 1000;

// POST /api/v1/public/deliveries/:token/payments — le client déclare avoir payé le dev.
// Recette ne voit pas passer l'argent : rien n'est débloqué tant que le dev n'a pas confirmé.
export const POST = handle<Context>(async (request, { params }) => {
  const { token } = await params;
  const input = await parseJson(request, DeclarePaymentInput);
  // Facultatif : un client connecté est relié à la livraison.
  const session = await auth.api.getSession({ headers: request.headers });

  const delivery = await prisma.delivery.findUnique({
    where: { publicToken: token },
    select: { id: true, project: { select: { ownerId: true } } },
  });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Cette livraison n'est plus disponible.");

  const payer = newPayerToken();
  const now = new Date();

  try {
    const payment = await prisma.$transaction(async (tx) => {
      // Verrou : ni annulation ni seconde déclaration pendant ce temps.
      await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${delivery.id} FOR UPDATE`;
      const current = await tx.delivery.findUniqueOrThrow({
        where: { id: delivery.id },
        select: { status: true, amountXof: true, expiresAt: true, clientUserId: true },
      });
      if (current.status !== "demo_ready" || (current.expiresAt && current.expiresAt <= now)) {
        throw new HttpError(409, "DELIVERY_NOT_PAYABLE", "Cette livraison ne peut pas être payée pour le moment.");
      }

      if (await hasActivePayment(delivery.id, tx)) {
        throw new HttpError(409, "PAYMENT_ALREADY_DECLARED", "Un paiement a déjà été déclaré pour cette livraison et attend la confirmation du développeur.");
      }

      // Le moyen de paiement doit être un numéro actif du dev de CETTE livraison.
      const method = await tx.payoutMethod.findFirst({
        where: { id: input.payoutMethodId, userId: delivery.project.ownerId, active: true },
      });
      if (!method) throw new HttpError(422, "PAYOUT_METHOD_NOT_FOUND", "Ce moyen de paiement n'est pas proposé pour cette livraison.");

      const created = await tx.payment.create({
        data: {
          deliveryId: delivery.id,
          payoutMethodId: method.id,
          provider: method.provider,
          payeePhone: method.phone,
          // Toujours le montant de la livraison, jamais une valeur envoyée par le client.
          amountXof: current.amountXof,
          payerName: input.payerName,
          payerPhone: input.payerPhone,
          transactionRef: input.transactionRef,
          payerToken: payer.hash,
          expiresAt: new Date(now.getTime() + CONFIRMATION_DELAY_MS),
        },
      });

      if (session?.user.role === "client" && current.clientUserId === null) {
        await tx.delivery.update({ where: { id: delivery.id }, data: { clientUserId: session.user.id } });
      }

      await recordEvent(tx, {
        deliveryId: delivery.id,
        type: "payment.declared",
        actor: session ? `user:${session.user.id}` : "client",
        payload: { paymentId: created.id, provider: created.provider, amountXof: created.amountXof },
      });
      return created;
    });

    return Response.json({ payment: toPaymentDto(payment), payerToken: payer.token }, { status: 201 });
  } catch (error) {
    // Index unique (provider, transaction_ref) : la même référence ne sert jamais deux fois.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "TRANSACTION_REF_ALREADY_USED", "Cette référence de transaction a déjà été utilisée.");
    }
    throw error;
  }
});
