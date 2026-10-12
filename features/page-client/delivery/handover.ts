import type { PublicDelivery } from '../lib/contracts'

export type Step = { label: string; detail: string; state: 'done' | 'active' | 'todo' }

/** paid → handing_over → delivered, tel que le client le voit (dépôt et frais déjà confirmés). */
export function handoverSteps(status: PublicDelivery['status']): Step[] {
  const order = ['paid', 'handing_over', 'delivered'] as const
  const at = order.indexOf(status as (typeof order)[number])
  const state = (i: number): Step['state'] => (at > i || status === 'delivered' ? 'done' : at === i ? 'active' : 'todo')
  return [
    { label: 'Paiement et frais reçus', detail: 'Le développeur et Fid’s ont confirmé vos règlements.', state: at >= 0 ? 'done' : 'todo' },
    { label: 'Installation à votre nom', detail: 'Nouvelle adresse, base de données neuve, sauvegarde.', state: state(1) },
    { label: 'Application prête', detail: 'Vos accès et votre facture sont disponibles.', state: status === 'delivered' ? 'done' : 'todo' },
  ]
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
