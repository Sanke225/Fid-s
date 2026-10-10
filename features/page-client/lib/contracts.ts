/**
 * Types transcrits de la section 6.3 du cahier des charges.
 * À remplacer par un import de `@recette/contracts` dès que le paquet est publié :
 *   export type { PublicDelivery, Payment, ClientSpace, Provider } from '@recette/contracts'
 * Ne pas modifier ici sans passer par une demande de fusion « contrat ».
 */

export type Provider = 'wave' | 'orange_money' | 'mock'
export type PaymentStatus = 'initiated' | 'succeeded' | 'failed' | 'expired'

export type PublicDeliveryStatus =
  | 'preparing'
  | 'demo_ready'
  | 'paid'
  | 'handing_over'
  | 'delivered'
  | 'unavailable'

export interface PublicDelivery {
  projectName: string
  devName: string
  status: PublicDeliveryStatus
  amountXof: number
  demoUrl: string | null
  clientUrl: string | null
  /** Vide = paiement indisponible */
  paymentMethods: Provider[]
  activePayment: { id: string; status: PaymentStatus } | null
  /** Seulement avec le bon X-Payer-Token */
  clientSpaceUrl: string | null
  expiresAt: string | null
}

export interface Payment {
  id: string
  deliveryId: string
  provider: Provider
  amountXof: number
  status: PaymentStatus
  initiatedAt: string
  expiresAt: string
  confirmedAt: string | null
}

export interface ClientSpace {
  projectName: string
  devName: string
  appUrl: string
  status: 'running' | 'failed'
  admin: { email: string; password: string } | null
  invoice: { number: string; url: string }
  /** Nul si includeSource = false */
  sourceUrl: string | null
  lastBackupAt: string | null
  deliveredAt: string
}

/** Entrée de POST /public/deliveries/:token/payments */
export interface CreatePaymentInput {
  provider: Provider
  payer: { name: string; email: string; phone: string }
}

export interface CreatePaymentResult {
  payment: Payment
  checkoutUrl: string
  payerToken: string
}

/** Forme commune des erreurs (6.1) */
export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, unknown> }
}
