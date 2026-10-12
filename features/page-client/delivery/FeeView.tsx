'use client'

import { BRAND } from '../lib/brand'
import { CheckIcon, ExternalIcon, PlayIcon } from '../components/icons'
import { ButtonLink, Card, Eyebrow, PhoneShell } from '../components/ui'
import type { PublicDelivery } from '../lib/contracts'
import { formatXof } from '../lib/format'
import { FeePanel } from '../pay/FeePanel'
import { Step } from '../pay/PayFlow'

/**
 * Dépôt confirmé par le dev, frais Fid’s à régler (statut awaiting_fee).
 * La démo reste consultable ; rien d'autre n'est remis tant que les frais ne sont pas confirmés.
 */
export function FeeView({ token, delivery }: { token: string; delivery: PublicDelivery }) {
  return (
    <PhoneShell footer={<>Le paiement de {formatXof(delivery.amountXof)} est allé directement à {delivery.devName}. {BRAND} n’encaisse que ses frais de service.</>}>
      <div className="animate-rise pt-1">
        <Eyebrow>Livraison de {delivery.devName}</Eyebrow>
        <h1 className="mt-1.5 text-[26px] leading-tight font-extrabold tracking-tight text-balance">{delivery.projectName}</h1>
      </div>

      <Card className="animate-rise [animation-delay:60ms]">
        <ol className="flex flex-col gap-3 text-sm">
          <li className="flex items-center gap-3">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-brand text-white">
              <CheckIcon className="size-3.5" />
            </span>
            <span>
              <span className="font-semibold">Paiement reçu par {delivery.devName}</span> · {formatXof(delivery.amountXof)}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Step n={2} />
            <span>
              <span className="font-semibold">Frais de service {BRAND}</span> · {formatXof(delivery.fee.amountXof)} (5 %)
            </span>
          </li>
          <li className="flex items-center gap-3 text-ink-mute">
            <Step n={3} />
            <span>Installation à votre nom, accès et facture</span>
          </li>
        </ol>
      </Card>

      <div className="animate-rise [animation-delay:120ms]">
        <FeePanel token={token} delivery={delivery} />
      </div>

      {delivery.demoUrl ? (
        <ButtonLink href={delivery.demoUrl} external variant="secondary" className="animate-rise w-full [animation-delay:180ms]">
          <PlayIcon className="size-4" /> Continuer d’utiliser la démo <ExternalIcon className="size-4 text-ink-mute" />
        </ButtonLink>
      ) : null}
    </PhoneShell>
  )
}
