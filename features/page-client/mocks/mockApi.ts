/**
 * Faux backend de la page client. Il respecte le contrat de `PublicApi` (6.2 / 6.3)
 * et applique les mêmes règles que le vrai : montant copié depuis la livraison,
 * déblocage uniquement par confirmation « serveur », jeton payeur pour l'espace client.
 *
 * L'état vit dans localStorage : deux onglets du même navigateur le partagent,
 * ce qui permet de rejouer la démo « grand écran + téléphone » sans backend.
 */
import { ApiError, type PublicApi } from '../lib/api'
import type {
  ClientSpace,
  CreatePaymentInput,
  Payment,
  Provider,
  PublicDelivery,
  PublicDeliveryStatus,
} from '../lib/contracts'
import { readStorage, removeStorage, writeStorage } from '../lib/storage'

/* ------------------------------------------------------------------ */
/* Modèle interne (miroir simplifié des tables deliveries / payments)  */
/* ------------------------------------------------------------------ */

type DeliveryStatus =
  | 'draft'
  | 'building'
  | 'build_failed'
  | 'demo_ready'
  | 'paid'
  | 'handing_over'
  | 'handover_failed'
  | 'delivered'
  | 'expired'
  | 'cancelled'

interface MockPayment extends Payment {
  payerToken: string
  payer: CreatePaymentInput['payer']
}

interface MockDelivery {
  id: string
  publicToken: string
  projectName: string
  devName: string
  status: DeliveryStatus
  amountXof: number
  includeSource: boolean
  slug: string
  paymentMethods: Provider[]
  expiresAt: string | null
  paidAt: string | null
  deliveredAt: string | null
  clientAccessToken: string | null
  adminPassword: string | null
  invoiceNumber: string | null
  payments: MockPayment[]
}

interface MockDb {
  version: 1
  invoiceSeq: number
  deliveries: MockDelivery[]
}

const STORAGE_KEY = 'recette.mock.db.v1'

/** Durées de la passation simulée (comme FakeHandover : quelques secondes). */
const PAID_PHASE_MS = 1_500
const HANDOVER_PHASE_MS = 4_500
const PAYMENT_TTL_MS = 20 * 60_000
const DAY_MS = 86_400_000

/* ------------------------------------------------------------------ */
/* Jeu de données                                                      */
/* ------------------------------------------------------------------ */

function randomId(): string {
  return crypto.randomUUID()
}

function randomSecret(length = 24): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

function iso(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString()
}

function baseDelivery(overrides: Partial<MockDelivery> & Pick<MockDelivery, 'publicToken'>): MockDelivery {
  return {
    id: randomId(),
    projectName: 'Gestion de stock',
    devName: 'Awa Traoré · Studio Baobab',
    status: 'demo_ready',
    amountXof: 150_000,
    includeSource: true,
    slug: 'gestion-stock',
    paymentMethods: ['wave'],
    expiresAt: iso(26 * DAY_MS),
    paidAt: null,
    deliveredAt: null,
    clientAccessToken: null,
    adminPassword: null,
    invoiceNumber: null,
    payments: [],
    ...overrides,
  }
}

/** Les scénarios testables depuis la page /dev. */
export const SCENARIOS = [
  { token: 'demo-100', label: 'Démo du jury : 100 FCFA', status: 'demo_ready' },
  { token: 'quincaillerie-kone', label: 'Démo en ligne : 150 000 FCFA', status: 'demo_ready' },
  { token: 'expire-bientot', label: 'Démo qui expire dans 2 jours', status: 'demo_ready' },
  { token: 'en-preparation', label: 'Démo pas encore prête', status: 'building' },
  { token: 'sans-paiement', label: 'Aucun moyen de paiement actif', status: 'demo_ready' },
  { token: 'expiree', label: 'Livraison expirée', status: 'expired' },
  { token: 'deja-livree', label: 'Déjà payée et livrée', status: 'delivered' },
  { token: 'inconnu-404', label: 'Lien inconnu (404)', status: '—' },
] as const

