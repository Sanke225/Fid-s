import { ChooseRoleInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { HttpError, handle, parseJson } from "@/lib/api/http";
import { toUserDto } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/session";

// POST /api/v1/me/role — une seule fois, juste après l'inscription (e-mail ou Google).
// Le schéma n'accepte que dev ou client : admin se donne par script (pnpm admin:promote).
export const POST = handle(async (request) => {
  const current = await requireUser(request);
  const { role } = await parseJson(request, ChooseRoleInput);

  // Condition « role IS NULL » dans la même requête : deux clics simultanés ne peuvent pas choisir deux fois.
  const { count } = await prisma.user.updateMany({ where: { id: current.id, role: null }, data: { role } });
  if (count === 0) {
    throw new HttpError(409, "ROLE_ALREADY_CHOSEN", "Le type de compte a déjà été choisi.");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: current.id } });
  return Response.json({ user: toUserDto(user) });
});
