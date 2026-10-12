import { LinkGithubInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { assertRepoAllowed, ownedInstallation } from "@/lib/core/github-link";
import { repoBranches } from "@/lib/github";
import { HttpError, handle, notFound, parseJson } from "@/lib/api/http";
import { projectClientSelect, toProjectDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ projectId: string }> };

// PUT /api/v1/projects/:projectId/github — relie (ou change) le dépôt GitHub du projet.
export const PUT = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { projectId } = await params;
  const input = await parseJson(request, LinkGithubInput);
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: dev.id }, select: { id: true, status: true } });
  if (!project) throw notFound("Projet introuvable.");
  if (project.status === "finished") throw new HttpError(409, "INVALID_TRANSITION", "Le projet est terminé : sa version est figée.");

  const inst = await ownedInstallation(dev.id, input.installationId);
  const repo = await assertRepoAllowed(inst.installationId, input.repo);
  if (!(await repoBranches(inst.installationId, repo.fullName)).includes(input.branch)) {
    throw new HttpError(404, "NOT_FOUND", "Branche introuvable dans ce dépôt.");
  }
  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { githubInstallationId: inst.id, githubRepo: repo.fullName, githubBranch: input.branch },
    include: projectClientSelect,
  });
  return Response.json(toProjectDto(updated));
});

// DELETE /api/v1/projects/:projectId/github — retire le lien (le code déjà importé reste).
export const DELETE = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { projectId } = await params;
  const { count } = await prisma.project.updateMany({
    where: { id: projectId, ownerId: dev.id },
    data: { githubInstallationId: null, githubRepo: null, githubBranch: null },
  });
  if (!count) throw notFound("Projet introuvable.");
  return new Response(null, { status: 204 });
});
