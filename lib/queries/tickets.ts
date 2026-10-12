'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { Payment, Ticket } from '@/lib/contracts';
import { queryKeys } from './keys';

/** Tickets ouverts sur les livraisons du dev (GET /api/v1/tickets). */
export function useDevTickets({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.tickets,
    queryFn: ({ signal }) => apiFetch<{ items: Ticket[] }>('/tickets', { signal }).then(r => r.items),
    enabled,
    refetchInterval: 30_000,
  });
}

/** Un ticket et le paiement contesté (GET /api/v1/tickets/:id). */
export function useTicket(id: string | null | undefined) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: ({ signal }) => apiFetch<{ ticket: Ticket; payment: Payment }>(`/tickets/${encodeURIComponent(id!)}`, { signal }),
    enabled: Boolean(id),
  });
}

/** Réponse du dev : reconnaître le paiement (le confirme) ou maintenir « rien reçu » (l'admin tranche). */
export function useAnswerTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { ticketId: string; deliveryId: string; answer: string; acknowledgePayment: boolean }) =>
      apiFetch<Ticket>(`/tickets/${encodeURIComponent(p.ticketId)}/answer`, {
        method: 'POST',
        body: { answer: p.answer, acknowledgePayment: p.acknowledgePayment },
      }),
    onSuccess: (_, p) =>
      Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.tickets }),
        qc.invalidateQueries({ queryKey: ['tickets', p.ticketId] }),
        qc.invalidateQueries({ queryKey: queryKeys.projects }),
        qc.invalidateQueries({ queryKey: ['deliveries', p.deliveryId, 'events'] }),
      ]),
  });
}
