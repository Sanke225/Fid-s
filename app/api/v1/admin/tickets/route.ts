import { TicketStatus } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { toTicketDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/admin/tickets?status=open — file des tickets à trancher.
export const GET = handle(async (request) => {
  await requireRole(request, "admin");
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam ? TicketStatus.parse(statusParam) : undefined;

  const tickets = await prisma.ticket.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return Response.json({ items: tickets.map(toTicketDto) });
});
