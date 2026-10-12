/**
 * Types de la page client : ceux du contrat commun (lib/contracts), la seule source de vérité.
 * Il n'y a plus de types maison ni de faux backend : la page parle à /api/v1.
 */
export type {
  ClientSpace,
  DeclareFeeInput,
  DeclarePaymentInput,
  DeclarePaymentResult,
  Payment,
  PaymentProvider as Provider,
  PlatformFee,
  PublicDelivery,
  PublicDeliveryStatus,
  Ticket,
} from '@/lib/contracts'

/** Forme commune des erreurs de l'API. */
export interface ApiErrorBody {
  error: { code: string; message: string; details?: Record<string, unknown> }
}
