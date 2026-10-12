import { prisma } from "@/lib/db";
import { transitionProject } from "@/lib/core/projects";
import { handle } from "@/lib/api/http";
import { projectClientSelect, toProjectDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ projectId: string }> };

// POST /api/v1/projects/:projectId/start — le dev clique « Début du développement ».
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { projectId } = await params;
  await transitionProject(projectId, dev.id, "project.started");
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId }, include: projectClientSelect });
  return Response.json(toProjectDto(project));
});
