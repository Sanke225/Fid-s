import type { InvoiceSummary } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/invoices — factures émises au nom du dev connecté (une par livraison remise).
export const GET = handle(async (request) => {
  const dev = await requireRole(request, "dev");
  const invoices = await prisma.invoice.findMany({
    where: { delivery: { project: { ownerId: dev.id } } },
    include: { delivery: { select: { clientName: true, project: { select: { name: true } } } } },
    orderBy: { issuedAt: "desc" },
    take: 200,
  });
  const items: InvoiceSummary[] = invoices.map((i) => ({
    id: i.id,
    number: i.number,
    deliveryId: i.deliveryId,
    projectName: i.delivery.project.name,
    counterpart: i.delivery.clientName,
    amountXof: i.amountXof,
    issuedAt: i.issuedAt.toISOString(),
  }));
  return Response.json({ items });
});
