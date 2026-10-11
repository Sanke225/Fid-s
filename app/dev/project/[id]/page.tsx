'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { ArrowLeftIcon, CopyIcon, ExternalIcon, WhatsAppIcon } from '@/components/Icons';
import { useToast } from '@/components/Toast';
import { Card, DevPage, ErrorState, PageHeader, Skeleton, StatusBadge } from '@/components/dev/ui';
import { DeliveryManage, NewDeliveryButton, PaymentReview, isEditable } from '@/components/dev/DeliveryActions';
import { TicketPanel } from '@/components/dev/TicketPanel';
import { useDevTickets } from '@/lib/queries/tickets';
import { ApiClientError, errorMessage } from '@/lib/api/client';
import type { Delivery, DeliveryStatus } from '@/lib/contracts';
import { EVENT_LABEL, STATUS_UI, actorLabel, formatDate, formatPhone, formatXof, timeAgo } from '@/lib/delivery-ui';
import { useMe } from '@/lib/queries/me';
import { useDeliveryEvents, useProject } from '@/lib/queries/projects';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isPending, error, refetch } = useProject(id);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (isPending) {
    return (
      <DevPage>
        <Skeleton className="mb-8 h-16 w-2/3" />
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </DevPage>
    );
  }

  if (error) {
    const notFound = error instanceof ApiClientError && error.status === 404;
    return (
      <DevPage>
        <BackLink />
        <ErrorState message={notFound ? 'Ce projet est introuvable.' : errorMessage(error)} onRetry={notFound ? undefined : () => refetch()} />
      </DevPage>
    );
  }

  const delivery = project.deliveries.find(d => d.id === selectedId) ?? project.deliveries[0] ?? null;

  return (
    <DevPage>
      <BackLink />
      <PageHeader
        eyebrow={`Projet créé le ${formatDate(project.createdAt)}`}
        title={project.name}
        actions={<NewDeliveryButton projectId={project.id} onCreated={d => setSelectedId(d.id)} />}
      />
      {project.description ? <p className="-mt-4 mb-8 max-w-2xl text-[15px] text-f-muted">{project.description}</p> : null}

      {project.deliveries.length > 1 ? (
        <div role="group" aria-label="Livraisons du projet" className="mb-6 flex flex-wrap gap-2">
          {project.deliveries.map((d, i) => (
            <button
              key={d.id}
              type="button"
              aria-pressed={d.id === delivery?.id}
              onClick={() => setSelectedId(d.id)}
              className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                d.id === delivery?.id ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line bg-f-card hover:bg-f-surface'
              }`}
            >
              Livraison {project.deliveries.length - i} · {STATUS_UI[d.status].label}
            </button>
          ))}
        </div>
      ) : null}

      {delivery ? (
        <DeliveryView key={delivery.id} delivery={delivery} />
      ) : (
        <Card className="p-10 text-center">
          <p className="font-display text-[22px]">Aucune livraison</p>
          <p className="mt-2 text-[15px] text-f-muted">Ce projet n’a pas encore de livraison à envoyer à un client.</p>
        </Card>
      )}
    </DevPage>
  );
}

function BackLink() {
  return (
    <Link href="/dev/projects" className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-f-muted hover:text-f-text">
      <ArrowLeftIcon size={15} /> Retour aux projets
    </Link>
  );
}

function DeliveryView({ delivery: d }: { delivery: Delivery }) {
  const { data: tickets } = useDevTickets();
  // Un ticket non tranché bloque aussi la modification et l'annulation (règle du serveur).
  const contested = tickets?.some(t => t.deliveryId === d.id && (t.status === 'awaiting_dev' || t.status === 'open')) ?? false;
  const { showToast } = useToast();
  const ui = STATUS_UI[d.status];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(d.publicUrl);
      showToast('Lien copié', 'success');
    } catch {
      showToast('Copie impossible : sélectionnez le lien à la main.', 'warning');
    }
  };
  const whatsapp = `https://wa.me/${(d.client.phone ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(
    `Bonjour ${d.client.name}, votre application est prête à être testée : ${d.publicUrl}`,
  )}`;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={d.status} />
            <span className="text-[13px] text-f-muted">Mise à jour {timeAgo(d.updatedAt)}</span>
          </div>
          <p className="mt-3 text-[15px] text-f-muted">{ui.hint}</p>
          {d.failure ? (
            <p className="mt-3 rounded-xl bg-[var(--danger-100)] px-4 py-3 text-[14px] text-[var(--danger-800)]">{d.failure.message}</p>
          ) : null}
        </Card>

        {d.pendingPaymentId ? <PaymentReview delivery={d} /> : null}
        <TicketPanel deliveryId={d.id} />

        {LINK_HIDDEN.includes(d.status) ? null : (
          <Card className="p-6">
            <h2 className="heading-sans text-[16px]">Lien de livraison à transmettre au client</h2>
            <p className="mt-1 text-[13.5px] text-f-muted">{LINK_HINT[d.status] ?? 'Votre client y suit sa livraison.'}</p>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-f-line bg-f-surface p-2 pl-4">
              <code className="min-w-0 flex-1 truncate text-[13.5px]">{d.publicUrl}</code>
              <button type="button" onClick={copy} className="cta-ghost shrink-0 rounded-xl px-3 py-2 text-[13.5px]">
                <CopyIcon size={15} /> Copier
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.client.phone ? (
                <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="cta-ghost rounded-xl px-3 py-2 text-[13.5px]">
                  <WhatsAppIcon size={15} /> Envoyer sur WhatsApp
                </a>
              ) : null}
              <a href={d.publicUrl} target="_blank" rel="noopener noreferrer" className="cta-ghost rounded-xl px-3 py-2 text-[13.5px]">
                <ExternalIcon size={15} /> Voir la page client
              </a>
            </div>
          </Card>
        )}

        <EventsCard deliveryId={d.id} />
      </div>

      <div className="space-y-5">
        <Card className="p-6">
          <h2 className="heading-sans text-[16px]">Détails de la livraison</h2>
          <dl className="mt-4 divide-y divide-[var(--color-divider)] text-[14.5px]">
            <Row label="Solde convenu" value={<strong className="text-f-ink-accent">{formatXof(d.amountXof)}</strong>} />
            {LINK_HIDDEN.includes(d.status) ? null : (
              <>
                <Row label="Vous recevez" value={<strong className="text-f-success-ink">{formatXof(d.amountXof)} (100 %)</strong>} />
                <Row
                  label="Frais Fid’s, payés par le client"
                  value={
                    <span>
                      {formatXof(d.fee.amountXof)}
                      {d.fee.status ? <span className="block text-[12.5px] text-f-muted">{FEE_STATUS_LABEL[d.fee.status]}</span> : null}
                    </span>
                  }
                />
              </>
            )}
            <Row label="Client" value={d.client.name} />
            {d.client.email ? <Row label="E-mail" value={d.client.email} /> : null}
            {d.client.phone ? <Row label="Téléphone" value={formatPhone(d.client.phone)} /> : null}
            <Row label="Code source inclus" value={d.includeSource ? 'Oui' : 'Non'} />
            {d.demoUrl ? <Row label="Démo" value={<a className="text-f-ink-accent underline" href={d.demoUrl} target="_blank" rel="noopener noreferrer">Ouvrir</a>} /> : null}
            {d.clientUrl ? <Row label="Application du client" value={<a className="text-f-ink-accent underline" href={d.clientUrl} target="_blank" rel="noopener noreferrer">Ouvrir</a>} /> : null}
            {d.expiresAt ? <Row label="Expire le" value={formatDate(d.expiresAt)} /> : null}
            {d.paidAt ? <Row label="Payée le" value={formatDate(d.paidAt)} /> : null}
            {d.deliveredAt ? <Row label="Livrée le" value={formatDate(d.deliveredAt)} /> : null}
            <Row label="Créée le" value={formatDate(d.createdAt)} />
          </dl>
        </Card>
        {isEditable(d) && !contested ? <DeliveryManage delivery={d} /> : null}
      </div>
    </div>
  );
}

/** Lien inutile : la livraison n'est plus accessible au client. */
const LINK_HIDDEN: DeliveryStatus[] = ['cancelled', 'expired'];

const LINK_HINT: Partial<Record<DeliveryStatus, string>> = {
  draft: 'La démo sera visible dès que le code sera en ligne.',
  building: 'La démo sera visible dès que l’installation sera terminée.',
  demo_ready: 'Votre client y teste la démo puis vous paie directement.',
  fee_pending: 'Votre client y règle les frais Fid’s pour recevoir l’application.',
  delivered: 'Votre client y retrouve l’accès à son espace.',
};

const FEE_STATUS_LABEL = {
  due: 'En attente du client',
  declared: 'Déclarés, en vérification par Fid’s',
  confirmed: 'Réglés',
} as const;

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-f-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

function EventsCard({ deliveryId }: { deliveryId: string }) {
  const { data: events, isPending, error } = useDeliveryEvents(deliveryId);
  const { data: me } = useMe();
  return (
    <Card className="p-6">
      <h2 className="heading-sans text-[16px]">Historique</h2>
      {isPending ? (
        <Skeleton className="mt-4 h-24" />
      ) : error ? (
        <p className="mt-4 text-[14px] text-[var(--danger-800)]">{errorMessage(error)}</p>
      ) : events.length === 0 ? (
        <p className="mt-4 text-[14px] text-f-muted">Aucun événement pour l’instant.</p>
      ) : (
        <ol className="mt-4 space-y-3 border-l-2 border-f-line pl-5">
          {[...events].reverse().map(e => (
            <li key={e.id} className="relative">
              <span aria-hidden className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-f-card bg-[var(--color-accent)]" />
              <p className="text-[14.5px] font-semibold">{EVENT_LABEL[e.type] ?? e.type}</p>
              <p className="text-[12.5px] text-f-muted">
                {timeAgo(e.occurredAt)} · {actorLabel(e.actor, me?.id)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
