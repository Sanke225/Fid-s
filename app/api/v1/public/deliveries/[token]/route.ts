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

  return Response.json(toPublicDeliveryDto(delivery, payerPayment));
});
