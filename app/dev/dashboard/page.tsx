'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { ChevronRightIcon } from '@/components/Icons';
import { Card, DevPage, EmptyState, ErrorState, PageHeader, Skeleton, StatusBadge } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import type { Delivery, ProjectWithDeliveries } from '@/lib/contracts';
import { PAID_STATUSES, formatXof, latestDelivery, timeAgo } from '@/lib/delivery-ui';
import { useMe } from '@/lib/queries/me';
import { useProjects } from '@/lib/queries/projects';
import { useDevTickets } from '@/lib/queries/tickets';
import type { Ticket } from '@/lib/contracts';

const MONTHS = 6;

/** Chiffres calculés sur toutes les livraisons du dev (aucune donnée inventée). */
function computeStats(projects: ProjectWithDeliveries[], tickets: Ticket[] = []) {
  const all = projects.flatMap(p => p.deliveries.map(d => ({ project: p, delivery: d })));
  const paid = all.filter(x => PAID_STATUSES.includes(x.delivery.status));

  // Encaissements par mois, sur les MONTHS derniers mois (date de paiement).
  const now = new Date();
  const months = Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS - 1 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('fr-FR', { month: 'short' }), total: 0 };
  });
  for (const { delivery } of paid) {
    if (!delivery.paidAt) continue;
    const d = new Date(delivery.paidAt);
    const m = months.find(x => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.total += delivery.amountXof;
  }

  // À faire : ce qui attend une action du dev, le plus urgent d'abord.
  const todo: { project: ProjectWithDeliveries; delivery: Delivery; text: string; urgent: boolean }[] = [];
  const contested = new Set(tickets.filter(t => t.status === 'awaiting_dev').map(t => t.deliveryId));
  for (const { project, delivery } of all) {
    if (contested.has(delivery.id)) todo.push({ project, delivery, text: 'Ticket du client : répondez sous 48 h', urgent: true });
    else if (delivery.pendingPaymentId) todo.push({ project, delivery, text: 'Paiement déclaré : vérifiez et confirmez le dépôt', urgent: true });
    else if (delivery.status === 'build_failed') todo.push({ project, delivery, text: 'Installation échouée : corrigez puis renvoyez le code', urgent: true });
    else if (delivery.status === 'handover_failed') todo.push({ project, delivery, text: 'Passation bloquée', urgent: true });
    else if (delivery.status === 'draft') todo.push({ project, delivery, text: 'Envoyez le code source pour mettre la démo en ligne', urgent: false });
  }
  todo.sort((a, b) => Number(b.urgent) - Number(a.urgent));
  // Une ligne par projet : la plus urgente.
  const seen = new Set<string>();
  const todoByProject = todo.filter(t => !seen.has(t.project.id) && seen.add(t.project.id));

  return {
    revenue: paid.reduce((s, x) => s + x.delivery.amountXof, 0),
    paidCount: paid.length,
    online: all.filter(x => x.delivery.status === 'demo_ready').length,
    toConfirm: all.filter(x => x.delivery.pendingPaymentId).length,
    delivered: all.filter(x => x.delivery.status === 'delivered').length,
    months,
    todo: todoByProject,
  };
}

