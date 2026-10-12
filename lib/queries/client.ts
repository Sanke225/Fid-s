'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { ClientDelivery, ClientPayment, ClientTicket, InvoiceSummary } from '@/lib/contracts';

export const clientKeys = {
  deliveries: ['client', 'deliveries'] as const,
  payments: ['client', 'payments'] as const,
  invoices: ['client', 'invoices'] as const,
};

/** Livraisons rattachées au compte client (GET /api/v1/client/deliveries). */
export function useClientDeliveries({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: clientKeys.deliveries,
    queryFn: ({ signal }) => apiFetch<{ items: ClientDelivery[] }>('/client/deliveries', { signal }).then(r => r.items),
    enabled,
    refetchInterval: 15_000,
  });
}

/** Ajoute une livraison à l'espace avec son lien (POST /api/v1/client/deliveries/claim). */
export function useClaimDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (link: string) => apiFetch<ClientDelivery>('/client/deliveries/claim', { method: 'POST', body: { link } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client'] }),
  });
}

/** Paiements au dev et frais Fid’s du client (GET /api/v1/client/payments). */
export function useClientPayments() {
  return useQuery({
    queryKey: clientKeys.payments,
    queryFn: ({ signal }) => apiFetch<{ items: ClientPayment[] }>('/client/payments', { signal }).then(r => r.items),
  });
}

/** Factures reçues (GET /api/v1/client/invoices). */
export function useClientInvoices() {
  return useQuery({
    queryKey: clientKeys.invoices,
    queryFn: ({ signal }) => apiFetch<{ items: InvoiceSummary[] }>('/client/invoices', { signal }).then(r => r.items),
  });
}

/** Factures émises par le dev (GET /api/v1/invoices). */
export function useDevInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: ({ signal }) => apiFetch<{ items: InvoiceSummary[] }>('/invoices', { signal }).then(r => r.items),
  });
}

/** Litiges du client (GET /api/v1/client/tickets). */
export function useClientTickets({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['client', 'tickets'],
    queryFn: ({ signal }) => apiFetch<{ items: ClientTicket[] }>('/client/tickets', { signal }).then(r => r.items),
    enabled,
    refetchInterval: 30_000,
  });
}
