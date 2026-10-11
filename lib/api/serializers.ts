import { toPublicStatus } from "@/lib/contracts";
import type {
  Delivery as DeliveryDto,
  Payment as PaymentDto,
  PayoutMethod as PayoutMethodDto,
  PlatformFee as PlatformFeeDto,
  ClientDelivery as ClientDeliveryDto,
  Project as ProjectDto,
  PublicDelivery as PublicDeliveryDto,
  Ticket as TicketDto,
  User as UserDto,
  UserRole,
} from "@/lib/contracts";
import type { Delivery, Payment, PayoutMethod, PlatformFee, Project, Space, Ticket, User } from "@/lib/generated/prisma/client";
import type { PlatformFeeStatus, TicketStatus } from "@/lib/generated/prisma/enums";
import { computeFee, platformPayoutMethods } from "@/lib/payments/fee";

// Conversion base → contrats. Tout ce qui sort de l'API passe par ici : un champ absent d'ici n'est jamais exposé.

// Adresse publique de l'application (liens de livraison, espace client).
export function appUrl(path: string) {
  return new URL(path, process.env.BETTER_AUTH_URL ?? "http://localhost:3000").toString();
}

const iso = (date: Date) => date.toISOString();
const isoOrNull = (date: Date | null) => (date ? date.toISOString() : null);

// Accepte la ligne Prisma comme l'utilisateur de session Better Auth (champs facultatifs).
type UserLike = Pick<User, "id" | "name" | "email"> & {
  image?: string | null;
  role?: string | null;
  phone?: string | null;
  businessName?: string | null;
};

export function toUserDto(user: UserLike): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: (user.role ?? null) as UserRole | null,
    phone: user.phone ?? null,
    businessName: user.businessName ?? null,
  };
}

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: iso(project.createdAt),
    updatedAt: iso(project.updatedAt),
  };
}

// Relations à charger pour sérialiser une livraison (voir deliveryInclude).
export type DeliveryWithRelations = Delivery & {
  spaces: Pick<Space, "kind" | "hostname">[];
  payments: Pick<Payment, "id">[];
  platformFees: Pick<PlatformFee, "status" | "expiresAt">[];
};

// Statuts de frais pris en compte (tableau mutable : Prisma refuse un tuple « as const »).
const FEE_SHOWN: PlatformFeeStatus[] = ["declared", "confirmed"];
const UNRESOLVED_TICKET_STATUSES: TicketStatus[] = ["open", "awaiting_dev"];

// Les espaces en ligne (pour demoUrl / clientUrl) et le paiement déclaré en attente du dev.
export const deliveryInclude = {
  spaces: { where: { status: "running" }, select: { kind: true, hostname: true } },
  payments: { where: { status: "declared" }, select: { id: true }, orderBy: { declaredAt: "desc" }, take: 1 },
  // Dernier paiement de frais Fid’s déclaré ou confirmé.
  platformFees: {
    where: { status: { in: FEE_SHOWN } },
    select: { status: true, expiresAt: true },
    orderBy: { declaredAt: "desc" },
    take: 1,
  },
} as const;

// Où en sont les frais de service Fid’s ? Nul avant la confirmation du dépôt par le dev.
export function feeStatusOf(delivery: Pick<Delivery, "status">, latest: Pick<PlatformFee, "status" | "expiresAt"> | undefined) {
  if (delivery.status === "fee_pending") {
    return latest?.status === "declared" && latest.expiresAt > new Date() ? "declared" : "due";
  }
  if (["paid", "handing_over", "handover_failed", "delivered"].includes(delivery.status)) return "confirmed";
  return null;
}

