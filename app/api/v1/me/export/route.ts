import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { exportAccountData } from "@/lib/core/account";

// GET /api/v1/me/export — téléchargement JSON de ses données (droit d'accès, loi n° 2013-450).
export const GET = handle(async (request) => {
  const current = await requireUser(request);
  const data = await exportAccountData(current.id);
  const day = data.generatedAt.slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="fids-mes-donnees-${day}.json"`,
      "Cache-Control": "no-store",
    },
  });
});
