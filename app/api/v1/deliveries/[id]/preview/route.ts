import { previewFor } from "@/lib/core/preview";
import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// GET /api/v1/deliveries/:id/preview — le dev du projet ou le client assigné.
export const GET = handle<Context>(async (request, { params }) => {
  const user = await requireUser(request);
  const { id } = await params;
  return Response.json(await previewFor(id, user));
});
