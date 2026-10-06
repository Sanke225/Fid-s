import { CreateProjectInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle, parseJson } from "@/lib/api/http";
import { toProjectDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/projects — les projets du dev connecté uniquement.
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const projects = await prisma.project.findMany({
    where: { ownerId: dev.id },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return Response.json({ items: projects.map(toProjectDto) });
});

// POST /api/v1/projects
export const POST = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const input = await parseJson(request, CreateProjectInput);
  const project = await prisma.project.create({
    data: { ownerId: dev.id, name: input.name, description: input.description ?? null },
  });
  return Response.json(toProjectDto(project), { status: 201 });
});
