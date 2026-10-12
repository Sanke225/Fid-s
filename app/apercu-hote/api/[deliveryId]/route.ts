import { previewFor } from "@/lib/core/preview";
import { requirePreviewUser } from "@/lib/core/preview-host";
import { handle } from "@/lib/api/http";

type Context = { params: Promise<{ deliveryId: string }> };

// GET apercu.<domaine>/api/<livraison> — état de l'aperçu (suivi des mises à jour).
export const GET = handle<Context>(async (_request, { params }) => {
  const user = await requirePreviewUser();
  const { deliveryId } = await params;
  return Response.json(await previewFor(deliveryId, user), { headers: { "Cache-Control": "no-store" } });
});
