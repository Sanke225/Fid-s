import { prisma } from "@/lib/db";
import { handle, notFound } from "@/lib/api/http";
import { toPaymentDto, toTicketDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/tickets/:id — le ticket et le paiement contesté, pour le dev de la livraison.
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const ticket = await prisma.ticket.findFirst({
    where: { id, delivery: { project: { ownerId: dev.id } } },
    include: { payment: true },
  });
  if (!ticket) throw notFound("Ticket introuvable.");
  return Response.json({ ticket: toTicketDto(ticket), payment: toPaymentDto(ticket.payment) });
});
