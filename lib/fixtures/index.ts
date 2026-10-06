import type {
  ClientSpace,
  Delivery,
  DeliveryEvent,
  Payment,
  PayoutMethod,
  ProjectWithDeliveries,
  PublicDelivery,
  Ticket,
  User,
} from "@/lib/contracts";

// Fausses données conformes aux contrats, pour construire les écrans avant que l'API existe.
// Remplacer les imports de ce fichier par les vrais appels à /api/v1 au moment du branchement.
// Ne jamais importer ce fichier depuis lib/ côté serveur.

const BASE = "http://localhost:3000";

export const devUser: User = {
  id: "0b6f2c1e-1a2b-4c3d-8e4f-5a6b7c8d9e01",
  name: "Yao Kouadio",
  email: "yao@studio-lagune.ci",
  image: null,
  role: "dev",
  phone: "+2250707000001",
  businessName: "Studio Lagune",
};

export const clientUser: User = {
  id: "0b6f2c1e-1a2b-4c3d-8e4f-5a6b7c8d9e02",
  name: "Awa Koné",
  email: "awa@awacouture.ci",
  image: null,
  role: "client",
  phone: "+2250505000002",
  businessName: "Awa Couture",
};

export const payoutMethods: PayoutMethod[] = [
  {
    id: "3c1d0e2f-0000-4000-8000-000000000001",
    provider: "wave",
    phone: "+2250707000001",
    label: "Wave perso",
    active: true,
    createdAt: "2026-10-01T09:00:00Z",
  },
  {
    id: "3c1d0e2f-0000-4000-8000-000000000002",
    provider: "orange_money",
    phone: "+2250707000001",
    label: null,
    active: true,
    createdAt: "2026-10-01T09:05:00Z",
  },
];

const deliveryBase = {
  includeSource: true,
  currentBuildId: null,
  failure: null,
  pendingPaymentId: null,
  paidAt: null,
  deliveredAt: null,
  clientUrl: null,
  createdAt: "2026-10-02T10:00:00Z",
  updatedAt: "2026-10-03T08:00:00Z",
} satisfies Partial<Delivery>;

export const deliveries: Delivery[] = [
  {
    ...deliveryBase,
    id: "7a000000-0000-4000-8000-000000000001",
    projectId: "5e000000-0000-4000-8000-000000000001",
    status: "demo_ready",
    amountXof: 450_000,
    client: { name: "Awa Koné", email: "awa@awacouture.ci", phone: "+2250505000002", hasAccount: true },
    publicUrl: `${BASE}/l/tok-awa-couture`,
    demoUrl: "https://d-4f9a1c22.demo.localhost",
    expiresAt: "2026-11-01T10:00:00Z",
  },
  {
    ...deliveryBase,
    id: "7a000000-0000-4000-8000-000000000002",
    projectId: "5e000000-0000-4000-8000-000000000002",
    status: "demo_ready",
    amountXof: 1_200_000,
    client: { name: "Les Lauriers", email: null, phone: "+2250101000003", hasAccount: false },
    publicUrl: `${BASE}/l/tok-lauriers`,
    demoUrl: "https://d-8b2e7d10.demo.localhost",
    // Le client a déclaré son paiement : le dev doit confirmer.
    pendingPaymentId: "9d000000-0000-4000-8000-000000000001",
    expiresAt: "2026-10-10T10:00:00Z",
  },
  {
    ...deliveryBase,
    id: "7a000000-0000-4000-8000-000000000003",
    projectId: "5e000000-0000-4000-8000-000000000003",
    status: "delivered",
    amountXof: 100,
    client: { name: "Pharmacie Les Palmiers", email: "contact@palmiers.ci", phone: null, hasAccount: false },
    publicUrl: `${BASE}/l/tok-stocka`,
    demoUrl: null,
    clientUrl: "https://stocka.app.localhost",
    paidAt: "2026-10-03T14:02:00Z",
    deliveredAt: "2026-10-03T14:02:41Z",
    expiresAt: null,
  },
  {
    ...deliveryBase,
    id: "7a000000-0000-4000-8000-000000000004",
    projectId: "5e000000-0000-4000-8000-000000000003",
    status: "build_failed",
    amountXof: 250_000,
    client: { name: "Kader Traoré", email: "kader@exemple.ci", phone: null, hasAccount: false },
    publicUrl: `${BASE}/l/tok-kader`,
    demoUrl: null,
    failure: { code: "healthcheck", message: "L'application ne répond pas sur /health après 90 s. Vérifiez qu'elle écoute sur 0.0.0.0 et le port PORT." },
    expiresAt: "2026-11-02T10:00:00Z",
  },
];

