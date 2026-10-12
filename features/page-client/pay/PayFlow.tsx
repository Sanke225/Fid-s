'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { ProviderLogo } from '@/components/payments/ProviderLogo'
import { Button, Card, CopyButton, Notice } from '../components/ui'
import type { Provider } from '../lib/contracts'
import { cx } from '../lib/cx'
import { formatPhone, formatXof, normalizePhone, providerLabel } from '../lib/format'

/** Un numéro sur lequel payer : celui du développeur, ou celui de Fid’s pour les frais. */
export interface PayTarget {
  /** Identifiant de choix (id du moyen de paiement du dev, ou opérateur pour Fid’s). */
  key: string
  provider: Provider
  phone: string
  label?: string | null
}

export interface Declaration {
  target: PayTarget
  payerName: string
  payerPhone: string
  transactionRef: string
}

/**
 * Paiement direct en deux temps : 1) envoyer le montant exact sur un numéro, depuis son application
 * Mobile Money ; 2) déclarer le paiement avec la référence reçue par SMS. Rien n'est débloqué ici :
 * c'est la confirmation côté serveur qui compte.
 */
export function PayFlow({
  targets,
  amountXof,
  payee,
  submitLabel,
  pending,
  error,
  onDeclare,
  onCancel,
  intro,
}: {
  targets: PayTarget[]
  amountXof: number
  /** « Yannick K. » ou « Fid’s » */
  payee: string
  submitLabel: string
  pending: boolean
  error: string | null
  onDeclare: (d: Declaration) => void
  onCancel?: () => void
  intro?: ReactNode
}) {
  const ids = { name: useId(), phone: useId(), ref: useId() }
  const [key, setKey] = useState(targets[0]?.key ?? '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [ref, setRef] = useState('')
  const [touched, setTouched] = useState(false)
  const target = targets.find((t) => t.key === key) ?? targets[0]

  const normalized = normalizePhone(phone)
  const errors = {
    name: name.trim().length < 2 ? 'Indiquez votre nom.' : null,
    phone: normalized ? null : 'Numéro attendu au format 07 07 12 34 56 ou +225…',
    ref: ref.trim().length < 4 ? 'Recopiez la référence indiquée dans le SMS de confirmation.' : null,
  }
  const valid = !errors.name && !errors.phone && !errors.ref

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (valid && target && normalized) {
      onDeclare({ target, payerName: name.trim(), payerPhone: normalized, transactionRef: ref.trim() })
    }
  }

  return (
    <Card className="animate-rise">
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        {intro}

        {/* 1. Envoyer l'argent */}
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 flex items-center gap-2 font-semibold">
            <Step n={1} /> Envoyez {formatXof(amountXof)} à {payee}
          </legend>
          {targets.length > 1 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {targets.map((t) => {
                const selected = t.key === target?.key
                return (
                  <label
                    key={t.key}
                    className={cx(
                      'relative flex min-h-16 cursor-pointer items-center gap-3 rounded-xl px-3 ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
                      selected ? 'bg-brand-soft ring-2 ring-brand' : 'bg-card ring-line hover:ring-ink-mute',
                    )}
                  >
                    <input type="radio" name="target" value={t.key} checked={selected} onChange={() => setKey(t.key)} className="sr-only" />
                    <ProviderLogo provider={t.provider} size={36} className="shrink-0 rounded-lg" />
                    <span className="leading-tight">
                      <span className="block font-semibold">{providerLabel[t.provider]}</span>
                      <span className="block text-xs text-ink-mute">{t.label ?? 'Numéro de réception'}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          ) : null}

          {target ? (
            <div className="rounded-2xl bg-paper p-4 ring-1 ring-line">
              <div className="flex items-center gap-3">
                <ProviderLogo provider={target.provider} size={44} className="shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-mute">Numéro {providerLabel[target.provider]} de {payee}</p>
                  <p className="font-mono text-xl font-bold tracking-wide tabular">{formatPhone(target.phone)}</p>
                </div>
                <CopyButton value={target.phone.replace('+225', '')} label="Copier" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Depuis votre application {providerLabel[target.provider]}, envoyez <strong className="text-ink">exactement {formatXof(amountXof)}</strong> à ce
                numéro, puis revenez ici.
              </p>
            </div>
          ) : null}
        </fieldset>

        {/* 2. Déclarer */}
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 flex items-center gap-2 font-semibold">
            <Step n={2} /> Déclarez votre paiement
          </legend>
          <Field id={ids.ref} label="Référence de la transaction" hint={`Elle figure dans le SMS de confirmation de ${target ? providerLabel[target.provider] : 'votre opérateur'}.`} error={touched ? errors.ref : null}>
            <input
              id={ids.ref}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              placeholder="Ex. : MP260411.1532.A12345"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              className={inputCls(touched && !!errors.ref, 'font-mono')}
            />
          </Field>
          <Field id={ids.name} label="Votre nom" error={touched ? errors.name : null}>
            <input id={ids.name} autoComplete="name" placeholder="Ex. : Mariam Traoré" value={name} onChange={(e) => setName(e.target.value)} className={inputCls(touched && !!errors.name)} />
          </Field>
          <Field id={ids.phone} label="Numéro qui a payé" error={touched ? errors.phone : null}>
            <input
              id={ids.phone}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="07 07 12 34 56"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls(touched && !!errors.phone, 'tabular')}
            />
          </Field>
        </fieldset>

        {error ? <Notice tone="danger">{error}</Notice> : null}

        <div className="flex flex-col gap-2">
          <Button type="submit" loading={pending} className="min-h-14 w-full text-base">
            {pending ? 'Envoi…' : submitLabel}
          </Button>
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
              Annuler
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  )
}

export function Step({ n }: { n: number }) {
  return <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white tabular">{n}</span>
}

function inputCls(invalid: boolean, extra?: string) {
  return cx(
    'min-h-12 w-full rounded-xl bg-card px-3 text-[16px] ring-1 outline-none transition focus:ring-2 focus:ring-brand',
    invalid ? 'ring-danger' : 'ring-line',
    extra,
  )
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : hint ? <p className="text-xs text-ink-mute">{hint}</p> : null}
    </div>
  )
}
