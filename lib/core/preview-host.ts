import { cookies } from "next/headers";
import { HttpError } from "@/lib/api/http";
import { prisma } from "@/lib/db";
import { previewCookieName, verifyPreviewSession } from "@/lib/preview-token";

// Utilisateur de l'hôte d'aperçu, d'après son cookie propre (posé par /t/<jeton>). Null si absent ou expiré.
export async function previewUser() {
  const token = (await cookies()).get(previewCookieName())?.value;
  const session = verifyPreviewSession(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.u }, select: { id: true, role: true, mustChangePassword: true } });
  return user && !user.mustChangePassword ? user : null;
}

export async function requirePreviewUser() {
  const user = await previewUser();
  if (!user) throw new HttpError(401, "UNAUTHENTICATED", "Session d’aperçu expirée : rouvrez l’aperçu depuis Fid’s.");
  return user;
}
