'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { NotificationList } from '@/lib/contracts';

const key = ['notifications'] as const;

/** Cloche : notifications récentes, rafraîchies toutes les 30 s. */
export function useNotifications() {
  return useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiFetch<NotificationList>('/notifications', { signal }),
    refetchInterval: 30_000,
  });
}

/** Tout marquer comme lu. */
export function useMarkNotificationsSeen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<void>('/notifications/seen', { method: 'POST', body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
