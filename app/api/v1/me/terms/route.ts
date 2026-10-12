import { AcceptTermsInput, type TermsStatus } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { requireUser } from "@/lib/api/session";
import { TERMS_VERSION } from "@/lib/legal";

const statusOf = (user: { termsVersion: string | null; termsAcceptedAt: Date | null }): TermsStatus => ({
  currentVersion: TERMS_VERSION,
  acceptedVersion: user.termsVersion,
  acceptedAt: user.termsAcceptedAt?.toISOString() ?? null,
});

// GET /api/v1/me/terms — l'espace affiche la fenêtre d'acceptation tant que acceptedVersion ≠ currentVersion.
export const GET = handle(async (request) => {
  const current = await requireUser(request);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: current.id }, select: { termsVersion: true, termsAcceptedAt: true } });
  return Response.json(statusOf(user));
});

// POST /api/v1/me/terms — enregistre la date et la version acceptées (preuve du consentement).
export const POST = handle(async (request) => {
  const current = await requireUser(request);
  const { version } = await parseJson(request, AcceptTermsInput);
  if (version !== TERMS_VERSION) {
    throw new HttpError(409, "TERMS_VERSION_OUTDATED", "Les conditions ont été mises à jour entre-temps : rechargez la page pour lire la nouvelle version.");
  }
  const user = await prisma.user.update({
    where: { id: current.id },
    data: { termsVersion: TERMS_VERSION, termsAcceptedAt: new Date() },
    select: { termsVersion: true, termsAcceptedAt: true },
  });
  return Response.json(statusOf(user));
});
