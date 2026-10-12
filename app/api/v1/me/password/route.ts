import { APIError } from "better-auth/api";
import { ChangePasswordInput } from "@/lib/contracts";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toUserDto } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/session";

// POST /api/v1/me/password — remplace le mot de passe. Seule route (avec GET /me) ouverte à un compte
// qui a encore son mot de passe provisoire ; les autres sessions du compte sont fermées.
export const POST = handle(async (request) => {
  const current = await requireUser(request, { allowPendingPassword: true });
  const input = await parseJson(request, ChangePasswordInput);
  if (input.newPassword === input.currentPassword) {
    throw new HttpError(422, "VALIDATION_ERROR", "Choisissez un mot de passe différent du mot de passe provisoire.");
  }

  try {
    await auth.api.changePassword({
      headers: request.headers,
      body: { currentPassword: input.currentPassword, newPassword: input.newPassword, revokeOtherSessions: true },
    });
  } catch (error) {
    if (error instanceof APIError && error.body?.code === "INVALID_PASSWORD") {
      throw new HttpError(422, "VALIDATION_ERROR", "Mot de passe actuel incorrect.");
    }
    throw error;
  }

  const user = await prisma.user.update({ where: { id: current.id }, data: { mustChangePassword: false } });
  return Response.json({ user: toUserDto(user) });
});
