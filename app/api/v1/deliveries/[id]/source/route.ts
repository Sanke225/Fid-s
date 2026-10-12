import { submitSource, MAX_ARCHIVE_BYTES } from "@/lib/core/sources";
import { HttpError, handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/deliveries/:id/source — formulaire multipart, champ « archive » (.zip, 50 Mo max).
// Met une installation en file ; le worker construit puis met la démo en ligne.
export const POST = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;

  // Refus avant lecture du corps quand la taille annoncée dépasse déjà la limite.
  const announced = Number(request.headers.get("content-length") ?? 0);
  if (announced > MAX_ARCHIVE_BYTES + 1024 * 1024) {
    throw new HttpError(413, "ARCHIVE_TOO_LARGE", "L’archive dépasse 50 Mo.");
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get("archive");
  if (!(file instanceof File)) throw new HttpError(422, "ARCHIVE_INVALID", "Joignez l’archive .zip du projet (champ « archive »).");

  const build = await submitSource(id, dev.id, { name: file.name, data: Buffer.from(await file.arrayBuffer()) });
  return Response.json({ buildId: build.id, status: build.status }, { status: 202 });
});
