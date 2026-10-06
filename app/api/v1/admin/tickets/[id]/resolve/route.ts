import { ResolveTicketInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { confirmPayment } from "@/lib/payments/confirm";
import { lockTicket } from "@/lib/payments/tickets";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toTicketDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/admin/tickets/:id/resolve — l'admin tranche, sur preuves. La décision est journalisée.
// release : le paiement est confirmé et la livraison débloquée. reject : le paiement reste refusé.
// L'admin ne touche jamais l'argent : il ne fait que débloquer (ou non) l'application.
export const POST = handle<Context>(async (request, { params }) => {
  const admin = await requireRole(request, "admin");
  const { id } = await params;
  const { decision, resolution } = await parseJson(request, ResolveTicketInput);

  const ticket = await prisma.$transaction(async (tx) => {
    const current = await lockTicket(tx, id);
    const now = new Date();
    // Le dev a 48 h pour répondre : avant, l'admin ne tranche pas seul.
    if (current.status === "awaiting_dev" && current.devDueAt && current.devDueAt > now) {
      throw new HttpError(409, "TICKET_DEV_DELAY_RUNNING", "Le développeur a encore le temps de répondre.", {
        devDueAt: current.devDueAt.toISOString(),
      });
    }

    if (decision === "release") {
      await confirmPayment(tx, current.payment, admin.id);
    } else if (current.payment.status === "declared") {
      // Le dev n'a jamais répondu, mais les preuves ne suffisent pas : le paiement est refusé.
      await tx.payment.update({
        where: { id: current.payment.id },
        data: { status: "rejected", rejectionReason: resolution, decidedById: admin.id, decidedAt: now },
      });
    }

    const resolved = await tx.ticket.update({
      where: { id: current.id },
      data: {
        status: decision === "release" ? "resolved_released" : "resolved_rejected",
        resolution,
        resolvedById: admin.id,
        resolvedAt: now,
      },
    });
    await recordEvent(tx, {
      deliveryId: current.deliveryId,
      type: "ticket.resolved",
      actor: `admin:${admin.id}`,
      payload: { ticketId: current.id, decision, by: "admin" },
    });
    return resolved;
  });

  return Response.json(toTicketDto(ticket));
});
