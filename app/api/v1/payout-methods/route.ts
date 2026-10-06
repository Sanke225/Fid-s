import { CreatePayoutMethodInput } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle, parseJson } from "@/lib/api/http";
import { toPayoutMethodDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/payout-methods — les numéros de réception actifs du dev.
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const methods = await prisma.payoutMethod.findMany({
    where: { userId: dev.id, active: true },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({ items: methods.map(toPayoutMethodDto) });
});

// POST /api/v1/payout-methods — réactive le numéro s'il avait été retiré auparavant.
export const POST = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const input = await parseJson(request, CreatePayoutMethodInput);
  const method = await prisma.payoutMethod.upsert({
    where: { userId_provider_phone: { userId: dev.id, provider: input.provider, phone: input.phone } },
    create: { userId: dev.id, provider: input.provider, phone: input.phone, label: input.label ?? null },
    update: { active: true, label: input.label ?? null },
  });
  return Response.json(toPayoutMethodDto(method), { status: 201 });
});