function seed(): MockDb {
  const delivered = baseDelivery({
    publicToken: 'deja-livree',
    projectName: 'Site vitrine',
    devName: 'Koffi Yao',
    amountXof: 85_000,
    slug: 'site-vitrine-yao',
    status: 'delivered',
    paidAt: iso(-3 * DAY_MS),
    deliveredAt: iso(-3 * DAY_MS + 40_000),
    clientAccessToken: 'acc_' + randomSecret(),
    adminPassword: randomSecret(16),
    invoiceNumber: 'RCT-2026-000001',
    includeSource: false,
    expiresAt: null,
  })
  const payerToken = 'pyt_seed_' + randomSecret(12)
  delivered.payments.push({
    id: randomId(),
    deliveryId: delivered.id,
    provider: 'wave',
    amountXof: delivered.amountXof,
    status: 'succeeded',
    initiatedAt: iso(-3 * DAY_MS - 60_000),
    expiresAt: iso(-3 * DAY_MS + PAYMENT_TTL_MS),
    confirmedAt: delivered.paidAt,
    payerToken,
    payer: { name: 'Mariam Ouattara', email: 'mariam@example.ci', phone: '0707070707' },
  })
  // Cet appareil « a payé » cette livraison : il peut ouvrir l'espace client.
  writeStorage('recette.payer.deja-livree', payerToken)

  return {
    version: 1,
    invoiceSeq: 1,
    deliveries: [
      baseDelivery({
        publicToken: 'demo-100',
        projectName: 'Carnet de commandes',
        devName: 'Équipe Fid’s',
        amountXof: 100,
        slug: 'carnet-commandes',
      }),
      baseDelivery({
        publicToken: 'quincaillerie-kone',
        projectName: 'Gestion de stock · Quincaillerie Koné',
        slug: 'quincaillerie-kone',
      }),
      baseDelivery({
        publicToken: 'expire-bientot',
        projectName: 'Prise de rendez-vous · Cabinet Bamba',
        devName: 'Ibrahim Sangaré',
        amountXof: 250_000,
        slug: 'rdv-bamba',
        expiresAt: iso(2 * DAY_MS - 3_600_000),
        paymentMethods: ['wave', 'orange_money'],
      }),
      baseDelivery({ publicToken: 'en-preparation', status: 'building', projectName: 'Application de réservation' }),
      baseDelivery({ publicToken: 'sans-paiement', paymentMethods: [], projectName: 'Portail RH' }),
      baseDelivery({ publicToken: 'expiree', status: 'expired', expiresAt: iso(-2 * DAY_MS) }),
      delivered,
    ],
  }
}

/* ------------------------------------------------------------------ */
/* Persistance                                                         */
/* ------------------------------------------------------------------ */

function load(): MockDb {
  const raw = readStorage(STORAGE_KEY)
  if (raw) {
    try {
      const db = JSON.parse(raw) as MockDb
      if (db.version === 1) return db
    } catch {
      /* état corrompu : on repart du jeu de données */
    }
  }
  const db = seed()
  save(db)
  return db
}

function save(db: MockDb): void {
  writeStorage(STORAGE_KEY, JSON.stringify(db))
}

export function resetMockDb(): void {
  removeStorage(STORAGE_KEY)
  for (const s of SCENARIOS) {
    removeStorage(`recette.payer.${s.token}`)
    removeStorage(`recette.checkout.${s.token}`)
  }
  load()
}

/* ------------------------------------------------------------------ */
/* Règles                                                              */
/* ------------------------------------------------------------------ */

/**
 * Fait avancer la passation simulée selon le temps écoulé depuis le déblocage
 * (paid → handing_over → delivered). Seul `paidAt`, posé par une confirmation,
 * peut lancer ce mouvement.
 */
function advance(db: MockDb, d: MockDelivery, now = Date.now()): void {
  for (const p of d.payments) {
    if (p.status === 'initiated' && new Date(p.expiresAt).getTime() < now) p.status = 'expired'
  }
  if (!d.paidAt || d.status === 'delivered') return

  const elapsed = now - new Date(d.paidAt).getTime()
  if (elapsed < PAID_PHASE_MS) {
    d.status = 'paid'
  } else if (elapsed < PAID_PHASE_MS + HANDOVER_PHASE_MS) {
    d.status = 'handing_over'
  } else {
    d.status = 'delivered'
    d.deliveredAt = new Date(new Date(d.paidAt).getTime() + PAID_PHASE_MS + HANDOVER_PHASE_MS).toISOString()
    d.clientAccessToken ??= 'acc_' + randomSecret()
    d.adminPassword ??= randomSecret(16)
    if (!d.invoiceNumber) {
      db.invoiceSeq += 1
      d.invoiceNumber = `RCT-2026-${String(db.invoiceSeq).padStart(6, '0')}`
    }
    d.expiresAt = null
  }
}

