import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/contracts";
import { HttpError } from "./http";

export async function requireUser(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw new HttpError(401, "UNAUTHENTICATED", "Connectez-vous pour continuer.");
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
