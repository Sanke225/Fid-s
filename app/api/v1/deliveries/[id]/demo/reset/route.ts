import { requestDemoReset } from "@/lib/core/preview";
import { handle } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// POST /api/v1/deliveries/:id/demo/reset — remet la démo dans son état de départ (données de démo).
export const POST = handle<Context>(async (request, { params }) => {
  const user = await requireUser(request);
  const { id } = await params;
  const build = await requestDemoReset(id, user);
  return Response.json({ buildId: build.id }, { status: 202 });
});
