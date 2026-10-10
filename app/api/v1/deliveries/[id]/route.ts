import { UpdateDeliveryInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { findOwnedDelivery, hasActivePayment } from "@/lib/core/deliveries";
import { isBeforePayment } from "@/lib/core/transitions";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { deliveryInclude, toDeliveryDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/deliveries/:id
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  return Response.json(toDeliveryDto(await findOwnedDelivery(dev.id, id)));
});

// PATCH /api/v1/deliveries/:id — montant et coordonnées du client, tant que rien n'est payé ni déclaré.
export const PATCH = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const input = await parseJson(request, UpdateDeliveryInput);
  const delivery = await findOwnedDelivery(dev.id, id);

  const updated = await prisma.$transaction(async (tx) => {
    // Revérifié dans la transaction : un client peut déclarer un paiement entre-temps.
    await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${delivery.id} FOR UPDATE`;
    const current = await tx.delivery.findUniqueOrThrow({ where: { id: delivery.id }, select: { status: true } });
    if (!isBeforePayment(current.status) || (await hasActivePayment(delivery.id, tx))) {
      throw new HttpError(409, "DELIVERY_NOT_EDITABLE", "Cette livraison ne peut plus être modifiée : un paiement est en cours ou réglé.");
    }

    const result = await tx.delivery.update({
      where: { id: delivery.id },
      data: {
        amountXof: input.amountXof,
        includeSource: input.includeSource,
        clientName: input.client?.name,
        clientEmail: input.client?.email,
        clientPhone: input.client?.phone,
      },
      include: deliveryInclude,
    });
    await recordEvent(tx, {
      deliveryId: delivery.id,
      type: "delivery.updated",
      actor: `user:${dev.id}`,
      payload: { fields: Object.keys(input) },
    });
    return result;
  });

  return Response.json(toDeliveryDto(updated));
});
