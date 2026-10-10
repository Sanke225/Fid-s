'use client'

import { cx } from '../lib/cx'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useId, useState, type FormEvent } from 'react'
import { Button, Card, Notice } from '../components/ui'
import { ApiError } from '../lib/api'
import type { Provider, PublicDelivery } from '../lib/contracts'
import { formatXof, normalizeCiPhone, providerLabel } from '../lib/format'
import { api } from '../lib/publicApi'
import { payerTokenStore, readStorage, writeStorage } from '../lib/storage'
import { deliveryKey } from '../delivery/useDelivery'

/** Les moyens connus, dans l'ordre d'affichage. Ceux que le serveur ne propose pas sont grisés « bientôt ». */
const KNOWN_PROVIDERS: Provider[] = ['wave', 'orange_money']

const checkoutKey = (token: string) => `recette.checkout.${token}`

const errorMessages: Record<string, string> = {
  DELIVERY_NOT_PAYABLE: "Cette livraison n'est plus payable. La page va se mettre à jour.",
  PROVIDER_NOT_AVAILABLE: "Ce moyen de paiement n'est pas disponible pour cette livraison.",
  PROVIDER_ERROR: 'Le service de paiement ne répond pas. Réessayez dans un instant.',
  NETWORK_ERROR: 'Connexion impossible. Vérifiez votre réseau et réessayez.',
}

interface Props {
  token: string
  delivery: PublicDelivery
  /** Le client revient de la page du fournisseur (?retour=1). */
  returning: boolean
}

