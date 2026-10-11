import { ClaimDeliveryInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { clientDeliveryInclude, toClientDeliveryDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// Jeton d'un lien de livraison : « https://…/l/<jeton> », « /l/<jeton> » ou le jeton seul.
function tokenFrom(link: string) {
  const match = link.match(/\/l\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : /^[A-Za-z0-9_-]+$/.test(link) ? link : null;
}

// POST /api/v1/client/deliveries/claim — le client ajoute à son espace une livraison dont il a le lien.
// Avoir le lien donne déjà accès à la livraison : on ne révèle rien de plus. Une livraison déjà
// rattachée à un autre compte reste à cet autre compte.
export const POST = handle(async (request) => {
  const client = await requireRole(request, "client");
  const { link } = await parseJson(request, ClaimDeliveryInput);
  const token = tokenFrom(link);
  const notFound = new HttpError(404, "DELIVERY_NOT_FOUND", "Ce lien ne correspond à aucune livraison disponible.");
  if (!token) throw notFound;

  const claimed = await prisma.$transaction(async (tx) => {
    const found = await tx.delivery.findUnique({ where: { publicToken: token }, select: { id: true } });
    if (!found) throw notFound;
    await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${found.id} FOR UPDATE`;
    const current = await tx.delivery.findUniqueOrThrow({ where: { id: found.id }, select: { status: true, clientUserId: true } });
    if (current.status === "cancelled" || current.status === "expired") throw notFound;
    if (current.clientUserId && current.clientUserId !== client.id) {
      throw new HttpError(409, "CONFLICT", "Cette livraison est déjà rattachée à un autre compte client.");
    }
    if (!current.clientUserId) {
      await tx.delivery.update({ where: { id: found.id }, data: { clientUserId: client.id } });
      await recordEvent(tx, { deliveryId: found.id, type: "delivery.claimed", actor: `user:${client.id}`, payload: {} });
    }
    return tx.delivery.findUniqueOrThrow({ where: { id: found.id }, include: clientDeliveryInclude });
  });

  return Response.json(toClientDeliveryDto(claimed));
});