/** Correspondance état réel → état vu par le client (6.3). */
function toPublicStatus(s: DeliveryStatus): PublicDeliveryStatus {
  switch (s) {
    case 'draft':
    case 'building':
    case 'build_failed':
      return 'preparing'
    case 'handover_failed':
      return 'handing_over'
    case 'expired':
    case 'cancelled':
      return 'unavailable'
    default:
      return s
  }
}

function origin(): string {
  return window.location.origin
}

function notFound(): never {
  throw new ApiError(404, 'DELIVERY_NOT_FOUND', "Cette livraison n'est plus disponible.")
}

function findByToken(db: MockDb, token: string): MockDelivery {
  return db.deliveries.find((d) => d.publicToken === token) ?? notFound()
}

function toPublic(d: MockDelivery, payerToken?: string | null): PublicDelivery {
  const status = toPublicStatus(d.status)
  // Un lien expiré ou annulé ne révèle rien (« sans autre détail »).
  if (status === 'unavailable') notFound()

  const last = d.payments.at(-1) ?? null
  const succeeded = d.payments.find((p) => p.status === 'succeeded')
  const ownsSpace = !!succeeded && !!payerToken && succeeded.payerToken === payerToken
  const p = encodeURIComponent(d.projectName)
  // `h` = adresse affichée, telle qu'elle sera en production (voir hostOf).
  const demoHost = `d-${d.id.slice(0, 8)}.demo.fids.cloud`
  const clientHost = `${d.slug}.app.fids.cloud`

  return {
    projectName: d.projectName,
    devName: d.devName,
    status,
    amountXof: d.amountXof,
    demoUrl: status === 'demo_ready' ? `${origin()}/mock/appli/demo?p=${p}&h=${demoHost}` : null,
    clientUrl: status === 'delivered' ? `${origin()}/mock/appli/client?p=${p}&h=${clientHost}` : null,
    paymentMethods: status === 'demo_ready' ? d.paymentMethods : [],
    activePayment: last ? { id: last.id, status: last.status } : null,
    clientSpaceUrl:
      status === 'delivered' && ownsSpace && d.clientAccessToken ? `${origin()}/c/${d.clientAccessToken}` : null,
    expiresAt: d.expiresAt,
  }
}

function publicPayment(p: MockPayment): Payment {
  return {
    id: p.id,
    deliveryId: p.deliveryId,
    provider: p.provider,
    amountXof: p.amountXof,
    status: p.status,
    initiatedAt: p.initiatedAt,
    expiresAt: p.expiresAt,
    confirmedAt: p.confirmedAt,
  }
}

/** Latence réseau simulée : la page doit rester correcte sur un réseau mobile lent. */
function delay<T>(fn: () => T, min = 250, max = 700): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        try {
          resolve(fn())
        } catch (e) {
          reject(e)
        }
      },
      min + Math.random() * (max - min),
    )
  })
}

function findPayment(db: MockDb, paymentId: string): { d: MockDelivery; p: MockPayment } | null {
  for (const d of db.deliveries) {
    const p = d.payments.find((x) => x.id === paymentId)
    if (p) return { d, p }
  }
  return null
}

const paymentNotFound = () => new ApiError(404, 'PAYMENT_NOT_FOUND', 'Paiement introuvable.')
const accessInvalid = () => new ApiError(403, 'ACCESS_TOKEN_INVALID', "Ce lien d'accès n'est pas valide.")

/* ------------------------------------------------------------------ */
/* API simulée                                                         */
/* ------------------------------------------------------------------ */

