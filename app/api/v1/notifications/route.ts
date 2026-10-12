import { prisma } from "@/lib/db";
import { notificationsFor } from "@/lib/core/notifications";
import { HttpError, handle } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import type { UserRole } from "@/lib/contracts";

// GET /api/v1/notifications — la cloche : événements récents sur les livraisons du compte.
export const GET = handle(async (request) => {
  const user = await requireUser(request);
  if (!user.role) throw new HttpError(403, "FORBIDDEN", "Choisissez d’abord votre type de compte.");
  const { notificationsSeenAt } = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { notificationsSeenAt: true } });
  return Response.json(await notificationsFor({ id: user.id, role: user.role as UserRole }, notificationsSeenAt));
});
