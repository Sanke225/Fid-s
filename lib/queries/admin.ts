'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { AdminDelivery, AdminEvent, AdminFee, AdminStats, AdminTicketDetail, AdminUser, DeliveryStatus, Ticket, TicketStatus } from '@/lib/contracts';

const refreshAll = (qc: ReturnType<typeof useQueryClient>) => qc.invalidateQueries({ queryKey: ['admin'] });

export function useAdminStats({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: ({ signal }) => apiFetch<AdminStats>('/admin/stats', { signal }),
    enabled,
    refetchInterval: 30_000,
  });
}

export function useAdminFees(status?: 'declared' | 'confirmed' | 'rejected') {
  return useQuery({
    queryKey: ['admin', 'fees', status ?? 'all'],
    queryFn: ({ signal }) => apiFetch<{ items: AdminFee[] }>(`/admin/fees${status ? `?status=${status}` : ''}`, { signal }).then(r => r.items),
    refetchInterval: 20_000,
  });
}

export function useDecideFee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; decision: 'confirm' | 'reject'; reason?: string }) =>
      apiFetch(`/admin/fees/${encodeURIComponent(p.id)}/${p.decision}`, { method: 'POST', body: p.decision === 'reject' ? { reason: p.reason } : {} }),
    onSuccess: () => refreshAll(qc),
  });
}

export function useAdminTickets(status?: TicketStatus) {
  return useQuery({
    queryKey: ['admin', 'tickets', status ?? 'all'],
    queryFn: ({ signal }) => apiFetch<{ items: Ticket[] }>(`/admin/tickets${status ? `?status=${status}` : ''}`, { signal }).then(r => r.items),
    refetchInterval: 30_000,
  });
}

export function useAdminTicket(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'ticket', id],
    queryFn: ({ signal }) => apiFetch<AdminTicketDetail>(`/admin/tickets/${encodeURIComponent(id!)}`, { signal }),
    enabled: Boolean(id),
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { id: string; decision: 'release' | 'reject'; resolution: string }) =>
      apiFetch(`/admin/tickets/${encodeURIComponent(p.id)}/resolve`, { method: 'POST', body: { decision: p.decision, resolution: p.resolution } }),
    onSuccess: () => refreshAll(qc),
  });
}

export function useAdminDeliveries(status?: DeliveryStatus) {
  return useQuery({
    queryKey: ['admin', 'deliveries', status ?? 'all'],
    queryFn: ({ signal }) => apiFetch<{ items: AdminDelivery[] }>(`/admin/deliveries${status ? `?status=${status}` : ''}`, { signal }).then(r => r.items),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: ({ signal }) => apiFetch<{ items: AdminUser[] }>('/admin/users', { signal }).then(r => r.items),
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ['admin', 'events'],
    queryFn: ({ signal }) => apiFetch<{ items: AdminEvent[] }>('/admin/events', { signal }).then(r => r.items),
    refetchInterval: 30_000,
  });
}
