import { requestDemoReset } from "@/lib/core/preview";
import { requirePreviewUser } from "@/lib/core/preview-host";
import { HttpError, handle } from "@/lib/api/http";
import { previewOrigin } from "@/lib/spaces";

type Context = { params: Promise<{ deliveryId: string }> };

// POST apercu.<domaine>/api/<livraison>/reset — les démos sont « même site » que cet hôte :
// on exige que la requête vienne de la page d'aperçu elle-même (en-tête Origin), pas d'une démo voisine.
export const POST = handle<Context>(async (request, { params }) => {
  if (request.headers.get("origin") !== previewOrigin()) {
    throw new HttpError(403, "FORBIDDEN", "Requête refusée.");
  }
  const user = await requirePreviewUser();
  const { deliveryId } = await params;
  const build = await requestDemoReset(deliveryId, user);
  return Response.json({ buildId: build.id }, { status: 202 });
});
