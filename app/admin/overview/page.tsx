'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRightIcon } from '@/components/Icons';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { EVENT_LABEL, formatXof, timeAgo } from '@/lib/delivery-ui';
import { useAdminEvents, useAdminStats } from '@/lib/queries/admin';

export default function AdminOverviewPage() {
  const { data: s, isPending, error, refetch } = useAdminStats();
  const { data: events } = useAdminEvents();

  return (
    <DevPage>
      <PageHeader eyebrow="Administration" title="Vue d’ensemble" />
      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Payé aux développeurs" value={formatXof(s.volumeXof)} sub="Dépôts confirmés (jamais détenus par Fid’s)" />
            <Stat label="Frais Fid’s encaissés" value={formatXof(s.feesXof)} sub="5 % confirmés" />
            <Stat label="Livraisons" value={String(s.deliveries.total)} sub={`${s.deliveries.online} en démo · ${s.deliveries.awaitingFee} en attente des frais · ${s.deliveries.delivered} livrées`} />
            <Stat label="Comptes" value={String(s.users.dev + s.users.client)} sub={`${s.users.dev} développeurs · ${s.users.client} clients`} />
          </div>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_1.3fr]">
            <Card className="p-6">
              <h2 className="heading-sans text-[16px]">À traiter</h2>
              <ul className="mt-3 divide-y divide-[var(--color-divider)]">
                <Todo href="/admin/fees" count={s.todo.feesToConfirm} label="Frais à confirmer" hint="Vérifiez la réception sur les comptes Fid’s" />
                <Todo href="/admin/disputes" count={s.todo.ticketsToDecide} label="Litiges à trancher" hint="Le développeur a répondu" />
                <Todo href="/admin/disputes" count={s.todo.ticketsAwaitingDev} label="Litiges en attente du développeur" hint="48 h pour répondre, puis à vous" muted />
              </ul>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-sans text-[16px]">Activité récente</h2>
                <Link href="/admin/journal" className="text-[14px] font-semibold text-f-ink-accent hover:underline">
                  Journal complet
                </Link>
              </div>
              {!events || events.length === 0 ? (
                <p className="mt-4 text-[14.5px] text-f-muted">Aucune activité pour l’instant.</p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--color-divider)]">
                  {events.slice(0, 8).map(e => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                      <span className="min-w-0">
                        <span className="block font-semibold">{EVENT_LABEL[e.type] ?? e.type}</span>
                        <span className="block truncate text-[12.5px] text-f-muted">
                          {e.projectName} · {e.devName}
                        </span>
                      </span>
                      <span className="shrink-0 text-[12.5px] text-f-muted">{timeAgo(e.occurredAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </DevPage>
  );
}

function Stat({ label, value, sub }: { label: string; value: ReactNode; sub: string }) {
  return (
    <Card className="p-5">
      <p className="text-[13.5px] text-f-muted">{label}</p>
      <p className="mt-2 font-display text-[clamp(1.4rem,2.2vw,1.8rem)] leading-none">{value}</p>
      <p className="mt-2 text-[12.5px] text-f-muted">{sub}</p>
    </Card>
  );
}

function Todo({ href, count, label, hint, muted }: { href: string; count: number; label: string; hint: string; muted?: boolean }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-3 hover:text-f-ink-accent">
        <span
          className={`grid min-w-9 place-items-center rounded-full px-2 py-1 text-[14px] font-bold tabular-nums ${
            count && !muted ? 'bg-[#C84A00] text-white' : 'bg-f-surface text-f-muted'
          }`}
        >
          {count}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-semibold">{label}</span>
          <span className="block text-[12.5px] text-f-muted">{hint}</span>
        </span>
        <ChevronRightIcon size={15} className="text-f-muted" />
      </Link>
    </li>
  );
}
