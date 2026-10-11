'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BRAND } from '../lib/brand'
import { Card, Notice } from '../components/ui'
import { deliveryKey } from '../delivery/useDelivery'
import { ApiError } from '../lib/api'
import type { PublicDelivery } from '../lib/contracts'
import { formatXof } from '../lib/format'
import { api } from '../lib/publicApi'
import { payerTokenStore } from '../lib/storage'
import { PayFlow, type Declaration } from './PayFlow'

const errorMessages: Record<string, string> = {
  FEE_NOT_DUE: 'Aucun frais n’est à régler pour le moment. La page va se mettre à jour.',
  FEE_ALREADY_DECLARED: 'Le paiement des frais a déjà été déclaré et attend sa vérification.',
  FEE_PROVIDER_UNAVAILABLE: 'Ce moyen de paiement n’est pas proposé pour les frais.',
  PAYER_TOKEN_REQUIRED: 'Les frais doivent être réglés depuis l’appareil qui a payé le développeur.',
  TRANSACTION_REF_ALREADY_USED: 'Cette référence a déjà été utilisée. Vérifiez le SMS de confirmation.',
  VALIDATION_ERROR: 'Certaines informations sont invalides. Vérifiez le numéro et la référence.',
}
const messageOf = (e: unknown) =>
  e instanceof ApiError ? (errorMessages[e.code] ?? e.message) : e ? 'Une erreur est survenue. Réessayez dans un instant.' : null

/** Frais de service Fid’s (5 %), réglés par le client après la confirmation du dépôt par le dev. */
export function FeePanel({ token, delivery }: { token: string; delivery: PublicDelivery }) {
  const queryClient = useQueryClient()
  const { fee } = delivery
  // Le serveur n'envoie les numéros de Fid’s (ou l'état des frais) qu'à qui a le droit de payer :
  // l'appareil qui a payé le dev, ou le client connecté propriétaire de la livraison.
  const canPay = fee.payoutMethods.length > 0 || fee.activeFee !== null

  const declare = useMutation({
    mutationFn: (d: Declaration) =>
      api.declareFee(token, payerTokenStore.get(token), {
        provider: d.target.provider,
        payerName: d.payerName,
        payerPhone: d.payerPhone,
        transactionRef: d.transactionRef,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: deliveryKey(token) }),
    onError: (err) => {
      if (err instanceof ApiError && err.code === 'FEE_NOT_DUE') void queryClient.invalidateQueries({ queryKey: deliveryKey(token) })
    },
  })

  if (!canPay) {
    return (
      <Notice tone="info">
        {delivery.devName} a reçu le paiement. Pour recevoir l’application, les frais de service {BRAND} doivent être réglés depuis
        l’appareil qui a payé, ou depuis votre espace client si vous êtes connecté.
      </Notice>
    )
  }

  if (fee.activeFee?.status === 'declared') {
    return (
      <Card className="animate-rise">
        <div className="flex items-start gap-3" role="status">
          <span className="relative mt-1 flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-brand" />
          </span>
          <div>
            <p className="font-semibold">Frais déclarés, vérification en cours</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              L’équipe {BRAND} vérifie la réception de {formatXof(fee.amountXof)}. Dès sa confirmation, l’installation à votre nom démarre :
              cette page se met à jour toute seule.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (fee.payoutMethods.length === 0) {
    return <Notice tone="warn">Le règlement des frais n’est pas encore ouvert. Contactez l’équipe {BRAND}.</Notice>
  }

  return (
    <PayFlow
      intro={
        fee.activeFee?.status === 'rejected' || fee.activeFee?.status === 'expired' ? (
          <Notice tone="danger">
            Les frais déclarés précédemment n’ont pas été reçus. Vérifiez le numéro et la référence, puis déclarez à nouveau.
          </Notice>
        ) : undefined
      }
      targets={fee.payoutMethods.map((m) => ({ key: m.provider, provider: m.provider, phone: m.phone, label: m.label }))}
      amountXof={fee.amountXof}
      payee={BRAND}
      submitLabel="J’ai réglé les frais : déclarer"
      pending={declare.isPending || declare.isSuccess}
      error={messageOf(declare.error)}
      onDeclare={(d) => declare.mutate(d)}
    />
  )
}
