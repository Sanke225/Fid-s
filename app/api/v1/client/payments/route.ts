import type { ClientPayment } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { handle } from "@/lib/api/http";
import { requireRole } from "@/lib/api/session";

const BRAND = "Fid’s";

// GET /api/v1/client/payments — ce que le client a réglé : paiements au dev et frais Fid’s,
// du plus récent au plus ancien, sur les livraisons rattachées à son compte.
export const GET = handle(async (request) => {
  const client = await requireRole(request, "client");
  const deliveryWhere = { clientUserId: client.id };
  const deliverySelect = { select: { project: { select: { name: true, owner: { select: { name: true } } } } } };

  const [payments, fees] = await Promise.all([
    prisma.payment.findMany({ where: { delivery: deliveryWhere }, include: { delivery: deliverySelect }, orderBy: { declaredAt: "desc" }, take: 200 }),
    prisma.platformFee.findMany({ where: { delivery: deliveryWhere }, include: { delivery: deliverySelect }, orderBy: { declaredAt: "desc" }, take: 200 }),
  ]);

  const items: ClientPayment[] = [
    ...payments.map((p) => ({
      id: p.id,
      kind: "dev" as const,
      deliveryId: p.deliveryId,
      projectName: p.delivery.project.name,
      payee: p.delivery.project.owner.name,
      provider: p.provider,
      payeePhone: p.payeePhone,
      amountXof: p.amountXof,
      status: p.status,
      transactionRef: p.transactionRef,
      rejectionReason: p.rejectionReason,
      declaredAt: p.declaredAt.toISOString(),
      decidedAt: p.decidedAt?.toISOString() ?? null,
    })),
    ...fees.map((f) => ({
      id: f.id,
      kind: "fee" as const,
      deliveryId: f.deliveryId,
      projectName: f.delivery.project.name,
      payee: BRAND,
      provider: f.provider,
      payeePhone: f.payeePhone,
      amountXof: f.amountXof,
      status: f.status,
      transactionRef: f.transactionRef,
      rejectionReason: f.rejectionReason,
      declaredAt: f.declaredAt.toISOString(),
      decidedAt: f.decidedAt?.toISOString() ?? null,
    })),
  ].sort((a, b) => b.declaredAt.localeCompare(a.declaredAt));

  return Response.json({ items });
});
