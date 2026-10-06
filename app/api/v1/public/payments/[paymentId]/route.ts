import { prisma } from "@/lib/db";
import { payerTokenFrom } from "@/lib/payments/payer-token";
import { handle, notFound } from "@/lib/api/http";
import { toPaymentDto } from "@/lib/api/serializers";

type Context = { params: Promise<{ paymentId: string }> };

// GET /api/v1/public/payments/:paymentId — suivi par le client (en-tête X-Payer-Token obligatoire).
export const GET = handle<Context>(async (request, { params }) => {
  const { paymentId } = await params;
  const payerHash = payerTokenFrom(request);
  if (!payerHash) throw notFound("Paiement introuvable.");

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, payerToken: payerHash } });
  if (!payment) throw notFound("Paiement introuvable.");
  return Response.json(toPaymentDto(payment));
});
