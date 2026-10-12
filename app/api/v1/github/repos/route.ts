import { prisma } from "@/lib/db";
import { githubConfigured, installationRepos } from "@/lib/github";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/github/repos — dépôts autorisés par le dev, tous comptes GitHub confondus.
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  if (!githubConfigured()) return Response.json({ configured: false, accounts: [], items: [] });
  const installs = await prisma.githubInstallation.findMany({ where: { userId: dev.id }, orderBy: { createdAt: "asc" } });
  const items = (
    await Promise.all(
      installs.map(async (i) =>
        (await installationRepos(i.installationId).catch(() => [])).map((r) => ({ ...r, installationId: i.id, account: i.accountLogin })),
      ),
    )
  )
    .flat()
    .sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""));
  return Response.json({ configured: true, accounts: installs.map((i) => i.accountLogin), items });
});
