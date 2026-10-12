'use client';

import { useMemo, useState } from 'react';
import { SearchIcon } from '@/components/Icons';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { TONE_CLASS, formatDate } from '@/lib/delivery-ui';
import { formatPhone } from '@/lib/phone';
import { useAdminUsers } from '@/lib/queries/admin';
import { ROLE_LABEL } from '@/lib/queries/me';

/** Comptes de la plateforme (lecture seule : le rôle admin se donne par script). */
export default function AdminUsersPage() {
  const { data, isPending, error, refetch } = useAdminUsers();
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter(u => !q || u.name.toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q));
  }, [data, query]);

  return (
    <DevPage>
      <PageHeader eyebrow="Plateforme" title={`Utilisateurs${data ? ` (${data.length})` : ''}`} />
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">Rechercher un compte</span>
        <SearchIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-f-muted" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou e-mail…"
          className="h-12 w-full rounded-full border border-f-line bg-f-card pl-11 pr-4 text-[15px] outline-none focus:border-[var(--color-accent)]"
        />
      </label>
      {isPending ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="border-b border-f-line text-[12px] uppercase tracking-[.08em] text-f-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Compte</th>
                <th className="px-3 py-3 font-semibold">Rôle</th>
                <th className="px-3 py-3 font-semibold">Téléphone</th>
                <th className="px-3 py-3 text-right font-semibold">Livraisons</th>
                <th className="px-5 py-3 font-semibold">Inscrit le</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-divider)]">
              {visible.map(u => (
                <tr key={u.id}>
                  <td className="px-5 py-3">
                    <span className="font-semibold">{u.name}</span>
                    {u.businessName ? <span className="text-f-muted"> · {u.businessName}</span> : null}
                    <span className="block text-[12.5px] text-f-muted">{u.deletedAt ? `Supprimé le ${formatDate(u.deletedAt)}` : (u.email ?? 'Sans e-mail')}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[u.role === 'admin' ? 'danger' : u.role === 'dev' ? 'accent' : u.role === 'client' ? 'info' : 'neutral']}`}>
                      {u.role ? ROLE_LABEL[u.role] : 'Rôle non choisi'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-f-muted">{u.phone ? formatPhone(u.phone) : '—'}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{u.deliveriesCount}</td>
                  <td className="px-5 py-3 text-f-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </DevPage>
  );
}
