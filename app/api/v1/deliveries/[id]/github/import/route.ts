import { prisma } from "@/lib/db";
import { MAX_ARCHIVE_BYTES, submitSource } from "@/lib/core/sources";
import { downloadZipball, latestCommit } from "@/lib/github";
import { HttpError, handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/deliveries/:id/github/import — « Importer le dernier commit » de la branche reliée au projet.
// On télécharge l'archive du commit précis (SHA), puis même circuit qu'un .zip envoyé à la main.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;
  const delivery = await prisma.delivery.findFirst({
    where: { id, project: { ownerId: dev.id } },
    select: { id: true, project: { select: { githubRepo: true, githubBranch: true, githubInstallation: { select: { installationId: true } } } } },
  });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Livraison introuvable.");
  const { githubRepo: repo, githubBranch: branch, githubInstallation: inst } = delivery.project;
  if (!repo || !branch || !inst) throw new HttpError(409, "INVALID_TRANSITION", "Reliez d’abord un dépôt GitHub au projet.");

  const commit = await latestCommit(inst.installationId, repo, branch);
  const data = await downloadZipball(inst.installationId, repo, commit.sha, MAX_ARCHIVE_BYTES);
  const build = await submitSource(delivery.id, dev.id, { name: `${repo.replace("/", "-")}-${commit.sha.slice(0, 7)}.zip`, data }, { repo, ...commit });
  return Response.json({ buildId: build.id, commit }, { status: 202 });
});
