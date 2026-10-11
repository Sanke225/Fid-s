import { prisma } from "@/lib/db";
import { confirmFee, lockDeclaredFee } from "@/lib/payments/fee";
import { handle } from "@/lib/api/http";
import { toPlatformFeeDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/admin/fees/:id/confirm — Fid’s a bien reçu ses frais : la livraison est débloquée
// (fee_pending → paid) et la passation peut commencer. Action journalisée.
export const POST = handle<Context>(async (request, { params }) => {
  const admin = await requireRole(request, "admin");
  const { id } = await params;
  const fee = await prisma.$transaction(async (tx) => confirmFee(tx, await lockDeclaredFee(tx, id), admin.id));
  return Response.json(toPlatformFeeDto(fee));
});
