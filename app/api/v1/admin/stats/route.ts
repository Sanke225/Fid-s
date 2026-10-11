import type { AdminStats } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/admin/stats — chiffres réels de la plateforme (aucune donnée inventée).
export const GET = handle(async (request) => {
  await requireRole(request, "admin");
  const [roles, statuses, paid, fees, feesToConfirm, ticketsToDecide, ticketsAwaitingDev] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.delivery.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.payment.aggregate({ where: { status: "confirmed" }, _sum: { amountXof: true } }),
    prisma.platformFee.aggregate({ where: { status: "confirmed" }, _sum: { amountXof: true } }),
    prisma.platformFee.count({ where: { status: "declared" } }),
    prisma.ticket.count({ where: { status: "open" } }),
    prisma.ticket.count({ where: { status: "awaiting_dev" } }),
  ]);
  const role = (r: string | null) => roles.find((x) => x.role === r)?._count._all ?? 0;
  const st = (s: string) => statuses.find((x) => x.status === s)?._count._all ?? 0;
  const body: AdminStats = {
    users: { dev: role("dev"), client: role("client"), admin: role("admin"), noRole: role(null) },
    deliveries: {
      total: statuses.reduce((n, x) => n + x._count._all, 0),
      online: st("demo_ready"),
      awaitingFee: st("fee_pending"),
      delivered: st("delivered"),
    },
    volumeXof: paid._sum.amountXof ?? 0,
    feesXof: fees._sum.amountXof ?? 0,
    todo: { feesToConfirm, ticketsToDecide, ticketsAwaitingDev },
  };
  return Response.json(body);
});
