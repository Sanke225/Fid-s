// Libellés et couleurs des statuts de livraison, communs aux écrans dev.
import type { DeliveryStatus, ProjectWithDeliveries, Ticket } from '@/lib/contracts';

export type Tone = 'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger';

export const STATUS_UI: Record<DeliveryStatus, { label: string; tone: Tone; hint: string }> = {
  draft: { label: 'En attente du code', tone: 'neutral', hint: 'Le code source n’a pas encore été envoyé.' },
  building: { label: 'Installation', tone: 'info', hint: 'La démo est en cours d’installation.' },
  build_failed: { label: 'Installation échouée', tone: 'danger', hint: 'L’installation de la démo a échoué.' },
  demo_ready: { label: 'Démo en ligne', tone: 'accent', hint: 'Le client peut tester et payer.' },
  fee_pending: {
    label: 'Payée · frais client en attente',
    tone: 'warning',
    hint: 'Vous avez reçu le paiement. Le client doit encore régler les frais de service Fid’s (5 %) pour recevoir l’application : la démo reste consultable en attendant.',
  },
  paid: { label: 'Payée', tone: 'success', hint: 'Paiement confirmé, passation à venir.' },
  handing_over: { label: 'Passation', tone: 'info', hint: 'L’application passe au nom du client.' },
  handover_failed: { label: 'Passation bloquée', tone: 'danger', hint: 'La passation a échoué.' },
  delivered: { label: 'Livrée', tone: 'success', hint: 'Le client a reçu son application.' },
  expired: { label: 'Expirée', tone: 'neutral', hint: 'Délai dépassé sans paiement.' },
  cancelled: { label: 'Annulée', tone: 'neutral', hint: 'Livraison annulée.' },
};

/** Classes Tailwind par tonalité (jetons de globals.css, lisibles en clair et en sombre). */
export const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-f-surface text-f-muted',
  info: 'bg-[var(--info-100)] text-[var(--info-800)]',
  accent: 'bg-[var(--color-accent-100)] text-f-ink-accent',
  success: 'bg-[var(--success-100)] text-[var(--success-800)]',
  warning: 'bg-[var(--warning-100)] text-[var(--warning-800)]',
  danger: 'bg-[var(--danger-100)] text-[var(--danger-800)]',
};

/** Statuts regroupés pour les filtres de la liste. */
export const STATUS_GROUPS = [
  { id: 'all', label: 'Tous', statuses: null },
  { id: 'online', label: 'Démos en ligne', statuses: ['demo_ready'] },
  { id: 'preparing', label: 'En préparation', statuses: ['draft', 'building'] },
  { id: 'paid', label: 'Payées', statuses: ['fee_pending', 'paid', 'handing_over'] },
  { id: 'delivered', label: 'Livrées', statuses: ['delivered'] },
  { id: 'blocked', label: 'Bloquées', statuses: ['build_failed', 'handover_failed'] },
  { id: 'closed', label: 'Closes', statuses: ['expired', 'cancelled'] },
] as const satisfies readonly { id: string; label: string; statuses: readonly DeliveryStatus[] | null }[];

/** Montant encaissé par le dev : dépôt confirmé (les frais Fid’s sont payés à part par le client). */
export const PAID_STATUSES: readonly DeliveryStatus[] = ['fee_pending', 'paid', 'handing_over', 'handover_failed', 'delivered'];

export const latestDelivery = (p: ProjectWithDeliveries) => p.deliveries[0] ?? null;

export const formatXof = (n: number) => `${n.toLocaleString('fr-FR')} FCFA`;

const RTF = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** « il y a 3 heures », « hier »… à partir d'une date ISO. */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = (new Date(iso).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RTF.format(Math.round(seconds / size), unit);
  }
  return 'à l’instant';
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

/** Libellés lisibles du journal d'événements (types émis par lib/core et lib/payments). */
export const EVENT_LABEL: Record<string, string> = {
  'delivery.created': 'Livraison créée',
  'delivery.updated': 'Livraison modifiée',
  'delivery.cancelled': 'Livraison annulée',
  'delivery.claimed': 'Ajoutée à l’espace du client',
  'delivery.expired': 'Livraison expirée',
  'source.submitted': 'Code source envoyé',
  'build.failed': 'Installation échouée',
  'space.ready': 'Démo en ligne',
  'space.failed': 'Démo indisponible',
  'payment.declared': 'Le client a déclaré un paiement',
  'payment.confirmed': 'Dépôt confirmé',
  'payment.rejected': 'Paiement rejeté',
  'fee.declared': 'Le client a déclaré les frais Fid’s',
  'fee.confirmed': 'Frais Fid’s confirmés : livraison débloquée',
  'fee.rejected': 'Frais Fid’s refusés',
  'handover.started': 'Passation démarrée',
  'handover.succeeded': 'Passation terminée',
  'handover.failed': 'Passation échouée',
  'ticket.opened': 'Ticket ouvert par le client',
  'ticket.answered': 'Réponse au ticket',
  'ticket.resolved': 'Ticket résolu',
  'transition.rejected': 'Changement d’état refusé',
};

/** Auteur d'un événement, sans identifiant technique : « user:<id> » → vous / le client, « admin:<id> » → l'administration. */
export function actorLabel(actor: string, meId?: string | null) {
  if (actor === 'system') return 'automatique';
  if (actor.startsWith('admin:')) return 'administration';
  if (actor.startsWith('user:')) return meId && actor === `user:${meId}` ? 'vous' : 'le client';
  if (actor.startsWith('payer') || actor.startsWith('client')) return 'le client';
  return 'Fid’s';
}

export { formatPhone } from './phone';

/** Statut d'un litige vu par le dev. */
export const TICKET_UI: Record<Ticket['status'], { label: string; tone: Tone }> = {
  awaiting_dev: { label: 'À vous de répondre', tone: 'danger' },
  open: { label: 'En arbitrage Fid’s', tone: 'info' },
  resolved_released: { label: 'Paiement reconnu', tone: 'success' },
  resolved_rejected: { label: 'Paiement non reconnu', tone: 'neutral' },
};
