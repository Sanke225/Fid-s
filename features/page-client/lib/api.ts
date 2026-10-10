import type {
  ApiErrorBody,
  ClientSpace,
  CreatePaymentInput,
  CreatePaymentResult,
  Payment,
  PublicDelivery,
} from './contracts'

/** Erreur d'API au format 6.1 : le `code` fait partie du contrat, le `message` est affichable. */
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

/** Les seuls appels publics (sans compte) dont la page client a besoin — section 6.2, lots 1 et 3. */
export interface PublicApi {
  /** GET /public/deliveries/:token */
  getDelivery(token: string, payerToken?: string | null): Promise<PublicDelivery>
  /** POST /public/deliveries/:token/payments */
  createPayment(token: string, input: CreatePaymentInput): Promise<CreatePaymentResult>
  /** GET /public/payments/:paymentId */
  getPayment(paymentId: string, payerToken: string): Promise<Payment>
  /** GET /public/client-space/:accessToken */
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

export const httpApi: PublicApi = {
  getDelivery: (token, payerToken) =>
    request(`/public/deliveries/${enc(token)}`, {
      headers: payerToken ? { 'X-Payer-Token': payerToken } : {},
    }),
  createPayment: (token, input) =>
    request(`/public/deliveries/${enc(token)}/payments`, { method: 'POST', body: JSON.stringify(input) }),
  getPayment: (paymentId, payerToken) =>
    request(`/public/payments/${enc(paymentId)}`, { headers: { 'X-Payer-Token': payerToken } }),
  getClientSpace: (accessToken) => request(`/public/client-space/${enc(accessToken)}`),
}
