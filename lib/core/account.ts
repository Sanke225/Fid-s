import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/api/http";
import { isPlaceholderEmail } from "@/lib/core/placeholder-email";
import type { DeliveryStatus } from "@/lib/generated/prisma/enums";

// Livraisons où de l'argent est en jeu : le compte ne peut pas disparaître tant qu'elles ne sont pas terminées.
const MONEY_AT_STAKE: DeliveryStatus[] = ["demo_ready", "fee_pending", "paid", "handing_over", "handover_failed"];
const UNRESOLVED_TICKETS = ["open", "awaiting_dev"] as const;

/**
 * Ce qui empêche de supprimer le compte maintenant (vide = suppression possible).
 * Dev : livraisons en cours de paiement ou de passation, projets en cours avec un client, litiges ouverts.
 * Client : livraison payée mais pas encore remise, litiges ouverts.
 */
export async function deletionBlockers(user: { id: string; role?: string | null }): Promise<string[]> {
  if (user.role === "admin") {
    return ["Un compte administrateur ne se supprime pas lui-même : demandez à un autre administrateur de lui retirer ce rôle."];
  }
  const blockers: string[] = [];
  if (user.role === "dev") {
    const [deliveries, projects, tickets] = await Promise.all([
      prisma.delivery.count({ where: { project: { ownerId: user.id }, status: { in: MONEY_AT_STAKE } } }),
      prisma.project.count({ where: { ownerId: user.id, status: { in: ["assigned", "in_progress"] } } }),
      prisma.ticket.count({ where: { delivery: { project: { ownerId: user.id } }, status: { in: [...UNRESOLVED_TICKETS] } } }),
    ]);
    if (deliveries) blockers.push(`${deliveries} livraison(s) en attente de paiement ou de passation : remettez-les ou annulez-les.`);
    if (projects) blockers.push(`${projects} projet(s) en cours avec un client : terminez-les ou retirez le client.`);
    if (tickets) blockers.push(`${tickets} litige(s) en cours : attendez la décision.`);
  }
  if (user.role === "client") {
    const [deliveries, tickets] = await Promise.all([
      prisma.delivery.count({ where: { clientUserId: user.id, status: { in: ["fee_pending", "paid", "handing_over", "handover_failed"] } } }),
      prisma.ticket.count({ where: { openedById: user.id, status: { in: [...UNRESOLVED_TICKETS] } } }),
    ]);
    if (deliveries) blockers.push(`${deliveries} livraison(s) déjà payée(s) mais pas encore remise(s) : attendez la remise de votre application.`);
    if (tickets) blockers.push(`${tickets} litige(s) en cours : attendez la décision.`);
  }
  return blockers;
}

/**
 * Supprime le compte par anonymisation : les données personnelles sont effacées, les moyens de connexion
 * et les sessions supprimés. La ligne users reste, sous un nom neutre, parce que paiements, factures et
 * projets y sont rattachés (conservation comptable, clés étrangères Restrict).
 */
export async function deleteAccount(user: { id: string; role?: string | null }) {
  const blockers = await deletionBlockers(user);
  if (blockers.length) {
    throw new HttpError(409, "ACCOUNT_DELETION_BLOCKED", "Votre compte ne peut pas encore être supprimé.", { blockers });
  }

  await prisma.$transaction(async tx => {
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.githubInstallation.deleteMany({ where: { userId: user.id } });
    // Numéros jamais utilisés : supprimés. Les autres restent attachés aux paiements, mais désactivés.
    await tx.payoutMethod.deleteMany({ where: { userId: user.id, payments: { none: {} } } });
    await tx.payoutMethod.updateMany({ where: { userId: user.id }, data: { active: false, label: null } });
    await tx.user.update({
      where: { id: user.id },
      data: {
        name: "Compte supprimé",
        email: `supprime-${user.id}@deleted.fids.invalid`,
        emailVerified: false,
        image: null,
        phone: null,
        businessName: null,
        username: null,
        mustChangePassword: false,
        deletedAt: new Date(),
      },
    });
  });
}

const iso = (d: Date | null | undefined) => d?.toISOString() ?? null;

/** Toutes les données personnelles du compte, lisibles (droit d'accès). Jamais de secret ni de jeton. */
export async function exportAccountData(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      accounts: { select: { providerId: true, createdAt: true } },
      sessions: { select: { createdAt: true, expiresAt: true, ipAddress: true, userAgent: true } },
      payoutMethods: { select: { provider: true, phone: true, label: true, active: true, createdAt: true } },
      githubInstallations: { select: { accountLogin: true, createdAt: true } },
    },
  });

  const deliverySelect = {
    id: true,
    status: true,
    amountXof: true,
    clientName: true,
    clientEmail: true,
    clientPhone: true,
    createdAt: true,
    paidAt: true,
    deliveredAt: true,
    project: { select: { name: true } },
    payments: { select: { provider: true, payeePhone: true, amountXof: true, status: true, payerName: true, payerPhone: true, transactionRef: true, declaredAt: true, decidedAt: true, rejectionReason: true } },
    platformFees: { select: { provider: true, amountXof: true, status: true, payerName: true, payerPhone: true, transactionRef: true, declaredAt: true, decidedAt: true, rejectionReason: true } },
    tickets: { select: { status: true, clientClaim: true, devAnswer: true, resolution: true, createdAt: true, resolvedAt: true } },
  } as const;

  const [asDev, asClient] = await Promise.all([
    user.role === "dev"
      ? prisma.project.findMany({
          where: { ownerId: userId },
          orderBy: { createdAt: "asc" },
          select: { name: true, description: true, status: true, createdAt: true, deliveries: { select: deliverySelect } },
        })
      : Promise.resolve([]),
    prisma.delivery.findMany({ where: { clientUserId: userId }, orderBy: { createdAt: "asc" }, select: deliverySelect }),
  ]);

  return {
    format: "fids-export-v1",
    generatedAt: new Date().toISOString(),
    account: {
      id: user.id,
      name: user.name,
      email: isPlaceholderEmail(user.email) ? null : user.email,
      emailVerified: user.emailVerified,
      username: user.username,
      role: user.role,
      phone: user.phone,
      businessName: user.businessName,
      image: user.image,
      createdAt: iso(user.createdAt),
      termsVersion: user.termsVersion,
      termsAcceptedAt: iso(user.termsAcceptedAt),
    },
    loginMethods: user.accounts.map(a => ({ provider: a.providerId, linkedAt: iso(a.createdAt) })),
    sessions: user.sessions.map(s => ({ ...s, createdAt: iso(s.createdAt), expiresAt: iso(s.expiresAt) })),
    payoutMethods: user.payoutMethods.map(p => ({ ...p, createdAt: iso(p.createdAt) })),
    githubAccounts: user.githubInstallations.map(g => ({ login: g.accountLogin, connectedAt: iso(g.createdAt) })),
    projects: asDev,
    deliveriesAsClient: asClient,
  };
}
