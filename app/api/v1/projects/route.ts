import { CreateProjectInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle, parseJson } from "@/lib/api/http";
import { deliveryInclude, projectClientSelect, toDeliveryDto, toProjectDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/projects — les projets du dev connecté uniquement, chacun avec ses livraisons
// (plus récente en premier) : la liste et le tableau de bord n'ont besoin que d'un appel.
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const projects = await prisma.project.findMany({
    where: { ownerId: dev.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { ...projectClientSelect, deliveries: { include: deliveryInclude, orderBy: { createdAt: "desc" } } },
  });
  return Response.json({
    items: projects.map((project) => ({ ...toProjectDto(project), deliveries: project.deliveries.map(toDeliveryDto) })),
  });
});

// POST /api/v1/projects
export const POST = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const input = await parseJson(request, CreateProjectInput);
  const project = await prisma.project.create({
    data: { ownerId: dev.id, name: input.name, description: input.description ?? null },
    include: projectClientSelect,
  });
  return Response.json(toProjectDto(project), { status: 201 });
});
