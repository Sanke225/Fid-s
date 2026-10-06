'use client'

import { BRAND } from '../lib/brand'
import Link from 'next/link'
import { cx } from '../lib/cx'
import QRCode from 'react-qr-code'
import { CheckIcon, LockIcon } from '../components/icons'
import { Logo, Spinner } from '../components/ui'
import type { PublicDelivery } from '../lib/contracts'
import { formatXof } from '../lib/format'
import { handoverSteps, hostOf } from './handover'

/**
 * Mode grand écran (?ecran=grand) : projeté pendant la démo.
 * Le public scanne le QR code, paie sur son téléphone, et cet écran se débloque en direct.
 */
export function BigScreen({ token, delivery }: { token: string; delivery: PublicDelivery }) {
  const pageUrl = `${window.location.origin}/l/${token}`
  const unlocked = ['paid', 'handing_over', 'delivered'].includes(delivery.status)
  const delivered = delivery.status === 'delivered'
  const pending = delivery.activePayment?.status === 'initiated'

  return (
    <div className="flex min-h-dvh flex-col bg-night text-white">
      <header className="flex items-center justify-between px-10 pt-8">
        <Logo tone="light" />
        <Link href={`/l/${token}`} className="text-sm text-white/50 hover:text-white">
          Quitter le grand écran
        </Link>
      </header>

      <main className="grid flex-1 items-center gap-16 px-10 py-10 lg:grid-cols-[1.2fr_1fr] lg:px-20">
        <section>
          <p className="text-sm font-semibold tracking-[0.12em] text-mint uppercase">Livraison de {delivery.devName}</p>
          <h1 className="mt-3 text-5xl leading-[1.05] font-extrabold tracking-tight text-balance xl:text-6xl">
            {delivery.projectName}
          </h1>

          <div className="mt-12 flex items-baseline gap-4">
            <span className="text-7xl font-extrabold tracking-tight tabular xl:text-8xl">
              {formatXof(delivery.amountXof)}
            </span>
          </div>

          <div className="mt-10 h-14">
            {unlocked ? (
              <span className="inline-flex animate-pop items-center gap-3 rounded-full bg-mint px-6 py-3 text-xl font-bold text-night">
                <CheckIcon className="size-6" /> Paiement confirmé
              </span>
            ) : pending ? (
              <span className="inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-xl font-semibold">
                <Spinner className="size-5" /> Paiement en cours…
              </span>
            ) : (
              <span className="inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-xl font-semibold text-white/80">
                <span className="size-3 rounded-full bg-amber-400" /> En attente de paiement
              </span>
            )}
          </div>
        </section>

        <section className="flex justify-center">
          {unlocked ? (
            <div className="w-full max-w-md rounded-3xl bg-night-2 p-10 ring-1 ring-night-line">
              <div
                className={cx(
                  'mx-auto grid size-28 place-items-center rounded-full transition-colors duration-700',
                  delivered ? 'bg-mint text-night' : 'bg-white/10 text-mint',
                )}
                style={{ ['--lock-hole' as string]: delivered ? 'var(--color-mint)' : 'var(--color-night-2)' }}
              >
                <LockIcon open className="size-14 animate-pop" />
              </div>
              <ol className="mt-10 flex flex-col gap-5">
                {handoverSteps(delivery.status).map((s) => (
                  <li key={s.label} className="flex items-center gap-4 text-xl">
                    {s.state === 'done' ? (
                      <span className="grid size-8 animate-pop place-items-center rounded-full bg-mint text-night">
                        <CheckIcon className="size-5" />
                      </span>
                    ) : s.state === 'active' ? (
                      <span className="grid size-8 place-items-center text-mint">
                        <Spinner className="size-6" />
                      </span>
                    ) : (
                      <span className="size-8 rounded-full ring-2 ring-white/20 ring-inset" />
                    )}
                    <span className={cx('font-semibold', s.state === 'todo' && 'text-white/40')}>{s.label}</span>
                  </li>
                ))}
              </ol>
              {delivered && delivery.clientUrl && (
                <p className="mt-10 animate-rise rounded-xl bg-white/5 px-4 py-3 text-center font-mono text-lg break-all text-mint">
                  {hostOf(delivery.clientUrl)}
                </p>
              )}
            </div>
          ) : (
            <figure className="flex flex-col items-center">
              <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-black/40">
                <QRCode value={pageUrl} size={300} bgColor="#ffffff" fgColor="#121826" level="M" />
              </div>
              <figcaption className="mt-6 text-center">
                <span className="block text-2xl font-bold">Scannez pour essayer et payer</span>
                <span className="mt-1 block font-mono text-base text-white/50">{hostOf(pageUrl)}/l/{token}</span>
              </figcaption>
            </figure>
          )}
        </section>
      </main>

      <footer className="px-10 pb-8 text-sm text-white/40 lg:px-20">
        L’argent va directement au développeur. {BRAND} garde l’application, jamais l’argent.
      </footer>
    </div>
  )
}