export function toDeliveryDto(delivery: DeliveryWithRelations): DeliveryDto {
  const demo = delivery.spaces.find((space) => space.kind === "demo");
  const client = delivery.spaces.find((space) => space.kind === "client");
  return {
    id: delivery.id,
    projectId: delivery.projectId,
    status: delivery.status,
    amountXof: delivery.amountXof,
    includeSource: delivery.includeSource,
    client: {
      name: delivery.clientName,
      email: delivery.clientEmail,
      phone: delivery.clientPhone,
      hasAccount: delivery.clientUserId !== null,
    },
    publicUrl: appUrl(`/l/${delivery.publicToken}`),
    demoUrl: demo ? `https://${demo.hostname}` : null,
    clientUrl: client ? `https://${client.hostname}` : null,
    currentBuildId: delivery.currentBuildId,
    failure:
      delivery.failureCode && delivery.failureMessage
        ? { code: delivery.failureCode, message: delivery.failureMessage }
        : null,
    pendingPaymentId: delivery.payments[0]?.id ?? null,
    fee: { amountXof: computeFee(delivery.amountXof), status: feeStatusOf(delivery, delivery.platformFees[0]) },
    expiresAt: isoOrNull(delivery.expiresAt),
    paidAt: isoOrNull(delivery.paidAt),
    deliveredAt: isoOrNull(delivery.deliveredAt),
    createdAt: iso(delivery.createdAt),
    updatedAt: iso(delivery.updatedAt),
  };
}

export function toPayoutMethodDto(method: PayoutMethod): PayoutMethodDto {
  return {
    id: method.id,
    provider: method.provider,
    phone: method.phone,
    label: method.label,
    active: method.active,
    createdAt: iso(method.createdAt),
  };
}

export function toPaymentDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    deliveryId: payment.deliveryId,
    provider: payment.provider,
    payeePhone: payment.payeePhone,
    amountXof: payment.amountXof,
    status: payment.status,
    payerName: payment.payerName,
    payerPhone: payment.payerPhone,
    transactionRef: payment.transactionRef,
    rejectionReason: payment.rejectionReason,
    declaredAt: iso(payment.declaredAt),
    decidedAt: isoOrNull(payment.decidedAt),
    expiresAt: iso(payment.expiresAt),
  };
}

export type PublicDeliveryWithRelations = Delivery & {
  project: Pick<Project, "name"> & { owner: Pick<User, "name"> & { payoutMethods: PayoutMethod[] } };
  spaces: Pick<Space, "kind" | "hostname">[];
};

export const publicDeliveryInclude = {
  project: {
    select: {
      name: true,
      owner: { select: { name: true, payoutMethods: { where: { active: true }, orderBy: { createdAt: "asc" } } } },
    },
  },
  spaces: { where: { status: "running" }, select: { kind: true, hostname: true } },
} as const;

// Vue du client. payerPayment : le paiement correspondant au X-Payer-Token envoyé, s'il y en a un.
export function toPublicDeliveryDto(
  delivery: PublicDeliveryWithRelations,
  payerPayment: Pick<Payment, "id" | "status"> | null,
  payerFee: Pick<PlatformFee, "id" | "status"> | null = null,
  // Client connecté propriétaire de la livraison : mêmes droits que l'appareil qui a payé.
  isOwner = false,
): PublicDeliveryDto {
  const status = toPublicStatus(delivery.status);
  const base = {
    projectName: delivery.project.name,
    devName: delivery.project.owner.name,
    status,
    amountXof: delivery.amountXof,
    expiresAt: isoOrNull(delivery.expiresAt),
  };
  if (status === "unavailable") {
    return {
      ...base,
      demoUrl: null,
      clientUrl: null,
      payoutMethods: [],
      activePayment: null,
      clientSpaceUrl: null,
      fee: { amountXof: computeFee(delivery.amountXof), payoutMethods: [], activeFee: null },
    };
  }

  const demo = delivery.spaces.find((space) => space.kind === "demo");
  const client = delivery.spaces.find((space) => space.kind === "client");
  // Le lien vers l'espace client (identifiants, facture) n'est donné qu'à l'appareil qui a payé.
  const isPayer = payerPayment?.status === "confirmed" || isOwner;
  return {
    ...base,
    // La démo reste consultable tant que les frais Fid’s ne sont pas réglés : rien d'autre n'est remis.
    demoUrl: (status === "demo_ready" || status === "awaiting_fee") && demo ? `https://${demo.hostname}` : null,
    clientUrl: status === "delivered" && client ? `https://${client.hostname}` : null,
    payoutMethods:
      status === "demo_ready"
        ? delivery.project.owner.payoutMethods.map(({ id, provider, label, phone }) => ({ id, provider, label, phone }))
        : [],
    activePayment: payerPayment ? { id: payerPayment.id, status: payerPayment.status } : null,
    clientSpaceUrl:
      isPayer && status === "delivered" && delivery.clientAccessToken
        ? appUrl(`/c/${delivery.clientAccessToken}`)
        : null,
    fee: {
      amountXof: computeFee(delivery.amountXof),
      // Les numéros de Fid’s ne sont montrés qu'à l'appareil qui a payé le dev, au moment de régler les frais.
      payoutMethods: isPayer && status === "awaiting_fee" ? platformPayoutMethods() : [],
      activeFee: isPayer && payerFee ? { id: payerFee.id, status: payerFee.status } : null,
    },
  };
}

