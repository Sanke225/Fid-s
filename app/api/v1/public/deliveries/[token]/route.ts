import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { payerTokenFrom } from "@/lib/payments/payer-token";
import { HttpError, handle } from "@/lib/api/http";
import { publicDeliveryInclude, toPublicDeliveryDto } from "@/lib/api/serializers";

type Context = { params: Promise<{ token: string }> };

// GET /api/v1/public/deliveries/:token — la page de livraison du client (sans compte).
// En-tête X-Payer-Token facultatif : l'appareil qui a déclaré un paiement en voit l'état.
export const GET = handle<Context>(async (request, { params }) => {
  const { token } = await params;
  const delivery = await prisma.delivery.findUnique({ where: { publicToken: token }, include: publicDeliveryInclude });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Cette livraison n'est plus disponible.");

  const payerHash = payerTokenFrom(request);
  const payerPayment = payerHash
    ? await prisma.payment.findFirst({
        where: { deliveryId: delivery.id, payerToken: payerHash },
        select: { id: true, status: true },
      })
    : null;

  // Le client connecté et propriétaire de la livraison a les mêmes droits que l'appareil qui a payé
  // (frais Fid’s, espace client), depuis n'importe quel appareil.
  const session = await auth.api.getSession({ headers: request.headers });
  const isOwner = session?.user.role === "client" && delivery.clientUserId === session.user.id;

  // Frais Fid’s : seulement pour l'appareil dont le paiement au dev a été confirmé, ou le propriétaire.
  const payerFee =
    payerPayment?.status === "confirmed" || isOwner
      ? await prisma.platformFee.findFirst({
          where: { deliveryId: delivery.id },
          orderBy: { declaredAt: "desc" },
          select: { id: true, status: true },
        })
      : null;

  return Response.json(toPublicDeliveryDto(delivery, payerPayment, payerFee, isOwner));
});