export const mockApi: PublicApi = {
  getDelivery: (token, payerToken) =>
    delay(() => {
      const db = load()
      const d = findByToken(db, token)
      advance(db, d)
      save(db)
      return toPublic(d, payerToken)
    }),

  createPayment: (token, input) =>
    delay(
      () => {
        const db = load()
        const d = findByToken(db, token)
        advance(db, d)
        if (d.status !== 'demo_ready') {
          throw new ApiError(409, 'DELIVERY_NOT_PAYABLE', "Cette livraison n'est pas payable pour le moment.")
        }
        if (!d.paymentMethods.includes(input.provider)) {
          throw new ApiError(422, 'PROVIDER_NOT_AVAILABLE', "Ce moyen de paiement n'est pas disponible.")
        }
        const payment: MockPayment = {
          id: randomId(),
          deliveryId: d.id,
          provider: input.provider,
          amountXof: d.amountXof, // copié depuis la livraison, jamais depuis la requête
          status: 'initiated',
          initiatedAt: iso(),
          expiresAt: iso(PAYMENT_TTL_MS),
          confirmedAt: null,
          payerToken: 'pyt_' + randomSecret(),
          payer: input.payer,
        }
        d.payments.push(payment)
        save(db)
        const ret = encodeURIComponent(`/l/${token}?retour=1`)
        return {
          payment: publicPayment(payment),
          checkoutUrl: `${origin()}/mock/paiement/${payment.id}?retour=${ret}`,
          payerToken: payment.payerToken,
        }
      },
      600,
      1200,
    ),

  getPayment: (paymentId, payerToken) =>
    delay(() => {
      const db = load()
      const found = findPayment(db, paymentId)
      if (!found || found.p.payerToken !== payerToken) throw paymentNotFound()
      advance(db, found.d)
      save(db)
      return publicPayment(found.p)
    }),

  getClientSpace: (accessToken) =>
    delay(() => {
      const db = load()
      const d = db.deliveries.find((x) => x.clientAccessToken === accessToken)
      if (!d || d.status !== 'delivered' || !d.deliveredAt || !d.invoiceNumber) throw accessInvalid()
      const payer = d.payments.find((p) => p.status === 'succeeded')?.payer
      const space: ClientSpace = {
        projectName: d.projectName,
        devName: d.devName,
        appUrl: `${origin()}/mock/appli/client?p=${encodeURIComponent(d.projectName)}&h=${d.slug}.app.fids.cloud`,
        status: 'running',
        admin: { email: payer?.email || `admin@${d.slug}.ci`, password: d.adminPassword ?? '' },
        invoice: { number: d.invoiceNumber, url: `/c/${accessToken}/facture` },
        sourceUrl: d.includeSource ? '/mock/fichier/source.zip' : null,
        lastBackupAt: new Date(new Date(d.deliveredAt).getTime() + 12_000).toISOString(),
        deliveredAt: d.deliveredAt,
      }
      return space
    }),
}

/* ------------------------------------------------------------------ */
/* Ce qui n'existe que pour le fournisseur simulé                      */
/* ------------------------------------------------------------------ */

export interface MockCheckoutInfo {
  payment: Payment
  projectName: string
  devName: string
  payerPhone: string
}

/** Équivalent de la page hébergée par le fournisseur (checkoutUrl). */
export function getMockCheckout(paymentId: string): Promise<MockCheckoutInfo> {
  return delay(() => {
    const db = load()
    const found = findPayment(db, paymentId)
    if (!found) throw paymentNotFound()
    advance(db, found.d)
    save(db)
    return {
      payment: publicPayment(found.p),
      projectName: found.d.projectName,
      devName: found.d.devName,
      payerPhone: found.p.payer.phone,
    }
  })
}

/**
 * Équivalent de POST /mock/payments/:id/complete suivi du webhook signé :
 * c'est la seule chose qui débloque la livraison. Un doublon est ignoré sans erreur.
 */
export function completeMockPayment(paymentId: string, outcome: 'succeeded' | 'failed'): Promise<void> {
  return delay(
    () => {
      const db = load()
      const found = findPayment(db, paymentId)
      if (!found) throw paymentNotFound()
      const { d, p } = found
      advance(db, d)
      if (p.status !== 'initiated') return
      if (outcome === 'failed') {
        p.status = 'failed'
      } else if (d.status === 'demo_ready') {
        p.status = 'succeeded'
        p.confirmedAt = iso()
        d.paidAt = p.confirmedAt
        d.status = 'paid'
      }
      save(db)
    },
    800,
    1400,
  )
}

export interface MockInvoice {
  number: string
  issuedAt: string
  projectName: string
  devName: string
  amountXof: number
  provider: Provider
  buyer: CreatePaymentInput['payer']
}

/** Données de l'aperçu de facture (le vrai PDF est produit par le serveur, lot 3). */
export function getMockInvoice(accessToken: string): Promise<MockInvoice> {
  return delay(() => {
    const db = load()
    const d = db.deliveries.find((x) => x.clientAccessToken === accessToken)
    const p = d?.payments.find((x) => x.status === 'succeeded')
    if (!d || !p || !d.invoiceNumber || !d.deliveredAt) throw accessInvalid()
    return {
      number: d.invoiceNumber,
      issuedAt: d.deliveredAt,
      projectName: d.projectName,
      devName: d.devName,
      amountXof: p.amountXof,
      provider: p.provider,
      buyer: p.payer,
    }
  })
}
