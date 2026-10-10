'use client'

import { BRAND } from '../lib/brand'
import Link from 'next/link'
import { ExternalIcon, PlayIcon, ScreenIcon, ShieldIcon } from '../components/icons'
import { ButtonLink, Card, Eyebrow, PhoneShell } from '../components/ui'
import type { PublicDelivery } from '../lib/contracts'
import { daysUntil, formatDay, formatXof } from '../lib/format'
import { PaymentPanel } from '../pay/PaymentPanel'

/** État « démo en ligne » : essayer, voir le montant, payer. */
export function OfferView({
  token,
  delivery,
  returning,
}: {
  token: string
  delivery: PublicDelivery
  returning: boolean
}) {
  const daysLeft = delivery.expiresAt ? daysUntil(delivery.expiresAt) : null

  return (
    <PhoneShell
      footer={
        <>
          {BRAND} ne touche jamais votre argent : il va directement à {delivery.devName}.
          <br />
          <Link href={`/l/${token}?ecran=grand`} className="mt-3 inline-flex items-center gap-1.5 underline-offset-2 hover:underline">
            <ScreenIcon className="size-3.5" /> Mode grand écran
          </Link>
        </>
      }
    >
      <div className="animate-rise pt-1">
        <Eyebrow>Livraison de {delivery.devName}</Eyebrow>
        <h1 className="mt-1.5 text-[26px] leading-tight font-extrabold tracking-tight text-balance">
          {delivery.projectName}
        </h1>
      </div>

      {/* 1. Essayer */}
      <Card className="animate-rise [animation-delay:60ms]">
        <div className="flex items-center gap-2">
          <StepBadge n={1} />
          <h2 className="font-semibold">Essayez l’application</h2>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Une version de démonstration tourne déjà, avec des données d’exemple. Testez-la comme si elle était à vous.
        </p>
        {delivery.demoUrl && (
          <ButtonLink href={delivery.demoUrl} external variant="secondary" className="mt-4 w-full">
            <PlayIcon className="size-4" /> Ouvrir la démo <ExternalIcon className="size-4 text-ink-mute" />
          </ButtonLink>
        )}
      </Card>

      {/* 2. Payer */}
      <Card className="animate-rise [animation-delay:120ms]">
        <div className="flex items-center gap-2">
          <StepBadge n={2} />
          <h2 className="font-semibold">Réglez quand ça vous convient</h2>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-line pt-4">
          <span className="text-sm text-ink-soft">Montant à régler</span>
          <span className="text-[28px] leading-none font-extrabold tracking-tight tabular">
            {formatXof(delivery.amountXof)}
          </span>
        </div>
        {daysLeft !== null && delivery.expiresAt && (
          <p className="mt-2 text-right text-xs text-ink-mute">
            Démo disponible jusqu’au {formatDay(delivery.expiresAt)}
            {daysLeft <= 3 && ` · plus que ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
          </p>
        )}
      </Card>

      <div className="animate-rise [animation-delay:180ms]">
        <PaymentPanel token={token} delivery={delivery} returning={returning} />
      </div>

      <ul className="animate-rise mt-1 flex flex-col gap-2.5 text-sm text-ink-soft [animation-delay:240ms]">
        <Assurance>Dès le paiement confirmé, l’application est installée à votre nom, à votre adresse.</Assurance>
        <Assurance>Vous recevez vos accès, votre facture et une sauvegarde de vos données.</Assurance>
      </ul>
    </PhoneShell>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-white tabular">{n}</span>
  )
}

function Assurance({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <ShieldIcon className="mt-0.5 size-4 shrink-0 text-brand" />
      <span className="leading-relaxed">{children}</span>
    </li>
  )
}
