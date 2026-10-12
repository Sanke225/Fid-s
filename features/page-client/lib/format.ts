const xof = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** 150000 → « 150 000 FCFA » (on écrit FCFA à l'écran, XOF dans le code). */
export function formatXof(amount: number): string {
  return `${xof.format(amount)} FCFA`
}

const dateTime = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso))
}

const day = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

export function formatDay(iso: string): string {
  return day.format(new Date(iso))
}

/** Nombre de jours entiers restants avant une date, jamais négatif. */
export function daysUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86_400_000))
}

export { formatPhone, normalizePhone } from '@/lib/phone'
export { PROVIDER_NAME as providerLabel } from '@/components/payments/ProviderLogo'