export const projects: ProjectWithDeliveries[] = [
  {
    id: "5e000000-0000-4000-8000-000000000001",
    name: "Boutique Awa Couture",
    description: "Boutique en ligne de prêt-à-porter",
    createdAt: "2026-09-20T10:00:00Z",
    updatedAt: "2026-10-03T08:00:00Z",
    deliveries: [deliveries[0]],
  },
  {
    id: "5e000000-0000-4000-8000-000000000002",
    name: "Résidence Les Lauriers",
    description: "Gestion des réservations",
    createdAt: "2026-09-25T10:00:00Z",
    updatedAt: "2026-10-05T08:00:00Z",
    deliveries: [deliveries[1]],
  },
  {
    id: "5e000000-0000-4000-8000-000000000003",
    name: "Stocka",
    description: "Gestion de stock pour pharmacies",
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-10-03T14:02:41Z",
    deliveries: [deliveries[2], deliveries[3]],
  },
];

export const deliveryEvents: DeliveryEvent[] = [
  { id: "e0000000-0000-4000-8000-000000000001", type: "delivery.created", occurredAt: "2026-10-02T10:00:00Z", actor: `user:${devUser.id}`, payload: {} },
  { id: "e0000000-0000-4000-8000-000000000002", type: "source.submitted", occurredAt: "2026-10-02T10:05:00Z", actor: `user:${devUser.id}`, payload: {} },
  { id: "e0000000-0000-4000-8000-000000000003", type: "build.succeeded", occurredAt: "2026-10-02T10:07:12Z", actor: "system", payload: {} },
  { id: "e0000000-0000-4000-8000-000000000004", type: "space.ready", occurredAt: "2026-10-02T10:07:40Z", actor: "system", payload: { kind: "demo" } },
];

export const pendingPayment: Payment = {
  id: "9d000000-0000-4000-8000-000000000001",
  deliveryId: "7a000000-0000-4000-8000-000000000002",
  provider: "wave",
  payeePhone: "+2250707000001",
  amountXof: 1_200_000,
  status: "declared",
  payerName: "Moussa Bamba",
  payerPhone: "+2250101000003",
  transactionRef: "T_8KQ2M4XZ91",
  rejectionReason: null,
  declaredAt: "2026-10-05T16:20:00Z",
  decidedAt: null,
  expiresAt: "2026-10-07T16:20:00Z",
};

// Page /l/:token — un état par écran à dessiner.
export const publicDeliveryDemoReady: PublicDelivery = {
  projectName: "Boutique Awa Couture",
  devName: "Yao Kouadio",
  status: "demo_ready",
  amountXof: 450_000,
  demoUrl: "https://d-4f9a1c22.demo.localhost",
  clientUrl: null,
  payoutMethods: payoutMethods.map(({ id, provider, label, phone }) => ({ id, provider, label, phone })),
  activePayment: null,
  clientSpaceUrl: null,
  expiresAt: "2026-11-01T10:00:00Z",
};

export const publicDeliveryAwaitingConfirmation: PublicDelivery = {
  ...publicDeliveryDemoReady,
  activePayment: { id: pendingPayment.id, status: "declared" },
};

export const publicDeliveryDelivered: PublicDelivery = {
  ...publicDeliveryDemoReady,
  status: "delivered",
  demoUrl: null,
  clientUrl: "https://awa-couture.app.localhost",
  payoutMethods: [],
  activePayment: { id: pendingPayment.id, status: "confirmed" },
  clientSpaceUrl: `${BASE}/c/acc-awa-couture`,
  expiresAt: null,
};

export const publicDeliveryUnavailable: PublicDelivery = {
  ...publicDeliveryDemoReady,
  status: "unavailable",
  demoUrl: null,
  payoutMethods: [],
};

export const clientSpace: ClientSpace = {
  projectName: "Boutique Awa Couture",
  devName: "Yao Kouadio",
  appUrl: "https://awa-couture.app.localhost",
  status: "running",
  admin: { email: "awa@awacouture.ci", password: "Kx7-pQ2m-Zr9t" },
  invoice: { number: "RCT-2026-000001", url: `${BASE}/api/v1/public/client-space/acc-awa-couture/invoice.pdf` },
  sourceUrl: `${BASE}/api/v1/public/client-space/acc-awa-couture/source.zip`,
  lastBackupAt: "2026-10-06T02:00:00Z",
  deliveredAt: "2026-10-03T14:02:41Z",
};

export const openTicket: Ticket = {
  id: "71000000-0000-4000-8000-000000000001",
  deliveryId: "7a000000-0000-4000-8000-000000000002",
  paymentId: pendingPayment.id,
  status: "awaiting_dev",
  clientClaim: "J'ai payé 1 200 000 FCFA par Wave le 5 octobre, référence T_8KQ2M4XZ91. Le développeur ne confirme pas.",
  clientProofs: [`${BASE}/api/v1/files/proof-1.jpg`],
  devAnswer: null,
  devProofs: [],
  devDueAt: "2026-10-08T09:00:00Z",
  resolution: null,
  createdAt: "2026-10-06T09:00:00Z",
  resolvedAt: null,
};
