import { TicketStatus } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { toTicketDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/tickets?status=awaiting_dev — les tickets ouverts sur les livraisons du dev.
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam ? TicketStatus.parse(statusParam) : undefined;

  const tickets = await prisma.ticket.findMany({
    where: { delivery: { project: { ownerId: dev.id } }, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json({ items: tickets.map(toTicketDto) });
});
