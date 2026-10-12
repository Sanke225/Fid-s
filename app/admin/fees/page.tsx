'use client';

import { useState, type FormEvent } from 'react';
import { CheckIcon, CloseIcon } from '@/components/Icons';
import { FormAlert } from '@/components/auth/Field';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { Modal } from '@/components/dev/Modal';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { AdminFee } from '@/lib/contracts';
import { formatXof, timeAgo } from '@/lib/delivery-ui';
import { formatPhone } from '@/lib/phone';
import { useAdminFees, useDecideFee } from '@/lib/queries/admin';

const TABS = [
  { id: 'declared', label: 'À confirmer' },
  { id: 'confirmed', label: 'Confirmés' },
  { id: 'rejected', label: 'Refusés' },
] as const;

/** Frais de service (5 %) déclarés par les clients : à vérifier sur les comptes Mobile Money de Fid’s. */
export default function AdminFeesPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('declared');
  const { data: fees, isPending, error, refetch } = useAdminFees(tab);
  const [rejecting, setRejecting] = useState<AdminFee | null>(null);

  return (
    <DevPage>
      <PageHeader eyebrow="À traiter" title="Frais à confirmer" />
      <Card className="mb-6 p-5 text-[14.5px] text-f-muted">
        Ouvrez l’application de l’opérateur sur le compte Fid’s concerné et vérifiez le montant et la référence. <strong className="text-f-text">Confirmer débloque la livraison</strong> : l’application passe alors au nom du client.
      </Card>
      <div role="group" aria-label="Filtrer" className="mb-4 flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${tab === t.id ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line bg-f-card hover:bg-f-surface'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {isPending ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : fees.length === 0 ? (
        <Card className="px-6 py-14 text-center text-[15px] text-f-muted">{tab === 'declared' ? 'Aucun frais à confirmer.' : 'Rien ici pour l’instant.'}</Card>
      ) : (
        <div className="space-y-3">
          {fees.map(f => (
            <FeeRow key={f.id} fee={f} onReject={() => setRejecting(f)} />
          ))}
        </div>
      )}
      <RejectModal fee={rejecting} onClose={() => setRejecting(null)} />
    </DevPage>
  );
}

function FeeRow({ fee: f, onReject }: { fee: AdminFee; onReject: () => void }) {
  const decide = useDecideFee();
  const { showToast } = useToast();
  return (
    <Card className="flex flex-wrap items-center gap-4 p-5">
      <ProviderLogo provider={f.provider} size={44} className="shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold">
          {formatXof(f.amountXof)} <span className="text-[13.5px] font-normal text-f-muted">sur {PROVIDER_NAME[f.provider]} {formatPhone(f.payeePhone)}</span>
        </p>
        <p className="text-[13.5px] text-f-muted">
          {f.projectName} · client {f.clientName} · livraison {formatXof(f.deliveryAmountXof)}
        </p>
        <p className="text-[13px] text-f-muted">
          Réf. <span className="font-mono font-semibold text-f-text">{f.transactionRef}</span> · payé par {f.payerName} ({formatPhone(f.payerPhone)}) · {timeAgo(f.declaredAt)}
        </p>
        {f.rejectionReason ? <p className="mt-1 text-[13px] text-[var(--danger-800)]">Motif : {f.rejectionReason}</p> : null}
      </div>
      {f.status === 'declared' ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={decide.isPending}
            onClick={() =>
              decide.mutate(
                { id: f.id, decision: 'confirm' },
                { onSuccess: () => showToast('Frais confirmés : livraison débloquée', 'success'), onError: e => showToast(errorMessage(e), 'warning') },
              )
            }
            className="cta-primary rounded-full px-4 py-2.5 text-[14px]"
          >
            {decide.isPending ? <SpinnerIcon /> : <CheckIcon size={15} />} Reçu, confirmer
          </button>
          <button type="button" onClick={onReject} className="cta-ghost rounded-full px-4 py-2.5 text-[14px]">
            <CloseIcon size={15} /> Rien reçu
          </button>
        </div>
      ) : (
        <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${f.status === 'confirmed' ? 'bg-[var(--success-100)] text-[var(--success-800)]' : 'bg-[var(--danger-100)] text-[var(--danger-800)]'}`}>
          {f.status === 'confirmed' ? 'Confirmé' : f.status === 'rejected' ? 'Refusé' : 'Expiré'}
        </span>
      )}
    </Card>
  );
}

function RejectModal({ fee, onClose }: { fee: AdminFee | null; onClose: () => void }) {
  const decide = useDecideFee();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const close = () => {
    setReason('');
    onClose();
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!fee || reason.trim().length < 5) return;
    decide.mutate(
      { id: fee.id, decision: 'reject', reason: reason.trim() },
      { onSuccess: () => { showToast('Frais refusés : le client peut déclarer à nouveau', 'info'); close(); } },
    );
  };
  return (
    <Modal open={fee !== null} onClose={close} title="Frais non reçus ?">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormAlert message={decide.error ? errorMessage(decide.error) : null} />
        <p className="text-[14.5px] text-f-muted">Le client sera informé et pourra déclarer à nouveau avec la bonne référence. La livraison reste en attente.</p>
        <textarea
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Ex. : aucun dépôt de ce montant avec cette référence sur le compte Wave Fid’s."
          className="w-full rounded-2xl border border-f-line bg-f-card px-4 py-3 text-[15px] outline-none focus:border-[var(--color-accent)]"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={close} className="cta-ghost rounded-full px-5 py-3 text-[15px]">Annuler</button>
          <button type="submit" disabled={decide.isPending || reason.trim().length < 5} className="inline-flex items-center gap-2 rounded-full bg-[var(--danger)] px-6 py-3 text-[15px] font-bold text-white disabled:opacity-50">
            {decide.isPending ? <SpinnerIcon /> : null} Refuser les frais
          </button>
        </div>
      </form>
    </Modal>
  );
}