export function toPlatformFeeDto(fee: PlatformFee): PlatformFeeDto {
  return {
    id: fee.id,
    deliveryId: fee.deliveryId,
    provider: fee.provider,
    payeePhone: fee.payeePhone,
    amountXof: fee.amountXof,
    status: fee.status,
    payerName: fee.payerName,
    payerPhone: fee.payerPhone,
    transactionRef: fee.transactionRef,
    rejectionReason: fee.rejectionReason,
    declaredAt: iso(fee.declaredAt),
    decidedAt: isoOrNull(fee.decidedAt),
    expiresAt: iso(fee.expiresAt),
  };
}

export function toTicketDto(ticket: Ticket): TicketDto {
  return {
    id: ticket.id,
    deliveryId: ticket.deliveryId,
    paymentId: ticket.paymentId,
    status: ticket.status,
    clientClaim: ticket.clientClaim,
    // Pièces jointes : à venir avec le stockage chiffré des fichiers.
    clientProofs: [],
    devAnswer: ticket.devAnswer,
    devProofs: [],
    devDueAt: isoOrNull(ticket.devDueAt),
    resolution: ticket.resolution,
    createdAt: iso(ticket.createdAt),
    resolvedAt: isoOrNull(ticket.resolvedAt),
  };
}

// Espace client : la livraison telle que le client la voit (statut public, aucun détail technique).
export const clientDeliveryInclude = {
  project: { select: { name: true, owner: { select: { name: true } } } },
  spaces: { where: { status: "running" }, select: { kind: true, hostname: true } },
  payments: { where: { status: "declared" }, select: { id: true }, take: 1 },
  tickets: { where: { status: { in: UNRESOLVED_TICKET_STATUSES } }, select: { id: true }, take: 1 },
  platformFees: {
    where: { status: { in: FEE_SHOWN } },
    select: { status: true, expiresAt: true },
    orderBy: { declaredAt: "desc" },
    take: 1,
  },
} as const;

export type ClientDeliveryWithRelations = Delivery & {
  project: Pick<Project, "name"> & { owner: Pick<User, "name"> };
  spaces: Pick<Space, "kind" | "hostname">[];
  payments: Pick<Payment, "id">[];
  tickets: Pick<Ticket, "id">[];
  platformFees: Pick<PlatformFee, "status" | "expiresAt">[];
};

export function toClientDeliveryDto(delivery: ClientDeliveryWithRelations): ClientDeliveryDto {
  const status = toPublicStatus(delivery.status);
  const demo = delivery.spaces.find((space) => space.kind === "demo");
  const client = delivery.spaces.find((space) => space.kind === "client");
  return {
    id: delivery.id,
    projectName: delivery.project.name,
    devName: delivery.project.owner.name,
    status,
    amountXof: delivery.amountXof,
    fee: { amountXof: computeFee(delivery.amountXof), status: feeStatusOf(delivery, delivery.platformFees[0]) },
    publicUrl: appUrl(`/l/${delivery.publicToken}`),
    demoUrl: (status === "demo_ready" || status === "awaiting_fee") && demo ? `https://${demo.hostname}` : null,
    clientUrl: status === "delivered" && client ? `https://${client.hostname}` : null,
    paymentPending: delivery.payments.length > 0,
    ticketOpen: delivery.tickets.length > 0,
    expiresAt: isoOrNull(delivery.expiresAt),
    paidAt: isoOrNull(delivery.paidAt),
    deliveredAt: isoOrNull(delivery.deliveredAt),
    createdAt: iso(delivery.createdAt),
    updatedAt: iso(delivery.updatedAt),
  };
}
