import { APIError } from "better-auth/api";
import { DeleteAccountInput, UpdateMeInput } from "@/lib/contracts";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toUserDto } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/session";
import { deleteAccount } from "@/lib/core/account";

// GET /api/v1/me
export const GET = handle(async (request) => {
  const user = await requireUser(request, { allowPendingPassword: true });
  return Response.json({ user: toUserDto(user) });
});

// PATCH /api/v1/me
export const PATCH = handle(async (request) => {
  const current = await requireUser(request);
  const input = await parseJson(request, UpdateMeInput);
  const user = await prisma.user.update({ where: { id: current.id }, data: input });
  return Response.json({ user: toUserDto(user) });
});

// DELETE /api/v1/me — suppression du compte par son titulaire (anonymisation, voir lib/core/account.ts).
// Compte avec mot de passe : il est redemandé. Compte Google/GitHub seul : la saisie de « SUPPRIMER » suffit.
export const DELETE = handle(async (request) => {
  const current = await requireUser(request);
  const { password } = await parseJson(request, DeleteAccountInput);

  const hasPassword = (await prisma.account.count({ where: { userId: current.id, providerId: "credential" } })) > 0;
  if (hasPassword) {
    if (!password) throw new HttpError(422, "VALIDATION_ERROR", "Saisissez votre mot de passe pour confirmer.");
    try {
      await auth.api.verifyPassword({ headers: request.headers, body: { password } });
    } catch (error) {
      if (error instanceof APIError) throw new HttpError(422, "VALIDATION_ERROR", "Mot de passe incorrect.");
      throw error;
    }
  }

  await deleteAccount(current);
  return new Response(null, { status: 204 });
});
