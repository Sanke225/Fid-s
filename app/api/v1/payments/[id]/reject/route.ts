import { RejectPaymentInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { lockOwnedDeclaredPayment } from "@/lib/payments/owned";
import { handle, parseJson } from "@/lib/api/http";
import { toPaymentDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/payments/:id/reject — le dev dit n'avoir rien reçu. Le client pourra ouvrir un ticket.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const { reason } = await parseJson(request, RejectPaymentInput);

  const payment = await prisma.$transaction(async (tx) => {
    const declared = await lockOwnedDeclaredPayment(tx, dev.id, id);
    const rejected = await tx.payment.update({
      where: { id: declared.id },
      data: { status: "rejected", rejectionReason: reason, decidedById: dev.id, decidedAt: new Date() },
    });
    await recordEvent(tx, {
      deliveryId: declared.deliveryId,
      type: "payment.rejected",
      actor: `user:${dev.id}`,
      payload: { paymentId: rejected.id, reason },
    });
    return rejected;
  });

  return Response.json(toPaymentDto(payment));
});
