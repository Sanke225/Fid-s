import { prisma } from "@/lib/db";
import { readState } from "@/lib/core/github-link";
import { exchangeUserCode, userInstallations } from "@/lib/github";
import { appUrl } from "@/lib/api/serializers";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/github/setup — retour de GitHub (« Setup URL » et « Callback URL » de l'App).
// On ne croit pas le numéro d'installation reçu dans l'adresse : on relie seulement les installations
// que le compte GitHub du dev voit réellement (code OAuth → GET /user/installations).
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const params = new URL(request.url).searchParams;
  const state = readState(params.get("state"));
  const back = (status: string, to = state?.r ?? "/dev/projects") => Response.redirect(appUrl(`${to}?github=${status}`), 302);

  // GitHub ne renvoie pas toujours « state » (autorisation demandée à l'installation) : la session Fid’s
  // désigne alors le dev. S'il est présent, il doit être valide et au nom de ce dev.
  if (params.has("state") && (!state || state.u !== dev.id)) return back("refuse", "/dev/projects");
  const code = params.get("code");
  if (!code) return back("incomplet");

  const visible = await userInstallations(await exchangeUserCode(code));
  for (const inst of visible) {
    const installationId = BigInt(inst.id);
    const existing = await prisma.githubInstallation.findUnique({ where: { installationId } });
    // Déjà reliée à un autre compte Fid’s (organisation partagée) : on ne la lui retire pas.
    if (existing && existing.userId !== dev.id) continue;
    await prisma.githubInstallation.upsert({
      where: { installationId },
      create: { userId: dev.id, installationId, accountLogin: inst.account.login },
      update: { accountLogin: inst.account.login },
    });
  }
  return back(visible.length ? "connecte" : "aucun");
});
