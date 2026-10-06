import { prisma } from "@/lib/db";
import { handle, notFound } from "@/lib/api/http";
import { deliveryInclude, toDeliveryDto, toProjectDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ projectId: string }> };

// GET /api/v1/projects/:projectId — le projet et ses livraisons.
export const GET = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { projectId } = await params;

  // ownerId dans le filtre : le projet d'un autre dev répond 404, comme s'il n'existait pas.
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: dev.id },
    include: { deliveries: { include: deliveryInclude, orderBy: { createdAt: "desc" } } },
  });
  if (!project) throw notFound("Projet introuvable.");

  return Response.json({ ...toProjectDto(project), deliveries: project.deliveries.map(toDeliveryDto) });
});
