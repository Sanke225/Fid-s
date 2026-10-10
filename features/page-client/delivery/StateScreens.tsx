'use client'

import { ClockIcon } from '../components/icons'
import { Button, Card, PhoneShell } from '../components/ui'

export function LoadingScreen() {
  return (
    <PhoneShell>
      <div aria-busy="true" aria-label="Chargement" className="flex flex-col gap-4">
        <div className="h-24 animate-pulse rounded-2xl bg-line/70" />
        <div className="h-40 animate-pulse rounded-2xl bg-line/70" />
        <div className="h-14 animate-pulse rounded-xl bg-line/70" />
      </div>
    </PhoneShell>
  )
}

/** 404, expirée ou annulée : on ne dit rien de plus (règle 1.6 / DELIVERY_NOT_FOUND). */
export function UnavailableScreen() {
  return (
    <PhoneShell>
      <Card className="mt-6 py-10 text-center">
        <p className="text-4xl" aria-hidden>
          ∅
        </p>
        <h1 className="mt-3 text-xl font-bold">Cette livraison n’est plus disponible</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
          Le lien a peut-être expiré ou a été retiré. Contactez la personne qui vous l’a envoyé.
        </p>
      </Card>
    </PhoneShell>
  )
}

export function PreparingScreen({ projectName, devName }: { projectName: string; devName: string }) {
  return (
    <PhoneShell>
      <Card className="mt-6 py-10 text-center">
        <ClockIcon className="mx-auto size-10 text-ink-mute" />
        <h1 className="mt-4 text-xl font-bold">{projectName}</h1>
        <p className="mt-1 text-sm text-ink-soft">par {devName}</p>
        <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-ink-soft">
          L’application est en préparation. Cette page s’actualise toute seule : vous pourrez l’essayer dès qu’elle
          sera prête.
        </p>
      </Card>
    </PhoneShell>
  )
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <PhoneShell>
      <Card className="mt-6 py-10 text-center">
        <h1 className="text-lg font-bold">Impossible d’afficher la livraison</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{message}</p>
        <Button variant="secondary" className="mt-6" onClick={onRetry}>
          Réessayer
        </Button>
      </Card>
    </PhoneShell>
  )
}
