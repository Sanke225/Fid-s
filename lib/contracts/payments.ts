import { z } from "zod";
import { AmountXof, Id, IsoDate, Phone } from "./common";

// Recette ne détient jamais d'argent : le client paie le dev directement, puis déclare son paiement ;
// le dev confirme la réception (ou l'admin, après un ticket).

export const PaymentProvider = z.enum(["wave", "orange_money", "moov_money", "mtn_momo"]);
export type PaymentProvider = z.infer<typeof PaymentProvider>;

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProvider, string> = {
  wave: "Wave",
  orange_money: "Orange Money",
  moov_money: "Moov Money",
  mtn_momo: "MTN MoMo",
};

export const PaymentStatus = z.enum(["declared", "confirmed", "rejected", "expired"]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

// Numéro de réception du dev (vue du dev).
export const PayoutMethod = z.object({
  id: Id,
  provider: PaymentProvider,
  phone: z.string(),
  label: z.string().nullable(),
  active: z.boolean(),
  createdAt: IsoDate,
});
export type PayoutMethod = z.infer<typeof PayoutMethod>;

// POST /api/v1/payout-methods
export const CreatePayoutMethodInput = z.object({
  provider: PaymentProvider,
  phone: Phone,
  label: z.string().trim().max(50).optional(),
});
export type CreatePayoutMethodInput = z.infer<typeof CreatePayoutMethodInput>;

export const Payment = z.object({
  id: Id,
  deliveryId: Id,
  provider: PaymentProvider,
  // Numéro du dev sur lequel le client a payé.
  payeePhone: z.string(),
  amountXof: AmountXof,
  status: PaymentStatus,
  payerName: z.string(),
  payerPhone: z.string(),
  transactionRef: z.string(),
  rejectionReason: z.string().nullable(),
  declaredAt: IsoDate,
  decidedAt: IsoDate.nullable(),
  expiresAt: IsoDate,
});
export type Payment = z.infer<typeof Payment>;

// POST /api/v1/public/deliveries/:token/payments — le client déclare avoir payé.
// Le montant n'est jamais envoyé par le client : il est copié depuis la livraison.
export const DeclarePaymentInput = z.object({
  payoutMethodId: Id,
  payerName: z.string().trim().min(2).max(100),
  payerPhone: Phone,
  // Référence lue dans le SMS de confirmation de l'opérateur.
  transactionRef: z.string().trim().min(4).max(64),
});
export type DeclarePaymentInput = z.infer<typeof DeclarePaymentInput>;

// Réponse : le payerToken est à garder par le navigateur du client (en-tête X-Payer-Token).
export const DeclarePaymentResult = z.object({
  payment: Payment,
  payerToken: z.string(),
});
export type DeclarePaymentResult = z.infer<typeof DeclarePaymentResult>;

// POST /api/v1/payments/:id/confirm — le dev a bien reçu l'argent : c'est le déblocage.
// POST /api/v1/payments/:id/reject — le dev n'a rien reçu.
export const RejectPaymentInput = z.object({
  reason: z.string().trim().min(5).max(500),
});
export type RejectPaymentInput = z.infer<typeof RejectPaymentInput>;

export const TicketStatus = z.enum(["open", "awaiting_dev", "resolved_released", "resolved_rejected"]);
export type TicketStatus = z.infer<typeof TicketStatus>;

export const Ticket = z.object({
  id: Id,
  deliveryId: Id,
  paymentId: Id,
  status: TicketStatus,
  clientClaim: z.string(),
  clientProofs: z.array(z.url()),
  devAnswer: z.string().nullable(),
  devProofs: z.array(z.url()),
  // Le dev doit répondre avant cette date (48 h).
  devDueAt: IsoDate.nullable(),
  resolution: z.string().nullable(),
  createdAt: IsoDate,
  resolvedAt: IsoDate.nullable(),
});
export type Ticket = z.infer<typeof Ticket>;

// POST /api/v1/public/payments/:paymentId/tickets (avec X-Payer-Token).
// Possible si le dev a refusé le paiement, ou n'a pas répondu dans les 48 h.
// Pièces jointes (captures de SMS) : à venir, avec le stockage chiffré des fichiers.
export const OpenTicketInput = z.object({
  claim: z.string().trim().min(10).max(2000),
});
export type OpenTicketInput = z.infer<typeof OpenTicketInput>;

// POST /api/v1/tickets/:id/answer — réponse du dev.
// acknowledgePayment : le dev reconnaît finalement avoir reçu l'argent → paiement confirmé, ticket clos.
export const AnswerTicketInput = z.object({
  answer: z.string().trim().min(5).max(2000),
  acknowledgePayment: z.boolean().default(false),
});
export type AnswerTicketInput = z.infer<typeof AnswerTicketInput>;

// POST /api/v1/admin/tickets/:id/resolve — décision de l'admin, journalisée.
export const ResolveTicketInput = z.object({
  decision: z.enum(["release", "reject"]),
  resolution: z.string().trim().min(10).max(2000),
});
export type ResolveTicketInput = z.infer<typeof ResolveTicketInput>;

// Vue de l'admin pour trancher : le ticket, le paiement déclaré et la livraison.
export const AdminTicketDetail = z.object({
  ticket: Ticket,
  payment: Payment,
  delivery: z.object({
    id: Id,
    status: z.string(),
    amountXof: AmountXof,
    projectName: z.string(),
    clientName: z.string(),
    dev: z.object({ id: Id, name: z.string(), email: z.email(), phone: z.string().nullable() }),
  }),
});
export type AdminTicketDetail = z.infer<typeof AdminTicketDetail>;
