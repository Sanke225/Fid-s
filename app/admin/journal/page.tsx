'use client';

import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { EVENT_LABEL } from '@/lib/delivery-ui';
import { useAdminEvents } from '@/lib/queries/admin';

const actorOf = (a: string) => (a === 'system' ? 'automatique' : a.startsWith('admin:') ? 'administration' : a === 'client' ? 'client (sans compte)' : 'utilisateur');

/** Journal de la plateforme : chaque action importante est tracée (décisions de l'admin comprises). */
export default function AdminJournalPage() {
  const { data, isPending, error, refetch } = useAdminEvents();
  return (
    <DevPage>
      <PageHeader eyebrow="Plateforme" title="Journal" />
      {isPending ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <Card className="px-6 py-14 text-center text-[15px] text-f-muted">Aucun événement.</Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-divider)]">
            {data.map(e => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-[14px]">
                <span className="w-40 shrink-0 text-[12.5px] tabular-nums text-f-muted">
                  {new Date(e.occurredAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold">{EVENT_LABEL[e.type] ?? e.type}</span>
                  <span className="text-f-muted">
                    {' '}
                    · {e.projectName} ({e.devName})
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-f-surface px-2.5 py-1 text-[12px] text-f-muted">{actorOf(e.actor)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </DevPage>
  );
}
