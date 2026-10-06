import { prisma } from "@/lib/db";
import { HttpError, handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

type Context = { params: Promise<{ id: string }> };

// DELETE /api/v1/payout-methods/:id — le numéro n'est plus proposé aux clients.
// Désactivé plutôt que supprimé : les paiements passés doivent garder leur trace.
export const DELETE = handle<Context>(async (request, { params }) => {
  const dev = await requireRole(request, "dev");
  const { id } = await params;

  const { count } = await prisma.payoutMethod.updateMany({
    where: { id, userId: dev.id, active: true },
    data: { active: false },
  });
  if (count === 0) {
    throw new HttpError(404, "PAYOUT_METHOD_NOT_FOUND", "Moyen de paiement introuvable.");
  }
  return new Response(null, { status: 204 });
});
