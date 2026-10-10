import { prisma } from "@/lib/db";
import { handle, notFound } from "@/lib/api/http";
import { toPaymentDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/payments/:id — le dev consulte un paiement déclaré sur une de ses livraisons.
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const payment = await prisma.payment.findFirst({ where: { id, delivery: { project: { ownerId: dev.id } } } });
  if (!payment) throw notFound("Paiement introuvable.");
  return Response.json(toPaymentDto(payment));
});
