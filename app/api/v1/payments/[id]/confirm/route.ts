import { prisma } from "@/lib/db";
import { confirmPayment } from "@/lib/payments/confirm";
import { lockOwnedDeclaredPayment } from "@/lib/payments/owned";
import { handle } from "@/lib/api/http";
import { toPaymentDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/payments/:id/confirm — le dev a bien reçu l'argent : c'est le déblocage.
// La passation (espace client, facture, accès) sera lancée par le worker sur payment.confirmed.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;

  const payment = await prisma.$transaction(async (tx) => {
    const declared = await lockOwnedDeclaredPayment(tx, dev.id, id);
    return confirmPayment(tx, declared, dev.id);
  });

  return Response.json(toPaymentDto(payment));
});
