'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { CreatePayoutMethodInput, PayoutMethod } from '@/lib/contracts';
import { queryKeys } from './keys';

/** Numéros de réception actifs du dev (GET /api/v1/payout-methods). */
export function usePayoutMethods() {
  return useQuery({
    queryKey: queryKeys.payoutMethods,
    queryFn: ({ signal }) => apiFetch<{ items: PayoutMethod[] }>('/payout-methods', { signal }).then(r => r.items),
  });
}

export function useAddPayoutMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePayoutMethodInput) => apiFetch<PayoutMethod>('/payout-methods', { method: 'POST', body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payoutMethods }),
  });
}

export function useRemovePayoutMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/payout-methods/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.payoutMethods }),
  });
}
