// Libellés et couleurs de l'espace client : formulés pour le client (ce qu'il doit faire), pas pour le dev.
import type { ClientDelivery, ClientPayment, PublicDeliveryStatus } from '@/lib/contracts';
import type { Tone } from './delivery-ui';

export const CLIENT_STATUS_UI: Record<PublicDeliveryStatus, { label: string; tone: Tone; hint: string }> = {
  preparing: { label: 'En préparation', tone: 'neutral', hint: 'Le développeur prépare la démo. Vous pourrez la tester dès qu’elle sera en ligne.' },
  demo_ready: { label: 'À tester et payer', tone: 'accent', hint: 'Testez la démo. Si elle vous convient, payez le développeur directement.' },
  awaiting_fee: { label: 'Frais Fid’s à régler', tone: 'warning', hint: 'Le développeur a reçu votre paiement. Réglez les frais de service pour recevoir l’application.' },
  paid: { label: 'Réglée · installation à venir', tone: 'info', hint: 'Tout est réglé. L’application va être installée à votre nom.' },
  handing_over: { label: 'Installation à votre nom', tone: 'info', hint: 'Nouvelle adresse, base de données neuve et sauvegarde en cours de création.' },
  delivered: { label: 'Livrée', tone: 'success', hint: 'L’application est à vous : accès, facture et sauvegarde disponibles.' },
  unavailable: { label: 'Plus disponible', tone: 'neutral', hint: 'Cette livraison a expiré ou a été annulée par le développeur.' },
};

/** Ce que le client doit faire maintenant, ou null s'il n'a rien à faire. */
export function clientAction(d: ClientDelivery): { text: string; urgent: boolean } | null {
  if (d.ticketOpen) return { text: 'Ticket en cours : suivez la réponse du développeur', urgent: false };
  if (d.paymentPending) return null; // en attente du dev, rien à faire
  if (d.status === 'demo_ready') return { text: 'Testez la démo, puis payez si elle vous convient', urgent: true };
  if (d.status === 'awaiting_fee' && d.fee.status === 'due') return { text: 'Réglez les frais Fid’s pour recevoir l’application', urgent: true };
  return null;
}

/** Statut affiché, en tenant compte d'un paiement en vérification ou d'un ticket. */
export function clientBadge(d: ClientDelivery): { label: string; tone: Tone } {
  if (d.ticketOpen) return { label: 'Ticket en cours', tone: 'danger' };
  if (d.paymentPending) return { label: 'Paiement en vérification', tone: 'info' };
  if (d.status === 'awaiting_fee' && d.fee.status === 'declared') return { label: 'Frais en vérification', tone: 'info' };
  // Avant « Terminé » : on montre où en est le développement, comme chez le dev.
  if (d.status === 'preparing') {
    if (d.projectStatus === 'assigned') return { label: 'Projet assigné', tone: 'info' };
    if (d.projectStatus === 'in_progress') return { label: 'En développement', tone: 'warning' };
  }
  const ui = CLIENT_STATUS_UI[d.status];
  return { label: ui.label, tone: ui.tone };
}

export const CLIENT_GROUPS = [
  { id: 'all', label: 'Toutes', test: () => true },
  { id: 'todo', label: 'À faire', test: (d: ClientDelivery) => clientAction(d)?.urgent === true },
  { id: 'progress', label: 'En cours', test: (d: ClientDelivery) => ['preparing', 'paid', 'handing_over'].includes(d.status) || d.paymentPending || (d.status === 'awaiting_fee' && d.fee.status !== 'due') },
  { id: 'delivered', label: 'Livrées', test: (d: ClientDelivery) => d.status === 'delivered' },
  { id: 'closed', label: 'Closes', test: (d: ClientDelivery) => d.status === 'unavailable' },
] as const;

/** Statut d'un règlement (paiement au dev ou frais Fid’s), vu par le client. */
export const PAYMENT_STATUS_UI: Record<ClientPayment['status'], { label: string; tone: Tone }> = {
  declared: { label: 'En vérification', tone: 'info' },
  confirmed: { label: 'Confirmé', tone: 'success' },
  rejected: { label: 'Non reçu', tone: 'danger' },
  expired: { label: 'Expiré', tone: 'neutral' },
};
