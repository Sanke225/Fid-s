import type { DeliveryEvent } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { findOwnedDelivery } from "@/lib/core/deliveries";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/deliveries/:id/events?after=<eventId> — historique, du plus ancien au plus récent.
// Le front interroge toutes les 2 s avec le dernier id reçu pour n'avoir que les nouveautés.
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const delivery = await findOwnedDelivery(dev.id, id);

  const afterId = new URL(request.url).searchParams.get("after");
  const after = afterId
    ? await prisma.event.findFirst({ where: { id: afterId, deliveryId: delivery.id }, select: { occurredAt: true } })
    : null;

  const events = await prisma.event.findMany({
    where: { deliveryId: delivery.id, ...(after ? { occurredAt: { gt: after.occurredAt } } : {}) },
    orderBy: { occurredAt: "asc" },
    take: 100,
  });

  const items: DeliveryEvent[] = events.map((event) => ({
    id: event.id,
    type: event.type,
    occurredAt: event.occurredAt.toISOString(),
    actor: event.actor,
    payload: event.payload,
  }));
  return Response.json({ items });
});
