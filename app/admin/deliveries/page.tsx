'use client';

import { useState } from 'react';
import { StatusBadge, Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { ExternalIcon } from '@/components/Icons';
import { errorMessage } from '@/lib/api/client';
import type { DeliveryStatus } from '@/lib/contracts';
import { STATUS_UI, formatXof, timeAgo } from '@/lib/delivery-ui';
import { useAdminDeliveries } from '@/lib/queries/admin';

/** Toutes les livraisons de la plateforme, filtrables par statut. */
export default function AdminDeliveriesPage() {
  const [status, setStatus] = useState<DeliveryStatus | ''>('');
  const { data, isPending, error, refetch } = useAdminDeliveries(status || undefined);
  return (
    <DevPage>
      <PageHeader eyebrow="Plateforme" title="Livraisons" />
      <label className="mb-4 inline-flex items-center gap-2 text-[14px]">
        <span className="font-semibold">Statut</span>
        <select value={status} onChange={e => setStatus(e.target.value as DeliveryStatus | '')} className="h-10 rounded-xl border border-f-line bg-f-card px-3 text-[14px]">
          <option value="">Tous</option>
          {(Object.keys(STATUS_UI) as DeliveryStatus[]).map(s => (
            <option key={s} value={s}>
              {STATUS_UI[s].label}
            </option>
          ))}
        </select>
      </label>
      {isPending ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <Card className="px-6 py-14 text-center text-[15px] text-f-muted">Aucune livraison.</Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="border-b border-f-line text-[12px] uppercase tracking-[.08em] text-f-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Projet</th>
                <th className="px-3 py-3 font-semibold">Développeur</th>
                <th className="px-3 py-3 font-semibold">Client</th>
                <th className="px-3 py-3 font-semibold">Statut</th>
                <th className="px-3 py-3 text-right font-semibold">Montant</th>
                <th className="px-5 py-3 font-semibold">Mise à jour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-divider)]">
              {data.map(d => (
                <tr key={d.id}>
                  <td className="px-5 py-3 font-semibold">
                    <a href={d.publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-f-ink-accent">
                      {d.projectName} <ExternalIcon size={13} />
                    </a>
                  </td>
                  <td className="px-3 py-3">
                    {d.devName}
                    <span className="block text-[12px] text-f-muted">{d.devEmail}</span>
                  </td>
                  <td className="px-3 py-3">
                    {d.clientName}
                    {d.hasClientAccount ? <span className="block text-[12px] text-f-muted">compte Fid’s</span> : null}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums">{formatXof(d.amountXof)}</td>
                  <td className="px-5 py-3 text-f-muted">{timeAgo(d.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DevPage>
  );
}