export default function DevDashboardPage() {
  const { data: me } = useMe();
  const { data: projects, isPending, error, refetch } = useProjects();
  const { data: tickets } = useDevTickets();
  const stats = useMemo(() => (projects ? computeStats(projects, tickets) : null), [projects, tickets]);
  const firstName = (me?.name ?? '').split(' ')[0];

  return (
    <DevPage>
      <PageHeader
        eyebrow="Espace développeur"
        title={firstName ? `Bonjour, ${firstName}` : 'Tableau de bord'}
      />

      {isPending ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="mt-5 h-72" />
        </>
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : projects.length === 0 || !stats ? (
        <EmptyState
          title="Bienvenue sur Fid’s"
          text="Créez votre premier projet : vous obtiendrez un lien de livraison à envoyer à votre client. Il teste, il vous paie, l’application passe à son nom."
          action={{ href: '/dev/new', label: 'Créer mon premier projet' }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Encaissé" value={formatXof(stats.revenue)} sub={`${stats.paidCount} livraison${stats.paidCount > 1 ? 's' : ''} payée${stats.paidCount > 1 ? 's' : ''}`} />
            <Stat label="Démos en ligne" value={String(stats.online)} sub="En attente d’essai ou de paiement" />
            <Stat label="Paiements à confirmer" value={String(stats.toConfirm)} sub={stats.toConfirm ? 'Vérifiez votre compte Mobile Money' : 'Rien en attente'} highlight={stats.toConfirm > 0} />
            <Stat label="Livrées" value={String(stats.delivered)} sub="Applications passées au client" />
          </div>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.3fr_1fr]">
            <Card className="p-6">
              <h2 className="heading-sans text-[16px]">Encaissements des {MONTHS} derniers mois</h2>
              <RevenueBars months={stats.months} />
            </Card>

            <Card className="p-6">
              <h2 className="heading-sans text-[16px]">À faire</h2>
              {stats.todo.length === 0 ? (
                <p className="mt-4 text-[14.5px] text-f-muted">Rien en attente de votre part.</p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--color-divider)]">
                  {stats.todo.slice(0, 6).map(t => (
                    <li key={t.delivery.id}>
                      <Link href={`/dev/project/${t.project.id}`} className="flex items-center gap-3 py-3 hover:text-f-ink-accent">
                        <span aria-hidden className={`size-2 shrink-0 rounded-full ${t.urgent ? 'bg-[var(--warning)]' : 'bg-f-line'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-semibold">{t.project.name}</span>
                          <span className="block text-[13px] text-f-muted">{t.text}</span>
                        </span>
                        <ChevronRightIcon size={15} className="shrink-0 text-f-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card className="mt-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-sans text-[16px]">Projets récents</h2>
              <Link href="/dev/projects" className="text-[14px] font-semibold text-f-ink-accent hover:underline">
                Tout voir ({projects.length})
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-[var(--color-divider)]">
              {projects.slice(0, 5).map(p => {
                const d = latestDelivery(p);
                return (
                  <li key={p.id}>
                    <Link href={`/dev/project/${p.id}`} className="flex flex-wrap items-center gap-3 py-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                        <span className="block text-[13px] text-f-muted">
                          {d ? `Client : ${d.client.name}` : 'Aucune livraison'} · {timeAgo(p.updatedAt)}
                        </span>
                      </span>
                      {d ? <StatusBadge status={d.status} /> : null}
                      <span className="w-32 text-right text-[15px] font-bold">{d ? formatXof(d.amountXof) : '—'}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      )}
    </DevPage>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: ReactNode; sub: string; highlight?: boolean }) {
  return (
    <Card className={`p-5 ${highlight ? 'border-[var(--warning)] bg-[var(--warning-100)]' : ''}`}>
      <p className="text-[13.5px] text-f-muted">{label}</p>
      <p className="mt-2 font-display text-[clamp(1.6rem,2.4vw,2rem)] leading-none">{value}</p>
      <p className={`mt-2 text-[12.5px] ${highlight ? 'font-semibold text-[var(--warning-800)]' : 'text-f-muted'}`}>{sub}</p>
    </Card>
  );
}

function RevenueBars({ months }: { months: { key: string; label: string; total: number }[] }) {
  const max = Math.max(...months.map(m => m.total));
  if (max === 0) return <p className="mt-4 py-16 text-center text-[14.5px] text-f-muted">Aucun encaissement sur la période.</p>;
  return (
    <div className="mt-6 flex h-52 items-end gap-3" role="img" aria-label={months.map(m => `${m.label} : ${formatXof(m.total)}`).join(', ')}>
      {months.map(m => (
        <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <div
            className="w-full max-w-12 origin-bottom rounded-t-xl bg-[linear-gradient(180deg,#FF9A3D,#C84A00)] transition-[height] duration-700"
            style={{ height: `${Math.max((m.total / max) * 100, m.total ? 4 : 0)}%` }}
            title={formatXof(m.total)}
          />
          <span className="text-[12px] capitalize text-f-muted">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
