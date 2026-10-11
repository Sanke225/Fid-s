'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { CreateDeliveryInput, Delivery, Payment, UpdateDeliveryInput } from '@/lib/contracts';
import { queryKeys } from './keys';

/** Paiement déclaré par le client sur une livraison du dev (GET /api/v1/payments/:id). */
export function usePayment(paymentId: string | null | undefined) {
  return useQuery({
    queryKey: ['payments', paymentId],
    queryFn: ({ signal }) => apiFetch<Payment>(`/payments/${encodeURIComponent(paymentId!)}`, { signal }),
    enabled: Boolean(paymentId),
  });
}

/** Après chaque action : la liste, le projet et l'historique de la livraison se rafraîchissent. */
function useRefresh() {
  const qc = useQueryClient();
  return (deliveryId?: string) =>
    Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.projects }),
      deliveryId ? qc.invalidateQueries({ queryKey: ['deliveries', deliveryId, 'events'] }) : null,
    ]);
}

/** « Dépôt confirmé » : le dev a reçu l'argent (POST /payments/:id/confirm). */
export function useConfirmPayment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (p: { paymentId: string; deliveryId: string }) =>
      apiFetch<Payment>(`/payments/${encodeURIComponent(p.paymentId)}/confirm`, { method: 'POST', body: {} }),
    onSuccess: (_, p) => refresh(p.deliveryId),
  });
}

/** « Rien reçu » : le client pourra ouvrir un ticket (POST /payments/:id/reject). */
export function useRejectPayment() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (p: { paymentId: string; deliveryId: string; reason: string }) =>
      apiFetch<Payment>(`/payments/${encodeURIComponent(p.paymentId)}/reject`, { method: 'POST', body: { reason: p.reason } }),
    onSuccess: (_, p) => refresh(p.deliveryId),
  });
}

/** Annule une livraison avant paiement (POST /deliveries/:id/cancel). */
export function useCancelDelivery() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (deliveryId: string) => apiFetch<Delivery>(`/deliveries/${encodeURIComponent(deliveryId)}/cancel`, { method: 'POST', body: {} }),
    onSuccess: (_, id) => refresh(id),
  });
}

/** Modifie montant, code source ou coordonnées du client avant paiement (PATCH /deliveries/:id). */
export function useUpdateDelivery() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (p: { deliveryId: string; input: UpdateDeliveryInput }) =>
      apiFetch<Delivery>(`/deliveries/${encodeURIComponent(p.deliveryId)}`, { method: 'PATCH', body: p.input }),
    onSuccess: (_, p) => refresh(p.deliveryId),
  });
}

/** Nouvelle livraison sur un projet existant (POST /projects/:id/deliveries). */
export function useCreateDelivery() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (p: { projectId: string; input: CreateDeliveryInput }) =>
      apiFetch<Delivery>(`/projects/${encodeURIComponent(p.projectId)}/deliveries`, { method: 'POST', body: p.input }),
    onSuccess: () => refresh(),
  });
}
