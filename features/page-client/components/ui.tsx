'use client'

import { BRAND } from '../lib/brand'
import Link from 'next/link'
import { useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { CheckIcon, CopyIcon } from './icons'


/* ---------------------------------- Marque --------------------------------- */

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return (
    <span className={cx('inline-flex items-center gap-2 font-bold tracking-tight', tone === 'light' ? 'text-white' : 'text-ink')}>
      <span
        aria-hidden
        className={cx(
          'grid size-7 place-items-center rounded-lg text-sm font-extrabold',
          tone === 'light' ? 'bg-mint text-night' : 'bg-ink text-mint',
        )}
      >
        F
      </span>
      {BRAND}
    </span>
  )
}

/* --------------------------------- Boutons --------------------------------- */

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong disabled:bg-ink-mute',
  secondary: 'bg-card text-ink ring-1 ring-line hover:ring-ink-mute',
  ghost: 'text-ink-soft hover:text-ink hover:bg-black/5',
}

const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed'

export function Button({
  variant = 'primary',
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button className={cx(base, variants[variant], className)} disabled={disabled || loading} {...rest}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  href,
  variant = 'primary',
  className,
  children,
  external = false,
}: {
  to?: string
  href?: string
  variant?: Variant
  className?: string
  children: ReactNode
  external?: boolean
}) {
  const cls = cx(base, variants[variant], className)
  if (href) {
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    )
  }
  return (
    <Link href={to ?? '/'} className={cls}>
      {children}
    </Link>
  )
}

/* ---------------------------------- Divers --------------------------------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cx('animate-spin', className ?? 'size-5')} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx('rounded-2xl bg-card p-5 ring-1 ring-line', className)}>{children}</section>
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('text-xs font-semibold tracking-[0.08em] text-ink-mute uppercase', className)}>{children}</p>
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'warn' | 'danger'
  children: ReactNode
}) {
  const tones = {
    info: 'bg-brand-soft text-brand-strong',
    warn: 'bg-warn-soft text-warn',
    danger: 'bg-danger-soft text-danger',
  }
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cx('rounded-xl px-4 py-3 text-sm leading-relaxed', tones[tone])}>
      {children}
    </div>
  )
}

export function CopyButton({ value, label = 'Copier' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* presse-papiers refusé : l'utilisateur peut sélectionner le texte */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:text-ink hover:ring-ink-mute"
      aria-live="polite"
    >
      {copied ? <CheckIcon className="size-4 text-brand" /> : <CopyIcon className="size-4" />}
      {copied ? 'Copié' : label}
    </button>
  )
}

/** Mise en page d'une page client : colonne étroite pensée d'abord pour le téléphone. */
export function PhoneShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-lg items-center justify-between px-4 pt-5 pb-2">
        <Logo />
        <span className="text-xs text-ink-mute">Livraison sécurisée</span>
      </header>
      <main className="mx-auto flex max-w-lg flex-col gap-4 px-4 pt-3 pb-10">{children}</main>
      {footer && <footer className="mx-auto max-w-lg px-4 pb-8 text-center text-xs leading-relaxed text-ink-mute">{footer}</footer>}
    </div>
  )
}
