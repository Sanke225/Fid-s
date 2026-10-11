'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronRightIcon, SearchIcon } from '@/components/Icons';
import { Card, DevPage, EmptyState, ErrorState, PageHeader, Skeleton, StatusBadge } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { STATUS_GROUPS, formatXof, latestDelivery, timeAgo } from '@/lib/delivery-ui';
import { useProjects } from '@/lib/queries/projects';

type GroupId = (typeof STATUS_GROUPS)[number]['id'];

export default function ProjectsPage() {
  const { data: projects, isPending, error, refetch } = useProjects();
  const [group, setGroup] = useState<GroupId>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUS_GROUPS.map(g => [g.id, 0])) as Record<GroupId, number>;
    for (const p of projects ?? []) {
      const status = latestDelivery(p)?.status;
      c.all++;
      for (const g of STATUS_GROUPS) {
        if (g.statuses && status && (g.statuses as readonly string[]).includes(status)) c[g.id]++;
      }
    }
    return c;
  }, [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const statuses = STATUS_GROUPS.find(g => g.id === group)?.statuses as readonly string[] | null;
    return (projects ?? []).filter(p => {
      const d = latestDelivery(p);
      if (statuses && (!d || !statuses.includes(d.status))) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (d?.client.name.toLowerCase().includes(q) ?? false);
    });
  }, [projects, group, query]);

  return (
    <DevPage>
      <PageHeader
        eyebrow="Gestion des livraisons"
        title={`Mes projets${projects ? ` (${projects.length})` : ''}`}
      />

      {projects && projects.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <label className="relative w-full max-w-md">
            <span className="sr-only">Rechercher un projet ou un client</span>
            <SearchIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-f-muted" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher par projet ou client…"
              className="h-12 w-full rounded-full border border-f-line bg-f-card pl-11 pr-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
            />
          </label>
          <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
            {STATUS_GROUPS.filter(g => g.id === 'all' || counts[g.id] > 0).map(g => (
              <button
                key={g.id}
                type="button"
                aria-pressed={group === g.id}
                onClick={() => setGroup(g.id)}
                className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                  group === g.id ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line bg-f-card hover:bg-f-surface'
                }`}
              >
                {g.label} <span className="opacity-70">{counts[g.id]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isPending ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="Aucun projet pour l’instant"
          text="Créez votre premier projet : votre client testera l’application sur une démo, puis vous paiera directement par Mobile Money."
          action={{ href: '/dev/new', label: 'Créer un projet' }}
        />
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-[15px] text-f-muted">Aucun projet ne correspond à ces critères.</Card>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(p => {
            const d = latestDelivery(p);
            return (
              <li key={p.id}>
                <Link
                  href={`/dev/project/${p.id}`}
                  className="group flex h-full flex-col rounded-[24px] border border-f-line bg-f-card p-5 shadow-f-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-f-float"
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(120deg,#A63E00,#FF6A00)] font-display text-[17px] text-white">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-bold" title={p.name}>{p.name}</p>
                      <p className="truncate text-[13.5px] text-f-muted">{d ? `Client : ${d.client.name}` : 'Aucune livraison'}</p>
                      {d ? <div className="mt-2"><StatusBadge status={d.status} /></div> : null}
                    </div>
                  </div>
                  {d?.pendingPaymentId ? (
                    <p className="mt-4 rounded-xl bg-[var(--warning-100)] px-3 py-2 text-[13px] font-semibold text-[var(--warning-800)]">
                      Paiement déclaré : à confirmer
                    </p>
                  ) : null}
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-f-line pt-4">
                    <div>
                      <p className="text-[12px] text-f-muted">Solde convenu</p>
                      <p className="text-[19px] font-bold text-f-ink-accent">{d ? formatXof(d.amountXof) : '—'}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[13px] font-semibold text-f-muted group-hover:text-f-text">
                      {timeAgo(p.updatedAt)}
                      <ChevronRightIcon size={15} />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DevPage>
  );
}
