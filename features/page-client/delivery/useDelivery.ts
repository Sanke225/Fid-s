import { useQuery } from '@tanstack/react-query'
import { ApiError } from '../lib/api'
import type { PublicDelivery } from '../lib/contracts'
import { api } from '../lib/publicApi'
import { payerTokenStore } from '../lib/storage'

/** Interrogation périodique (5.2 : pas de WebSocket, toutes les 2 s). */
export const POLL_MS = 2_000

/** Plus rien ne peut changer pour cet appareil : on arrête d'interroger. */
function isSettled(d: PublicDelivery | undefined): boolean {
  return d?.status === 'delivered' && d.clientSpaceUrl !== null
}

export const deliveryKey = (token: string) => ['public-delivery', token] as const

export function useDelivery(token: string) {
  return useQuery({
    queryKey: deliveryKey(token),
    // Le jeton payeur est relu à chaque appel : il apparaît juste après la création d'un paiement.
    queryFn: () => api.getDelivery(token, payerTokenStore.get(token)),
    refetchInterval: (q) => {
      if (q.state.error instanceof ApiError && q.state.error.status === 404) return false
      return isSettled(q.state.data) ? false : POLL_MS
    },
    retry: (count, err) => {
      const clientError = err instanceof ApiError && err.status >= 400 && err.status < 500
      return !clientError && count < 3
    },
  })
}
