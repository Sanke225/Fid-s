import { OpenTicketInput } from "@/lib/contracts";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { payerTokenFrom } from "@/lib/payments/payer-token";
import { DEV_ANSWER_DELAY_MS, UNRESOLVED_TICKET } from "@/lib/payments/tickets";
import { HttpError, handle, notFound, parseJson } from "@/lib/api/http";
import { toTicketDto } from "@/lib/api/serializers";

type Context = { params: Promise<{ paymentId: string }> };

async function findPayerPayment(request: Request, paymentId: string) {
  const payerHash = payerTokenFrom(request);
  const payment = payerHash ? await prisma.payment.findFirst({ where: { id: paymentId, payerToken: payerHash } }) : null;
  if (!payment) throw notFound("Paiement introuvable.");
  return payment;
}

// GET /api/v1/public/payments/:paymentId/tickets — les tickets du client sur ce paiement (X-Payer-Token).
export const GET = handle<Context>(async (request, { params }) => {
  const { paymentId } = await params;
  const payment = await findPayerPayment(request, paymentId);
  const tickets = await prisma.ticket.findMany({ where: { paymentId: payment.id }, orderBy: { createdAt: "desc" } });
  return Response.json({ items: tickets.map(toTicketDto) });
});

// POST /api/v1/public/payments/:paymentId/tickets — le client conteste : le dev a refusé,
// ou n'a pas répondu dans les 48 h. Le dev a ensuite 48 h pour répondre avant que l'admin tranche.
export const POST = handle<Context>(async (request, { params }) => {
  const { paymentId } = await params;
  const { claim } = await parseJson(request, OpenTicketInput);
  const payment = await findPayerPayment(request, paymentId);
  const session = await auth.api.getSession({ headers: request.headers });
  const now = new Date();

  const ticket = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${payment.deliveryId} FOR UPDATE`;
    const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });

    const devSilent = current.status === "declared" && current.expiresAt <= now;
    if (current.status !== "rejected" && !devSilent) {
      throw new HttpError(409, "TICKET_NOT_ALLOWED", "Vous pourrez ouvrir un ticket si le développeur refuse le paiement ou ne répond pas sous 48 h.");
    }

    const existing = await tx.ticket.findFirst({ where: { paymentId: current.id }, select: { status: true } });
    if (existing) {
      const unresolved = (UNRESOLVED_TICKET as readonly string[]).includes(existing.status);
      throw unresolved
        ? new HttpError(409, "TICKET_ALREADY_OPEN", "Un ticket est déjà ouvert pour ce paiement.")
        : new HttpError(409, "TICKET_NOT_ALLOWED", "Ce paiement a déjà fait l'objet d'une décision.");
    }

    const created = await tx.ticket.create({
      data: {
        deliveryId: current.deliveryId,
        paymentId: current.id,
        openedById: session?.user.id ?? null,
        status: "awaiting_dev",
        clientClaim: claim,
        clientProofs: [],
        devProofs: [],
        devDueAt: new Date(now.getTime() + DEV_ANSWER_DELAY_MS),
      },
    });
    await recordEvent(tx, {
      deliveryId: current.deliveryId,
      type: "ticket.opened",
      actor: session ? `user:${session.user.id}` : "client",
      payload: { ticketId: created.id, paymentId: current.id },
    });
    return created;
  });

  return Response.json(toTicketDto(ticket), { status: 201 });
});
