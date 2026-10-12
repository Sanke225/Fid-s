'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SearchIcon } from '@/components/Icons';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { PAID_STATUSES, formatXof, timeAgo } from '@/lib/delivery-ui';
import { formatPhone } from '@/lib/phone';
import { useProjects } from '@/lib/queries/projects';

interface ClientRow {
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  hasAccount: boolean;
  deliveries: number;
  encaisse: number;
  lastAt: string;
  lastProjectId: string;
}

/** Les clients du dev, déduits de ses livraisons (même nom + même contact = même client). */
export default function DevClientsPage() {
  const { data: projects, isPending, error, refetch } = useProjects();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const map = new Map<string, ClientRow>();
    for (const p of projects ?? []) {
      for (const d of p.deliveries) {
        if (d.status === 'cancelled') continue;
        const key = `${d.client.name.trim().toLowerCase()}|${d.client.email ?? d.client.phone ?? ''}`;
        const r = map.get(key) ?? { key, name: d.client.name, email: d.client.email, phone: d.client.phone, hasAccount: false, deliveries: 0, encaisse: 0, lastAt: d.updatedAt, lastProjectId: p.id };
        r.deliveries++;
        r.hasAccount ||= d.client.hasAccount;
        if (PAID_STATUSES.includes(d.status)) r.encaisse += d.amountXof;
        if (d.updatedAt > r.lastAt) {
          r.lastAt = d.updatedAt;
          r.lastProjectId = p.id;
        }
        map.set(key, r);
      }
    }
    return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  }, [projects]);

  const q = query.trim().toLowerCase();
  const visible = rows.filter(r => !q || r.name.toLowerCase().includes(q) || (r.email ?? '').toLowerCase().includes(q));

  return (
    <DevPage>
      <PageHeader eyebrow="Relation client" title={`Clients${projects ? ` (${rows.length})` : ''}`} />
      {rows.length > 0 ? (
        <label className="relative mb-6 block max-w-md">
          <span className="sr-only">Rechercher un client</span>
          <SearchIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-f-muted" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher par nom ou e-mail…"
            className="h-12 w-full rounded-full border border-f-line bg-f-card pl-11 pr-4 text-[15px] outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
          />
        </label>
      ) : null}
      {isPending ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : rows.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="font-display text-[22px]">Aucun client pour l’instant</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">Vos clients apparaissent ici dès votre première livraison.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-divider)]">
            {visible.map(r => (
              <li key={r.key}>
                <Link href={`/dev/project/${r.lastProjectId}`} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-f-surface">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-f-text text-[13px] font-bold text-f-bg">
                    {r.name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">
                      {r.name}
                      {r.hasAccount ? <span className="ml-2 rounded-full bg-[var(--success-100)] px-2 py-0.5 text-[11px] font-semibold text-[var(--success-800)]">Compte Fid’s</span> : null}
                    </span>
                    <span className="block truncate text-[13px] text-f-muted">
                      {[r.email, r.phone ? formatPhone(r.phone) : null].filter(Boolean).join(' · ') || 'Aucun contact'} · {timeAgo(r.lastAt)}
                    </span>
                  </span>
                  <span className="text-right text-[13px] text-f-muted">
                    <span className="block text-[15px] font-bold text-f-text">{formatXof(r.encaisse)}</span>
                    {r.deliveries} livraison{r.deliveries > 1 ? 's' : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </DevPage>
  );
}
