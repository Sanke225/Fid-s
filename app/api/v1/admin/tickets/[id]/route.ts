import type { AdminTicketDetail } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle, notFound } from "@/lib/api/http";
import { toPaymentDto, toTicketDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/admin/tickets/:id — tout ce qu'il faut pour trancher.
export const GET = handle<Context>(async (request, { params }) => {
  await requireRole(request, "admin");
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      payment: true,
      delivery: {
        include: { project: { include: { owner: { select: { id: true, name: true, email: true, phone: true } } } } },
      },
    },
  });
  if (!ticket) throw notFound("Ticket introuvable.");

  const { delivery } = ticket;
  const body: AdminTicketDetail = {
    ticket: toTicketDto(ticket),
    payment: toPaymentDto(ticket.payment),
    delivery: {
      id: delivery.id,
      status: delivery.status,
      amountXof: delivery.amountXof,
      projectName: delivery.project.name,
      clientName: delivery.clientName,
      dev: { ...delivery.project.owner, phone: delivery.project.owner.phone ?? null },
    },
  };
  return Response.json(body);
});
