import { z } from "zod";
import { AmountXof, Id, IsoDate } from "./common";
import { ProjectStatus, PublicDeliveryStatus } from "./deliveries";
import { PaymentProvider, PaymentStatus, PlatformFeeStatus } from "./payments";

// Espace client connecté (rôle client). Le client voit ses livraisons comme sur la page publique :
// jamais de détail technique (échecs d'installation, journaux) ni de donnée privée du dev.

export const ClientDelivery = z.object({
  id: Id,
  projectId: Id,
  projectName: z.string(),
  // Où en est le développement (assigné, en cours, terminé).
  projectStatus: ProjectStatus,
  devName: z.string(),
  status: PublicDeliveryStatus,
  amountXof: AmountXof,
  // Frais de service Fid’s (5 %) : statut nul tant que le dev n'a pas confirmé le dépôt.
  fee: z.object({ amountXof: AmountXof, status: z.enum(["due", "declared", "confirmed"]).nullable() }),
  // Lien de livraison : c'est là que le client teste, paie et règle les frais.
  publicUrl: z.url(),
  demoUrl: z.url().nullable(),
  clientUrl: z.url().nullable(),
  // Un paiement de ce client attend la confirmation du dev.
  paymentPending: z.boolean(),
  // Un ticket de ce client n'est pas encore tranché.
  ticketOpen: z.boolean(),
  expiresAt: IsoDate.nullable(),
  paidAt: IsoDate.nullable(),
  deliveredAt: IsoDate.nullable(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type ClientDelivery = z.infer<typeof ClientDelivery>;

// POST /api/v1/client/deliveries/claim — ajouter à son espace une livraison dont on a le lien.
export const ClaimDeliveryInput = z.object({
  // Le lien complet ou seulement le jeton final.
  link: z.string().trim().min(10).max(500),
});
export type ClaimDeliveryInput = z.infer<typeof ClaimDeliveryInput>;

// Historique des règlements du client : paiements au dev et frais Fid’s.
export const ClientPayment = z.object({
  id: Id,
  kind: z.enum(["dev", "fee"]),
  deliveryId: Id,
  projectName: z.string(),
  // Destinataire : le nom du dev, ou « Fid’s » pour les frais.
  payee: z.string(),
  provider: PaymentProvider,
  payeePhone: z.string(),
  amountXof: AmountXof,
  status: z.union([PaymentStatus, PlatformFeeStatus]),
  transactionRef: z.string(),
  rejectionReason: z.string().nullable(),
  declaredAt: IsoDate,
  decidedAt: IsoDate.nullable(),
});
export type ClientPayment = z.infer<typeof ClientPayment>;

// Facture émise à la passation (vue dev comme vue client).
export const InvoiceSummary = z.object({
  id: Id,
  number: z.string(),
  deliveryId: Id,
  projectName: z.string(),
  // Le client pour le dev, le dev pour le client.
  counterpart: z.string(),
  amountXof: AmountXof,
  issuedAt: IsoDate,
});
export type InvoiceSummary = z.infer<typeof InvoiceSummary>;

// Litige vu par le client : le ticket et la livraison concernée.
export const ClientTicket = z.object({
  id: Id,
  deliveryId: Id,
  projectName: z.string(),
  devName: z.string(),
  amountXof: AmountXof,
  status: z.enum(["open", "awaiting_dev", "resolved_released", "resolved_rejected"]),
  clientClaim: z.string(),
  devAnswer: z.string().nullable(),
  devDueAt: IsoDate.nullable(),
  resolution: z.string().nullable(),
  createdAt: IsoDate,
});
export type ClientTicket = z.infer<typeof ClientTicket>;
