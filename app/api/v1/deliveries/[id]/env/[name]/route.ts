import { assertEnvEditable, findEditableDelivery } from "@/lib/core/env-vars";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string; name: string }> };

// DELETE /api/v1/deliveries/:id/env/:name
export const DELETE = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id, name } = await params;
  const delivery = await findEditableDelivery(id, dev.id);
  assertEnvEditable(delivery.project.status);
  await prisma.deliveryEnvVar.deleteMany({ where: { deliveryId: delivery.id, name } });
  return new Response(null, { status: 204 });
});
