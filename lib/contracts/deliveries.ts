import { z } from "zod";
import { AmountXof, Id, IsoDate, Phone } from "./common";
import { PaymentProvider, PaymentStatus } from "./payments";

export const DeliveryStatus = z.enum([
  "draft",
  "building",
  "build_failed",
  "demo_ready",
  "paid",
  "handing_over",
  "handover_failed",
  "delivered",
  "expired",
  "cancelled",
]);
export type DeliveryStatus = z.infer<typeof DeliveryStatus>;

// Ce que voit le client : jamais le détail d'un échec technique.
export const PublicDeliveryStatus = z.enum([
  "preparing",
  "demo_ready",
  "paid",
  "handing_over",
  "delivered",
  "unavailable",
]);
export type PublicDeliveryStatus = z.infer<typeof PublicDeliveryStatus>;

export function toPublicStatus(status: DeliveryStatus): PublicDeliveryStatus {
  switch (status) {
    case "draft":
    case "building":
    case "build_failed":
      return "preparing";
    case "handover_failed":
      return "handing_over";
    case "expired":
    case "cancelled":
      return "unavailable";
    default:
      return status;
  }
}

export const Project = z.object({
  id: Id,
  name: z.string(),
  description: z.string().nullable(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Project = z.infer<typeof Project>;

export const DeliveryClient = z.object({
  name: z.string(),
  email: z.email().nullable(),
  phone: z.string().nullable(),
  // Vrai si le client a un compte Recette relié à cette livraison.
  hasAccount: z.boolean(),
});

// Vue du dev.
export const Delivery = z.object({
  id: Id,
  projectId: Id,
  status: DeliveryStatus,
  amountXof: AmountXof,
  includeSource: z.boolean(),
  client: DeliveryClient,
  // Lien de livraison à envoyer au client : https://DOMAINE/l/<token>
  publicUrl: z.url(),
  // Non nul à partir de demo_ready.
  demoUrl: z.url().nullable(),
  // Non nul à delivered.
  clientUrl: z.url().nullable(),
  currentBuildId: Id.nullable(),
  failure: z.object({ code: z.string(), message: z.string() }).nullable(),
  // Paiement déclaré par le client et en attente de la confirmation du dev.
  pendingPaymentId: Id.nullable(),
  expiresAt: IsoDate.nullable(),
  paidAt: IsoDate.nullable(),
  deliveredAt: IsoDate.nullable(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Delivery = z.infer<typeof Delivery>;

export const ProjectWithDeliveries = Project.extend({
  deliveries: z.array(Delivery),
});
export type ProjectWithDeliveries = z.infer<typeof ProjectWithDeliveries>;

// Moyen de paiement du dev tel que le client le voit au moment de payer.
export const PublicPayoutMethod = z.object({
  id: Id,
  provider: PaymentProvider,
  label: z.string().nullable(),
  phone: z.string(),
});
export type PublicPayoutMethod = z.infer<typeof PublicPayoutMethod>;

// Vue du client : GET /api/v1/public/deliveries/:token. Rien de privé (ni e-mail du dev, ni journaux).
export const PublicDelivery = z.object({
  projectName: z.string(),
  devName: z.string(),
  status: PublicDeliveryStatus,
  amountXof: AmountXof,
  demoUrl: z.url().nullable(),
  clientUrl: z.url().nullable(),
  // Vide = paiement indisponible (le dev n'a enregistré aucun moyen de paiement).
  payoutMethods: z.array(PublicPayoutMethod),
  // Paiement en cours du client, seulement avec le bon en-tête X-Payer-Token.
  activePayment: z.object({ id: Id, status: PaymentStatus }).nullable(),
  // Lien vers l'espace client, seulement avec le bon X-Payer-Token, une fois livré.
  clientSpaceUrl: z.url().nullable(),
  expiresAt: IsoDate.nullable(),
});
export type PublicDelivery = z.infer<typeof PublicDelivery>;

export const DeliveryEvent = z.object({
  id: Id,
  type: z.string(),
  occurredAt: IsoDate,
  actor: z.string(),
  payload: z.unknown(),
});
export type DeliveryEvent = z.infer<typeof DeliveryEvent>;

// POST /api/v1/projects
export const CreateProjectInput = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectInput>;

const ClientInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().optional(),
  phone: Phone.optional(),
});

// POST /api/v1/projects/:projectId/deliveries
export const CreateDeliveryInput = z.object({
  amountXof: AmountXof,
  includeSource: z.boolean().default(true),
  client: ClientInput,
});
export type CreateDeliveryInput = z.infer<typeof CreateDeliveryInput>;

// PATCH /api/v1/deliveries/:id — refusé (DELIVERY_NOT_EDITABLE) si un paiement est déclaré ou confirmé.
export const UpdateDeliveryInput = z.object({
  amountXof: AmountXof.optional(),
  includeSource: z.boolean().optional(),
  client: ClientInput.partial().optional(),
});
export type UpdateDeliveryInput = z.infer<typeof UpdateDeliveryInput>;

// Espace client : GET /api/v1/public/client-space/:accessToken
export const ClientSpace = z.object({
  projectName: z.string(),
  devName: z.string(),
  appUrl: z.url(),
  status: z.enum(["running", "failed"]),
  // Affiché une seule fois, sur cette page uniquement ; jamais dans un e-mail.
  admin: z.object({ email: z.email(), password: z.string() }).nullable(),
  invoice: z.object({ number: z.string(), url: z.url() }),
  // Nul si includeSource = false.
  sourceUrl: z.url().nullable(),
  lastBackupAt: IsoDate.nullable(),
  deliveredAt: IsoDate,
});
export type ClientSpace = z.infer<typeof ClientSpace>;
