'use client'

import { BRAND } from '../lib/brand'
import { useEffect } from 'react'
import { ApiError } from '../lib/api'
import { BigScreen } from './BigScreen'
import { OfferView } from './OfferView'
import { ErrorScreen, LoadingScreen, PreparingScreen, UnavailableScreen } from './StateScreens'
import { UnlockedView } from './UnlockedView'
import { useDelivery } from './useDelivery'

/** Page de livraison publique : /l/:token (P6). */
export function DeliveryPage({
  token,
  bigScreen = false,
  returning = false,
}: {
  token: string
  /** ?ecran=grand */
  bigScreen?: boolean
  /** ?retour=1 : le client revient de la page du fournisseur */
  returning?: boolean
}) {
  const { data, error, isPending, refetch } = useDelivery(token)

  useEffect(() => {
    if (data) document.title = `${data.projectName} · ${BRAND}`
  }, [data])

  if (isPending) return <LoadingScreen />

  if (error instanceof ApiError && error.status === 404) return <UnavailableScreen />
  // Une coupure pendant l'interrogation ne remplace pas une page déjà affichée.
  if (!data) return <ErrorScreen message={error?.message ?? ''} onRetry={() => void refetch()} />

  if (bigScreen && data.status !== 'unavailable') return <BigScreen token={token} delivery={data} />

  switch (data.status) {
    case 'preparing':
      return <PreparingScreen projectName={data.projectName} devName={data.devName} />
    case 'demo_ready':
      return <OfferView token={token} delivery={data} returning={returning} />
    case 'paid':
    case 'handing_over':
    case 'delivered':
      return <UnlockedView delivery={data} />
    case 'unavailable':
      return <UnavailableScreen />
  }
}
