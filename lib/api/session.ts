import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/contracts";
import { HttpError } from "./http";

// allowPendingPassword : seules /me et /me/password l'acceptent, pour qu'un compte créé par un dev
// remplace son mot de passe provisoire avant toute autre action.
export async function requireUser(request: Request, { allowPendingPassword = false } = {}) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new HttpError(401, "UNAUTHENTICATED", "Connectez-vous pour continuer.");
  }
  if (session.user.mustChangePassword && !allowPendingPassword) {
    throw new HttpError(403, "PASSWORD_CHANGE_REQUIRED", "Choisissez votre mot de passe pour continuer.");
  }
  return session.user;
}

// Le contrôle se fait ici, côté serveur, sur chaque route : masquer un bouton dans l'interface ne protège rien.
export async function requireRole(request: Request, role: UserRole) {
  const user = await requireUser(request);
  if (user.role !== role) {
    throw new HttpError(403, "FORBIDDEN", "Cette action n'est pas autorisée pour votre compte.");
  }
  return user;
}
