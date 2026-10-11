import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { clientDeliveryInclude, toClientDeliveryDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/client/deliveries — les livraisons rattachées au compte du client connecté
// (au paiement, ou ajoutées avec leur lien).
export const GET = handle(async (request) => {
  const client = await requireRole(request, "client");
  const deliveries = await prisma.delivery.findMany({
    where: { clientUserId: client.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: clientDeliveryInclude,
  });
  return Response.json({ items: deliveries.map(toClientDeliveryDto) });
});
