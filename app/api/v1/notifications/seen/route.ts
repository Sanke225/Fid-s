import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";

// POST /api/v1/notifications/seen — « tout marquer comme lu » : la cloche repart de maintenant.
export const POST = handle(async (request) => {
  const user = await requireUser(request);
  await prisma.user.update({ where: { id: user.id }, data: { notificationsSeenAt: new Date() } });
  return new Response(null, { status: 204 });
});
