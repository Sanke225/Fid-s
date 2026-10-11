import type { InvoiceSummary } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

// GET /api/v1/client/invoices — factures reçues par le client (émises à la passation).
export const GET = handle(async (request) => {
  const client = await requireRole(request, "client");
  const invoices = await prisma.invoice.findMany({
    where: { delivery: { clientUserId: client.id } },
    include: { delivery: { select: { project: { select: { name: true, owner: { select: { name: true } } } } } } },
    orderBy: { issuedAt: "desc" },
    take: 200,
  });
  const items: InvoiceSummary[] = invoices.map((i) => ({
    id: i.id,
    number: i.number,
    deliveryId: i.deliveryId,
    projectName: i.delivery.project.name,
    counterpart: i.delivery.project.owner.name,
    amountXof: i.amountXof,
    issuedAt: i.issuedAt.toISOString(),
  }));
  return Response.json({ items });
});
