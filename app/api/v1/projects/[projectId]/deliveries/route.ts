import { randomBytes } from "node:crypto";
import { CreateDeliveryInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { recordEvent } from "@/lib/core/events";
import { handle, notFound, parseJson } from "@/lib/api/http";
import { deliveryInclude, toDeliveryDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ projectId: string }> };

// POST /api/v1/projects/:projectId/deliveries — crée une livraison en brouillon (draft).
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { projectId } = await params;
  const input = await parseJson(request, CreateDeliveryInput);

  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: dev.id }, select: { id: true } });
  if (!project) throw notFound("Projet introuvable.");

  const delivery = await prisma.$transaction(async (tx) => {
    const created = await tx.delivery.create({
      data: {
        projectId: project.id,
        // 32 octets aléatoires : le lien de livraison n'est pas devinable.
        publicToken: randomBytes(32).toString("base64url"),
        amountXof: input.amountXof,
        includeSource: input.includeSource,
        clientName: input.client.name,
        clientEmail: input.client.email ?? null,
        clientPhone: input.client.phone ?? null,
      },
      include: deliveryInclude,
    });
    await recordEvent(tx, {
      deliveryId: created.id,
      type: "delivery.created",
      actor: `user:${dev.id}`,
      payload: { amountXof: created.amountXof },
    });
    return created;
  });

  return Response.json(toDeliveryDto(delivery), { status: 201 });
});
