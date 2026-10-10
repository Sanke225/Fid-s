import { AnswerTicketInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { confirmPayment } from "@/lib/payments/confirm";
import { lockTicket } from "@/lib/payments/tickets";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toTicketDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/tickets/:id/answer — le dev répond. S'il reconnaît avoir reçu l'argent
// (acknowledgePayment), le paiement est confirmé et le ticket clos ; sinon l'admin tranchera.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const { answer, acknowledgePayment } = await parseJson(request, AnswerTicketInput);

  const ticket = await prisma.$transaction(async (tx) => {
    const current = await lockTicket(tx, id, { delivery: { project: { ownerId: dev.id } } });
    if (current.status !== "awaiting_dev") {
      throw new HttpError(409, "TICKET_NOT_OPEN", "Vous avez déjà répondu à ce ticket ; l'administrateur va trancher.");
    }

    const now = new Date();
    if (acknowledgePayment) {
      await confirmPayment(tx, current.payment, dev.id);
      const resolved = await tx.ticket.update({
        where: { id: current.id },
        data: {
          devAnswer: answer,
          status: "resolved_released",
          resolution: "Le développeur a confirmé la réception du paiement.",
          resolvedById: dev.id,
          resolvedAt: now,
        },
      });
      await recordEvent(tx, {
        deliveryId: current.deliveryId,
        type: "ticket.resolved",
        actor: `user:${dev.id}`,
        payload: { ticketId: current.id, decision: "release", by: "dev" },
      });
      return resolved;
    }

    const answered = await tx.ticket.update({ where: { id: current.id }, data: { devAnswer: answer, status: "open" } });
    await recordEvent(tx, {
      deliveryId: current.deliveryId,
      type: "ticket.answered",
      actor: `user:${dev.id}`,
      payload: { ticketId: current.id },
    });
    return answered;
  });

  return Response.json(toTicketDto(ticket));
});
