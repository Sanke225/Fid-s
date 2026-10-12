import { AssignClientInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { assignClient } from "@/lib/core/projects";
import { handle, parseJson } from "@/lib/api/http";
import { deliveryInclude, projectClientSelect, toDeliveryDto, toProjectDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ projectId: string }> };

// POST /api/v1/projects/:projectId/client — assigne un client (existant ou créé ici) et crée la livraison.
// Si le compte vient d'être créé, la réponse contient ses identifiants provisoires : c'est la seule fois.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { projectId } = await params;
  const input = await parseJson(request, AssignClientInput);

  const { deliveryId, credentials } = await assignClient(projectId, dev.id, input);

  const [project, delivery] = await Promise.all([
    prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: projectClientSelect }),
    prisma.delivery.findUniqueOrThrow({ where: { id: deliveryId }, include: deliveryInclude }),
  ]);
  return Response.json(
    { project: toProjectDto(project), delivery: toDeliveryDto(delivery), credentials },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
});
