import { PlatformFeeStatus } from "@/lib/contracts";
import type { AdminFee } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { toPlatformFeeDto } from "@/lib/api/serializers";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/admin/fees?status=declared — frais Fid’s à vérifier sur les comptes Mobile Money de Fid’s.
export const GET = handle(async (request) => {
  await requireRole(request, "admin");
  const statusParam = new URL(request.url).searchParams.get("status");
  const status = statusParam ? PlatformFeeStatus.parse(statusParam) : undefined;

  const fees = await prisma.platformFee.findMany({
    where: status ? { status } : {},
    // File à confirmer : la plus ancienne d'abord. Décisions passées : les plus récentes d'abord.
    orderBy: { declaredAt: status === "declared" ? "asc" : "desc" },
    take: 100,
    include: { delivery: { select: { amountXof: true, clientName: true, project: { select: { name: true } } } } },
  });
  const items: AdminFee[] = fees.map(({ delivery, ...fee }) => ({
    ...toPlatformFeeDto(fee),
    projectName: delivery.project.name,
    clientName: delivery.clientName,
    deliveryAmountXof: delivery.amountXof,
  }));
  return Response.json({ items });
});
