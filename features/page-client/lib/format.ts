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

/** Numéro ivoirien : 10 chiffres, avec ou sans +225 et espaces. */
export function normalizeCiPhone(input: string): string | null {
  const digits = input.replace(/[\s.-]/g, '').replace(/^(\+|00)225/, '')
  return /^0\d{9}$/.test(digits) ? digits : null
}

export function formatCiPhone(digits: string): string {
  return digits.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
}

export const providerLabel: Record<string, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  mock: 'Paiement simulé',
}