export function PaymentPanel({ token, delivery, returning }: Props) {
  const [open, setOpen] = useState(false)
  const active = delivery.activePayment
  const pending = active?.status === 'initiated'
  const lastCheckout = readStorage(checkoutKey(token))

  if (delivery.paymentMethods.length === 0) {
    return (
      <Notice tone="warn">
        Le paiement n’est pas encore ouvert pour cette livraison. Contactez {delivery.devName}.
      </Notice>
    )
  }

  // Un paiement est lancé : on attend la confirmation du fournisseur, rien d'autre ne débloque.
  if (pending) {
    return (
      <Card className="animate-rise">
        <div className="flex items-start gap-3">
          <span className="relative mt-1 flex size-3">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-3 rounded-full bg-brand" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {returning ? 'Vérification de votre paiement…' : 'Paiement en attente de confirmation'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Validez le paiement sur votre téléphone. Cette page se met à jour toute seule dès que{' '}
              {delivery.devName} reçoit l’argent.
            </p>
          </div>
        </div>
        {lastCheckout && (
          <a
            href={lastCheckout}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-brand ring-1 ring-brand/30 hover:bg-brand-soft"
          >
            Reprendre le paiement
          </a>
        )}
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {active?.status === 'failed' && (
        <Notice tone="danger">Le paiement n’a pas abouti. Aucun montant n’a été prélevé, vous pouvez réessayer.</Notice>
      )}
      {active?.status === 'expired' && (
        <Notice tone="warn">Le délai du paiement précédent est dépassé. Vous pouvez relancer le paiement.</Notice>
      )}

      {open ? (
        <PaymentForm token={token} delivery={delivery} onCancel={() => setOpen(false)} />
      ) : (
        <Button className="min-h-14 w-full text-base" onClick={() => setOpen(true)}>
          Payer {formatXof(delivery.amountXof)}
        </Button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function PaymentForm({
  token,
  delivery,
  onCancel,
}: {
  token: string
  delivery: PublicDelivery
  onCancel: () => void
}) {
  const ids = { name: useId(), phone: useId(), email: useId() }
  const offered = delivery.paymentMethods
  const choices = [...KNOWN_PROVIDERS, ...offered.filter((p) => !KNOWN_PROVIDERS.includes(p))]
  const [provider, setProvider] = useState<Provider>(offered[0])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const queryClient = useQueryClient()

  const normalizedPhone = normalizeCiPhone(phone)
  const errors = {
    name: name.trim().length < 2 ? 'Indiquez votre nom.' : null,
    phone: normalizedPhone ? null : 'Numéro à 10 chiffres, par exemple 07 07 12 34 56.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : 'Adresse e-mail invalide.',
  }
  const valid = !errors.name && !errors.phone && !errors.email

  const pay = useMutation({
    mutationFn: () =>
      api.createPayment(token, {
        provider,
        payer: { name: name.trim(), email: email.trim(), phone: normalizedPhone ?? '' },
      }),
    onSuccess: ({ payerToken, checkoutUrl }) => {
      payerTokenStore.set(token, payerToken)
      writeStorage(checkoutKey(token), checkoutUrl)
      window.location.assign(checkoutUrl)
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === 'DELIVERY_NOT_PAYABLE') {
        void queryClient.invalidateQueries({ queryKey: deliveryKey(token) })
      }
    },
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (valid) pay.mutate()
  }

  const apiError =
    pay.error instanceof ApiError ? (errorMessages[pay.error.code] ?? pay.error.message) : pay.error ? errorMessages.PROVIDER_ERROR : null

  return (
    <Card className="animate-rise">
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Payer avec</legend>
          <div className="grid grid-cols-2 gap-2">
            {choices.map((p) => {
              const available = offered.includes(p)
              const selected = provider === p
              return (
                <label
                  key={p}
                  className={cx(
                    'relative flex min-h-16 cursor-pointer flex-col justify-center rounded-xl px-4 ring-1 transition',
                    selected ? 'bg-brand-soft ring-2 ring-brand' : 'bg-card ring-line hover:ring-ink-mute',
                    !available && 'cursor-not-allowed opacity-50 hover:ring-line',
                  )}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={p}
                    checked={selected}
                    disabled={!available}
                    onChange={() => setProvider(p)}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2 font-semibold">
                    <ProviderDot provider={p} />
                    {providerLabel[p]}
                  </span>
                  {!available && <span className="text-xs text-ink-mute">Bientôt</span>}
                </label>
              )
            })}
          </div>
        </fieldset>

        <Field id={ids.name} label="Votre nom" error={touched ? errors.name : null}>
          <input
            id={ids.name}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls(touched && !!errors.name)}
          />
        </Field>

        <Field
          id={ids.phone}
          label={`Numéro ${providerLabel[provider]}`}
          hint="Le numéro qui va payer."
          error={touched ? errors.phone : null}
        >
          <div className={cx(inputCls(touched && !!errors.phone), 'flex items-center gap-2 p-0 pl-3')}>
            <span className="text-ink-mute">+225</span>
            <input
              id={ids.phone}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="07 07 12 34 56"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="min-h-12 w-full bg-transparent pr-3 outline-none tabular"
            />
          </div>
        </Field>

        <Field
          id={ids.email}
          label="E-mail"
          hint="Pour recevoir le lien de votre application et la facture."
          error={touched ? errors.email : null}
        >
          <input
            id={ids.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls(touched && !!errors.email)}
          />
        </Field>

        {apiError && <Notice tone="danger">{apiError}</Notice>}

        <div className="flex flex-col gap-2">
          <Button type="submit" loading={pay.isPending || pay.isSuccess} className="min-h-14 w-full text-base">
            {pay.isPending || pay.isSuccess ? 'Ouverture du paiement…' : `Payer ${formatXof(delivery.amountXof)}`}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={pay.isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Card>
  )
}

function inputCls(invalid: boolean) {
  return cx(
    'min-h-12 w-full rounded-xl bg-card px-3 text-[16px] ring-1 outline-none transition focus-within:ring-2 focus-within:ring-brand',
    invalid ? 'ring-danger' : 'ring-line',
  )
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-danger">{error}</p>
      ) : (
        hint && <p className="text-xs text-ink-mute">{hint}</p>
      )}
    </div>
  )
}

/** Pastille de couleur neutre : pas de logo de marque tiers. */
function ProviderDot({ provider }: { provider: Provider }) {
  const color = provider === 'wave' ? 'bg-sky-400' : provider === 'orange_money' ? 'bg-orange-500' : 'bg-ink-mute'
  return <span aria-hidden className={cx('size-2.5 rounded-full', color)} />
}
