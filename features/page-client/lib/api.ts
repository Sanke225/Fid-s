import type {
  ApiErrorBody,
  ClientSpace,
  DeclareFeeInput,
  DeclarePaymentInput,
  DeclarePaymentResult,
  Payment,
  PlatformFee,
  PublicDelivery,
  Ticket,
} from './contracts'

/** Erreur d'API : le `code` fait partie du contrat, le `message` (en français) est affichable. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: Record<string, unknown>

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** Les appels publics (sans compte) de la page client. Le jeton payeur prouve que cet appareil a payé. */
export interface PublicApi {
  /** GET /public/deliveries/:token */
  getDelivery(token: string, payerToken?: string | null): Promise<PublicDelivery>
  /** POST /public/deliveries/:token/payments — le client déclare avoir payé le dev. */
  declarePayment(token: string, input: DeclarePaymentInput): Promise<DeclarePaymentResult>
  /** GET /public/payments/:paymentId */
  getPayment(paymentId: string, payerToken: string): Promise<Payment>
  /** GET /public/payments/:paymentId/tickets */
  getTickets(paymentId: string, payerToken: string): Promise<Ticket[]>
  /** POST /public/payments/:paymentId/tickets — contestation après « rien reçu » ou 48 h sans réponse. */
  openTicket(paymentId: string, payerToken: string, claim: string): Promise<Ticket>
  /** POST /public/deliveries/:token/fee — le client déclare avoir réglé les frais Fid’s (5 %). */
  declareFee(token: string, payerToken: string | null, input: DeclareFeeInput): Promise<PlatformFee>
  /** GET /public/client-space/:accessToken (disponible avec la passation). */
  getClientSpace(accessToken: string): Promise<ClientSpace>
}

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '/api/v1'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    })
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Connexion impossible. Vérifiez votre réseau et réessayez.')
  }
  if (res.ok) return (await res.json()) as T

  const body = (await res.json().catch(() => null)) as ApiErrorBody | null
  throw new ApiError(
    res.status,
    body?.error.code ?? 'UNKNOWN',
    body?.error.message ?? 'Une erreur est survenue. Réessayez dans un instant.',
    body?.error.details,
  )
}

const enc = encodeURIComponent
const payer = (payerToken: string) => ({ 'X-Payer-Token': payerToken })

export const httpApi: PublicApi = {
  getDelivery: (token, payerToken) =>
    request(`/public/deliveries/${enc(token)}`, { headers: payerToken ? payer(payerToken) : {} }),
  declarePayment: (token, input) =>
    request(`/public/deliveries/${enc(token)}/payments`, { method: 'POST', body: JSON.stringify(input) }),
  getPayment: (paymentId, payerToken) => request(`/public/payments/${enc(paymentId)}`, { headers: payer(payerToken) }),
  getTickets: (paymentId, payerToken) =>
    request<{ items: Ticket[] }>(`/public/payments/${enc(paymentId)}/tickets`, { headers: payer(payerToken) }).then((r) => r.items),
  openTicket: (paymentId, payerToken, claim) =>
    request(`/public/payments/${enc(paymentId)}/tickets`, { method: 'POST', headers: payer(payerToken), body: JSON.stringify({ claim }) }),
  declareFee: (token, payerToken, input) =>
    request(`/public/deliveries/${enc(token)}/fee`, { method: 'POST', headers: payerToken ? payer(payerToken) : {}, body: JSON.stringify(input) }),
  getClientSpace: (accessToken) => request(`/public/client-space/${enc(accessToken)}`),
}
