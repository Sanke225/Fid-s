import { ownedInstallation } from "@/lib/core/github-link";
import { repoBranches } from "@/lib/github";
import { HttpError, handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/github/branches?installation=<id>&repo=owner/nom
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const params = new URL(request.url).searchParams;
  const repo = params.get("repo");
  if (!repo) throw new HttpError(422, "VALIDATION_ERROR", "Dépôt manquant.");
  const inst = await ownedInstallation(dev.id, params.get("installation") ?? "");
  return Response.json({ items: await repoBranches(inst.installationId, repo) });
});
