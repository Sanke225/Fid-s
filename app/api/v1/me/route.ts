import { UpdateMeInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle, parseJson } from "@/lib/api/http";
import { toUserDto } from "@/lib/api/serializers";
import { requireUser } from "@/lib/api/session";

// GET /api/v1/me
export const GET = handle(async (request) => {
  const user = await requireUser(request);
  return Response.json({ user: toUserDto(user) });
});

// PATCH /api/v1/me
export const PATCH = handle(async (request) => {
  const current = await requireUser(request);
  const input = await parseJson(request, UpdateMeInput);
  const user = await prisma.user.update({ where: { id: current.id }, data: input });
  return Response.json({ user: toUserDto(user) });
});
