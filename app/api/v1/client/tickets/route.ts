import type { ClientTicket } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/client/tickets — les litiges ouverts par le client, sur ses livraisons.
export const GET = handle(async (request) => {
  const client = await requireRole(request, "client");
  const tickets = await prisma.ticket.findMany({
    where: { delivery: { clientUserId: client.id } },
    include: { delivery: { select: { amountXof: true, project: { select: { name: true, owner: { select: { name: true } } } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const items: ClientTicket[] = tickets.map((t) => ({
    id: t.id,
    deliveryId: t.deliveryId,
    projectName: t.delivery.project.name,
    devName: t.delivery.project.owner.name,
    amountXof: t.delivery.amountXof,
    status: t.status,
    clientClaim: t.clientClaim,
    devAnswer: t.devAnswer,
    devDueAt: t.devDueAt?.toISOString() ?? null,
    resolution: t.resolution,
    createdAt: t.createdAt.toISOString(),
  }));
  return Response.json({ items });
});
