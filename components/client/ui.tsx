import type { ClientDelivery } from '@/lib/contracts';
import { clientBadge } from '@/lib/client-ui';
import { TONE_CLASS } from '@/lib/delivery-ui';

/** Statut d'une livraison vu par le client (paiement en vérification et ticket compris). */
export function ClientBadge({ delivery }: { delivery: ClientDelivery }) {
  const b = clientBadge(delivery);
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[b.tone]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {b.label}
    </span>
  );
}

/** Montant total pour le client : paiement au dev + frais Fid’s. */
export const totalFor = (d: ClientDelivery) => d.amountXof + d.fee.amountXof;
