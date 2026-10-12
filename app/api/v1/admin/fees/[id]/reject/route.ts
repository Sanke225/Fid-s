import { RejectFeeInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { lockDeclaredFee } from "@/lib/payments/fee";
import { handle, parseJson } from "@/lib/api/http";
import { toPlatformFeeDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/admin/fees/:id/reject — rien reçu sur le numéro de Fid’s. La livraison reste en
// fee_pending : le client peut déclarer à nouveau (autre référence). Action journalisée.
export const POST = handle<Context>(async (request, { params }) => {
  const admin = await requireRole(request, "admin");
  const { id } = await params;
  const { reason } = await parseJson(request, RejectFeeInput);

  const fee = await prisma.$transaction(async (tx) => {
    const declared = await lockDeclaredFee(tx, id);
    const rejected = await tx.platformFee.update({
      where: { id: declared.id },
      data: { status: "rejected", rejectionReason: reason, decidedById: admin.id, decidedAt: new Date() },
    });
    await recordEvent(tx, {
      deliveryId: declared.deliveryId,
      type: "fee.rejected",
      actor: `admin:${admin.id}`,
      payload: { feeId: declared.id, reason },
    });
    return rejected;
  });
  return Response.json(toPlatformFeeDto(fee));
});
