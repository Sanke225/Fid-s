import { signState, safeDevReturn } from "@/lib/core/github-link";
import { installUrl } from "@/lib/github";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/github/install?retour=/dev/new — navigation : envoie le dev choisir ses dépôts sur GitHub.
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const retour = safeDevReturn(new URL(request.url).searchParams.get("retour"));
  return Response.redirect(installUrl(signState(dev.id, retour)), 302);
});
