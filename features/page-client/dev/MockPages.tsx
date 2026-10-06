'use client'

import { BRAND } from '../lib/brand'
/**
 * Pages qui n'existent qu'en mode simulé (VITE_USE_MOCK=true).
 * En production, ces écrans sont remplacés par le vrai fournisseur, la vraie démo et le vrai PDF.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ButtonLink, Button, Card, Eyebrow, Logo, Notice, Spinner } from '../components/ui'
import { formatCiPhone, formatDateTime, formatXof, providerLabel } from '../lib/format'
import { SCENARIOS, completeMockPayment, getMockCheckout, getMockInvoice, resetMockDb } from '../mocks/mockApi'

/* ---------------------------- Index des scénarios --------------------------- */

export function DevIndexPage() {
  const queryClient = useQueryClient()
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Logo />
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Page client · données simulées</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Chaque lien ouvre la page de livraison dans un état différent. L’état est gardé dans ce navigateur : ouvrez le
        mode grand écran dans un onglet et payez dans un autre pour rejouer la démo.
      </p>
      <Card className="mt-6 p-0">
        <ul className="divide-y divide-line">
          {SCENARIOS.map((s) => (
            <li key={s.token} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-semibold">{s.label}</p>
                <p className="font-mono text-xs text-ink-mute">
                  /l/{s.token} · {s.status}
                </p>
              </div>
              <div className="flex gap-2">
                <ButtonLink to={`/l/${s.token}`} variant="secondary" className="min-h-10 px-4 text-sm">
                  Téléphone
                </ButtonLink>
                <ButtonLink to={`/l/${s.token}?ecran=grand`} variant="ghost" className="min-h-10 px-4 text-sm">
                  Grand écran
                </ButtonLink>
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Button
        variant="ghost"
        className="mt-4"
        onClick={() => {
          resetMockDb()
          queryClient.clear()
        }}
      >
        Réinitialiser les données simulées
      </Button>
    </div>
  )
}

/* ------------------------- Page du fournisseur simulé ----------------------- */

/** Équivalent de checkoutUrl du fournisseur `mock` (6.7) : deux boutons, Payer et Échouer. */
export function MockCheckoutPage({ paymentId, back }: { paymentId: string; back: string }) {
  const router = useRouter()
  const { data, error, isPending } = useQuery({
    queryKey: ['mock-checkout', paymentId],
    queryFn: () => getMockCheckout(paymentId),
  })
  const complete = useMutation({
    mutationFn: (outcome: 'succeeded' | 'failed') => completeMockPayment(paymentId, outcome),
    onSuccess: () => router.push(back),
  })

  return (
    <div className="grid min-h-dvh place-items-center bg-[#eef0f4] px-4">
      <div className="w-full max-w-sm">
        <p className="mb-3 text-center text-xs font-semibold tracking-[0.1em] text-ink-mute uppercase">
          Fournisseur de paiement simulé
        </p>
        <Card className="p-6">
          {isPending && <Spinner className="mx-auto size-6 text-ink-mute" />}
          {error && <Notice tone="danger">{error.message}</Notice>}
          {data && (
            <>
              <Eyebrow>{providerLabel[data.payment.provider]} · simulation</Eyebrow>
              <p className="mt-4 text-sm text-ink-soft">Paiement à {data.devName}</p>
              <p className="text-sm text-ink-soft">{data.projectName}</p>
              <p className="mt-4 text-4xl font-extrabold tracking-tight tabular">{formatXof(data.payment.amountXof)}</p>
              <p className="mt-2 font-mono text-sm text-ink-mute">+225 {formatCiPhone(data.payerPhone)}</p>

              {data.payment.status === 'initiated' ? (
                <div className="mt-8 flex flex-col gap-2">
                  <Button loading={complete.isPending && complete.variables === 'succeeded'} disabled={complete.isPending} onClick={() => complete.mutate('succeeded')}>
                    Payer
                  </Button>
                  <Button variant="secondary" loading={complete.isPending && complete.variables === 'failed'} disabled={complete.isPending} onClick={() => complete.mutate('failed')}>
                    Échouer
                  </Button>
                </div>
              ) : (
                <div className="mt-8 flex flex-col gap-3">
                  <Notice>Ce paiement est déjà traité ({data.payment.status}).</Notice>
                  <ButtonLink to={back} variant="secondary">
                    Retour
                  </ButtonLink>
                </div>
              )}
            </>
          )}
        </Card>
        <p className="mt-4 text-center text-xs leading-relaxed text-ink-mute">
          Aucun argent ne circule. Le clic envoie une confirmation simulée, comme le ferait le fournisseur.
        </p>
      </div>
    </div>
  )
}

/* ------------------------- Application témoin simulée ---------------------- */

export function MockAppPage({ kind, projectName }: { kind: string; projectName: string | null }) {
  const isDemo = kind === 'demo'
  return (
    <div className="min-h-dvh bg-white">
      {isDemo && (
        <div className="bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Version de démonstration · données d’exemple
        </div>
      )}
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="text-sm text-ink-mute">{isDemo ? 'appli de démo' : 'appli du client'}</p>
        <h1 className="mt-1 text-3xl font-extrabold">{projectName ?? 'Application'}</h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Ici tourne l’application du développeur. En production, c’est un vrai conteneur avec sa propre base de
          données, à une adresse {isDemo ? 'd-xxxxxxxx.demo.DOMAINE' : '<slug>.app.DOMAINE'}.
        </p>
      </div>
    </div>
  )
}

/* ---------------------------- Fichier simulé -------------------------------- */

export function MockFilePage({ name }: { name: string }) {
  const router = useRouter()
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-bold">Fichier simulé : {name}</h1>
      <p className="mt-2 text-sm text-ink-soft">En production, le téléchargement démarre ici.</p>
      <button type="button" onClick={() => router.back()} className="mt-6 text-sm font-semibold text-brand">
        Retour
      </button>
    </div>
  )
}

/* ---------------------------- Aperçu de facture ----------------------------- */

export function MockInvoicePage({ accessToken }: { accessToken: string }) {
  const { data, error, isPending } = useQuery({
    queryKey: ['mock-invoice', accessToken],
    queryFn: () => getMockInvoice(accessToken),
  })

  if (isPending) return <Spinner className="mx-auto mt-20 size-6 text-ink-mute" />
  if (error || !data) return <p className="mt-20 text-center text-sm text-danger">{error?.message}</p>

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href={`/c/${accessToken}`} className="text-sm font-semibold text-brand">
          ← Mon espace
        </Link>
        <Button variant="secondary" onClick={() => window.print()}>
          Imprimer / PDF
        </Button>
      </div>
      <article className="rounded-2xl bg-white p-10 ring-1 ring-line print:ring-0">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Facture</h1>
            <p className="mt-1 font-mono text-sm text-ink-soft">{data.number}</p>
          </div>
          <p className="text-right text-sm text-ink-soft">Émise le {formatDateTime(data.issuedAt)}</p>
        </header>
        <div className="mt-10 grid grid-cols-2 gap-6 text-sm">
          <div>
            <Eyebrow>Vendeur</Eyebrow>
            <p className="mt-2 font-semibold">{data.devName}</p>
          </div>
          <div>
            <Eyebrow>Acheteur</Eyebrow>
            <p className="mt-2 font-semibold">{data.buyer.name}</p>
            <p className="text-ink-soft">{data.buyer.email}</p>
            <p className="text-ink-soft">+225 {formatCiPhone(data.buyer.phone)}</p>
          </div>
        </div>
        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-mute">
              <th className="py-2 font-medium">Désignation</th>
              <th className="py-2 text-right font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line">
              <td className="py-3">Livraison du logiciel « {data.projectName} »</td>
              <td className="py-3 text-right tabular">{formatXof(data.amountXof)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-bold">Total réglé</td>
              <td className="pt-4 text-right text-lg font-extrabold tabular">{formatXof(data.amountXof)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="mt-10 text-xs leading-relaxed text-ink-mute">
          Réglé par {providerLabel[data.provider]}. Facture éditée par {BRAND} pour le compte du vendeur. Aperçu simulé :
          le PDF officiel est produit par le serveur.
        </p>
      </article>
    </div>
  )
}
