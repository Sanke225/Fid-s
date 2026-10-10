'use client'

import { cx } from '../lib/cx'
import { CheckIcon, LockIcon } from '../components/icons'
import { ButtonLink, Card, PhoneShell, Spinner } from '../components/ui'
import type { PublicDelivery } from '../lib/contracts'
import { formatXof } from '../lib/format'
import { handoverSteps, hostOf, type Step } from './handover'

/** L'écran « débloqué » : ce que voit le client après la confirmation du paiement. */
export function UnlockedView({ delivery }: { delivery: PublicDelivery }) {
  const delivered = delivery.status === 'delivered'
  const steps = handoverSteps(delivery.status)

  return (
    <PhoneShell footer={<>Paiement de {formatXof(delivery.amountXof)} versé directement à {delivery.devName}.</>}>
      <div className="flex flex-col items-center pt-6 pb-2 text-center">
        <div
          className={cx(
            'grid size-24 place-items-center rounded-full transition-colors duration-700',
            delivered ? 'bg-brand text-white' : 'bg-brand-soft text-brand',
          )}
          style={{ ['--lock-hole' as string]: delivered ? 'var(--color-brand)' : 'var(--color-brand-soft)' }}
        >
          <LockIcon open className="size-12 animate-pop" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-balance">
          {delivered ? 'Votre application est prête' : 'Paiement reçu, merci !'}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">{delivery.projectName}</p>
      </div>

      <Card>
        <ol className="flex flex-col">
          {steps.map((s, i) => (
            <li key={s.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <StepDot state={s.state} />
                {i < steps.length - 1 && (
                  <span className={cx('my-1 w-0.5 flex-1 rounded', s.state === 'done' ? 'bg-brand' : 'bg-line')} />
                )}
              </div>
              <div className={cx('pb-5', i === steps.length - 1 && 'pb-0')}>
                <p className={cx('font-semibold', s.state === 'todo' && 'text-ink-mute')}>{s.label}</p>
                <p className="text-sm text-ink-soft">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {!delivered && (
        <p className="text-center text-sm leading-relaxed text-ink-soft" role="status">
          Vous pouvez rester sur cette page, elle se met à jour toute seule.
        </p>
      )}

      {delivered && delivery.clientSpaceUrl && (
        <div className="animate-rise flex flex-col gap-3">
          {delivery.clientUrl && (
            <Card className="text-center">
              <p className="text-xs text-ink-mute">Adresse de votre application</p>
              <p className="mt-1 font-mono text-[15px] break-all">{hostOf(delivery.clientUrl)}</p>
            </Card>
          )}
          <ButtonLink to={new URL(delivery.clientSpaceUrl).pathname} className="min-h-14 w-full text-base">
            Accéder à mon espace
          </ButtonLink>
        </div>
      )}

      {delivered && !delivery.clientSpaceUrl && (
        <Card className="text-center text-sm leading-relaxed text-ink-soft">
          Cette application a été livrée. Les accès ont été remis sur l’appareil qui a payé et envoyés par e-mail.
        </Card>
      )}
    </PhoneShell>
  )
}

function StepDot({ state }: { state: Step['state'] }) {
  if (state === 'done') {
    return (
      <span className="grid size-7 shrink-0 animate-pop place-items-center rounded-full bg-brand text-white">
        <CheckIcon className="size-4" />
      </span>
    )
  }
  if (state === 'active') {
    return (
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
        <Spinner className="size-4" />
      </span>
    )
  }
  return <span className="size-7 shrink-0 rounded-full ring-2 ring-line ring-inset" />
}
