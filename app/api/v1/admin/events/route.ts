import type { AdminEvent } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/admin/events — les 200 derniers événements de la plateforme, pour l'audit.
export const GET = handle(async (request) => {
  await requireRole(request, "admin");
  const events = await prisma.event.findMany({
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { delivery: { select: { project: { select: { name: true, owner: { select: { name: true } } } } } } },
  });
  const items: AdminEvent[] = events.map((e) => ({
    id: e.id,
    type: e.type,
    actor: e.actor,
    occurredAt: e.occurredAt.toISOString(),
    deliveryId: e.deliveryId,
    projectName: e.delivery.project.name,
    devName: e.delivery.project.owner.name,
  }));
  return Response.json({ items });
});
