import { z } from "zod";
import { AmountXof, Id, IsoDate } from "./common";
import { DeliveryStatus } from "./deliveries";
import { UserRole } from "./users";

// GET /api/v1/admin/stats — vue d'ensemble de la plateforme.
export const AdminStats = z.object({
  users: z.object({ dev: z.int(), client: z.int(), admin: z.int(), noRole: z.int() }),
  deliveries: z.object({ total: z.int(), online: z.int(), awaitingFee: z.int(), delivered: z.int() }),
  // Montant total payé aux devs (dépôts confirmés) et frais Fid’s confirmés.
  volumeXof: z.int(),
  feesXof: z.int(),
  todo: z.object({ feesToConfirm: z.int(), ticketsToDecide: z.int(), ticketsAwaitingDev: z.int() }),
});
export type AdminStats = z.infer<typeof AdminStats>;

// GET /api/v1/admin/deliveries
export const AdminDelivery = z.object({
  id: Id,
  projectName: z.string(),
  devName: z.string(),
  devEmail: z.email(),
  clientName: z.string(),
  hasClientAccount: z.boolean(),
  status: DeliveryStatus,
  amountXof: AmountXof,
  publicUrl: z.url(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type AdminDelivery = z.infer<typeof AdminDelivery>;

// GET /api/v1/admin/users
export const AdminUser = z.object({
  id: Id,
  name: z.string(),
  // Nul pour un compte client créé sans e-mail, ou un compte supprimé.
  email: z.string().nullable(),
  role: UserRole.nullable(),
  phone: z.string().nullable(),
  businessName: z.string().nullable(),
  // dev : livraisons créées ; client : livraisons rattachées.
  deliveriesCount: z.int(),
  createdAt: IsoDate,
  deletedAt: IsoDate.nullable(),
});
export type AdminUser = z.infer<typeof AdminUser>;

// GET /api/v1/admin/events — journal de la plateforme (audit).
export const AdminEvent = z.object({
  id: Id,
  type: z.string(),
  actor: z.string(),
  occurredAt: IsoDate,
  deliveryId: Id,
  projectName: z.string(),
  devName: z.string(),
});
export type AdminEvent = z.infer<typeof AdminEvent>;
