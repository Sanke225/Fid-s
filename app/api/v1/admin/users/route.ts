import type { AdminUser } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";
import { isPlaceholderEmail } from "@/lib/core/placeholder-email";

// GET /api/v1/admin/users — comptes de la plateforme. Lecture seule : le rôle admin se donne par script.
export const GET = handle(async (request) => {
  await requireRole(request, "admin");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { _count: { select: { clientDeliveries: true } }, projects: { select: { _count: { select: { deliveries: true } } } } },
  });
  const items: AdminUser[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.deletedAt || isPlaceholderEmail(u.email) ? null : u.email,
    role: u.role,
    phone: u.phone,
    businessName: u.businessName,
    deliveriesCount: u.role === "dev" ? u.projects.reduce((n, p) => n + p._count.deliveries, 0) : u._count.clientDeliveries,
    createdAt: u.createdAt.toISOString(),
    deletedAt: u.deletedAt?.toISOString() ?? null,
  }));
  return Response.json({ items });
});
