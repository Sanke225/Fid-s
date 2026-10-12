'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronRightIcon, PlusIcon, SearchIcon } from '@/components/Icons';
import { ClientBadge, totalFor } from '@/components/client/ui';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { CLIENT_GROUPS, clientAction } from '@/lib/client-ui';
import { formatXof, timeAgo } from '@/lib/delivery-ui';
import { useClientDeliveries } from '@/lib/queries/client';

type GroupId = (typeof CLIENT_GROUPS)[number]['id'];

export default function ClientDeliveriesPage() {
  const { data: deliveries, isPending, error, refetch } = useClientDeliveries();
  const [group, setGroup] = useState<GroupId>('all');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const g = CLIENT_GROUPS.find(x => x.id === group)!;
    return (deliveries ?? []).filter(d => g.test(d) && (!q || d.projectName.toLowerCase().includes(q) || d.devName.toLowerCase().includes(q)));
  }, [deliveries, group, query]);

  return (
    <DevPage>
      <PageHeader eyebrow="Vos commandes" title={`Mes livraisons${deliveries ? ` (${deliveries.length})` : ''}`} />

      {deliveries && deliveries.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <label className="relative w-full max-w-md">
            <span className="sr-only">Rechercher une livraison ou un développeur</span>
            <SearchIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-f-muted" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher par application ou développeur…"
              className="h-12 w-full rounded-full border border-f-line bg-f-card pl-11 pr-4 text-[15px] outline-none transition-[border-color,box-shadow] focus:border-[var(--color-accent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
            />
          </label>
          <div role="group" aria-label="Filtrer" className="flex flex-wrap gap-2">
            {CLIENT_GROUPS.map(g => {
              const count = deliveries.filter(g.test).length;
              if (g.id !== 'all' && count === 0) return null;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={group === g.id}
                  onClick={() => setGroup(g.id)}
                  className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                    group === g.id ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line bg-f-card hover:bg-f-surface'
                  }`}
                >
                  {g.label} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
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
      ) : deliveries.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="font-display text-[24px]">Aucune livraison</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">Ajoutez le lien que votre développeur vous a envoyé pour suivre votre livraison ici.</p>
          <Link href="/client/ajouter" className="cta-primary mt-6 rounded-full px-6 py-3 text-[15px]">
            <PlusIcon size={17} /> Ajouter une livraison
          </Link>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center text-[15px] text-f-muted">Aucune livraison ne correspond à ces critères.</Card>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(d => {
            const action = clientAction(d);
            return (
              <li key={d.id}>
                <Link
                  href={`/client/deliveries/${d.id}`}
                  className="group flex h-full flex-col rounded-[24px] border border-f-line bg-f-card p-5 shadow-f-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-f-float"
                >
                  <div className="flex items-start gap-3">
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(120deg,#A63E00,#FF6A00)] font-display text-[17px] text-white">
                      {d.projectName.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-bold" title={d.projectName}>
                        {d.projectName}
                      </p>
                      <p className="truncate text-[13.5px] text-f-muted">par {d.devName}</p>
                      <div className="mt-2">
                        <ClientBadge delivery={d} />
                      </div>
                    </div>
                  </div>
                  {action?.urgent ? (
                    <p className="mt-4 rounded-xl bg-[var(--warning-100)] px-3 py-2 text-[13px] font-semibold text-[var(--warning-800)]">{action.text}</p>
                  ) : null}
                  <div className="mt-auto flex items-end justify-between gap-3 border-t border-f-line pt-4">
                    <div>
                      <p className="text-[12px] text-f-muted">Total (dev + frais 5 %)</p>
                      <p className="text-[19px] font-bold text-f-ink-accent">{formatXof(totalFor(d))}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[13px] font-semibold text-f-muted group-hover:text-f-text">
                      {timeAgo(d.updatedAt)}
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
