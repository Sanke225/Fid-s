import { DeliveryStatus, type AdminDelivery } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { appUrl } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/admin/deliveries?status=… — toutes les livraisons de la plateforme, les plus récentes d'abord.
export const GET = handle(async (request) => {
  await requireRole(request, "admin");
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam ? DeliveryStatus.parse(statusParam) : undefined;
  const deliveries = await prisma.delivery.findMany({
    where: status ? { status } : {},
    include: { project: { select: { name: true, owner: { select: { name: true, email: true } } } } },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  const items: AdminDelivery[] = deliveries.map((d) => ({
    id: d.id,
    projectName: d.project.name,
    devName: d.project.owner.name,
    devEmail: d.project.owner.email,
    clientName: d.clientName,
    hasClientAccount: d.clientUserId !== null,
    status: d.status,
    amountXof: d.amountXof,
    publicUrl: appUrl(`/l/${d.publicToken}`),
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));
  return Response.json({ items });
});
