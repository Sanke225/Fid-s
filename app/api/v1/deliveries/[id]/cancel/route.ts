import { prisma } from "@/lib/db";
import { findOwnedDelivery, hasActivePayment } from "@/lib/core/deliveries";
import { transition } from "@/lib/core/transitions";
import { HttpError, handle } from "@/lib/api/http";
import { deliveryInclude, toDeliveryDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/deliveries/:id/cancel — avant paiement uniquement. La purge (code, démo) sera faite par le worker.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const delivery = await findOwnedDelivery(dev.id, id);

  await prisma.$transaction(async (tx) => {
    // Verrou avant le contrôle : un client ne peut pas déclarer un paiement entre les deux.
    await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${delivery.id} FOR UPDATE`;
    if (await hasActivePayment(delivery.id, tx)) {
      throw new HttpError(409, "DELIVERY_NOT_EDITABLE", "Un paiement est en cours : la livraison ne peut pas être annulée.");
    }
    await transition(delivery.id, { type: "delivery.cancelled", actor: `user:${dev.id}`, payload: { byUserId: dev.id } }, { tx });
  });

  const cancelled = await prisma.delivery.findUniqueOrThrow({ where: { id: delivery.id }, include: deliveryInclude });
  return Response.json(toDeliveryDto(cancelled));
});
