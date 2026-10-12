import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { deletionBlockers } from "@/lib/core/account";

// GET /api/v1/me/deletion — avant d'ouvrir la confirmation : ce qui bloque, et si le mot de passe sera demandé.
export const GET = handle(async (request) => {
  const current = await requireUser(request);
  const [blockers, credentials] = await Promise.all([
    deletionBlockers(current),
    prisma.account.count({ where: { userId: current.id, providerId: "credential" } }),
  ]);
  return Response.json({ blockers, requiresPassword: credentials > 0 });
});
