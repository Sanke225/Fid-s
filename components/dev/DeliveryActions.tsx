'use client';

import { useState, type FormEvent } from 'react';
import { CheckIcon, CloseIcon, CopyIcon, PlusIcon } from '@/components/Icons';
import { FormAlert } from '@/components/auth/Field';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { Delivery, DeliveryStatus } from '@/lib/contracts';
import { formatXof, timeAgo } from '@/lib/delivery-ui';
import { formatPhone } from '@/lib/phone';
import {
  useCancelDelivery,
  useConfirmPayment,
  useCreateDelivery,
  usePayment,
  useRejectPayment,
  useUpdateDelivery,
} from '@/lib/queries/deliveries';
import { DeliveryFields, EMPTY_DELIVERY, valuesFrom, validateDelivery, type DeliveryErrors, type DeliveryValues } from './DeliveryFields';
import { Modal } from './Modal';
import { Card, Skeleton } from './ui';

const BEFORE_PAYMENT: DeliveryStatus[] = ['draft', 'build_failed', 'demo_ready'];

/** Modifier / annuler : seulement avant tout paiement et sans paiement déclaré (règle du serveur). */
export const isEditable = (d: Delivery) => BEFORE_PAYMENT.includes(d.status) && !d.pendingPaymentId;

/* ------------------------------------------------------------------ */
/* Paiement déclaré par le client : à vérifier puis confirmer/refuser   */
/* ------------------------------------------------------------------ */

export function PaymentReview({ delivery }: { delivery: Delivery }) {
  const { data: payment, isPending, error } = usePayment(delivery.pendingPaymentId);
  const [dialog, setDialog] = useState<'confirm' | 'reject' | null>(null);
  const { showToast } = useToast();

  const copyRef = async () => {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.transactionRef);
      showToast('Référence copiée', 'success');
    } catch {
      showToast('Copie impossible : sélectionnez la référence à la main.', 'warning');
    }
  };

  return (
    <Card className="border-[var(--warning)] p-6">
      <div className="flex items-center gap-2">
        <span className="size-2.5 animate-pulse rounded-full bg-[var(--warning)]" aria-hidden />
        <h2 className="heading-sans text-[16px]">Le client a déclaré un paiement</h2>
      </div>

      {isPending ? (
        <Skeleton className="mt-4 h-28" />
      ) : error ? (
        <p className="mt-4 text-[14px] text-[var(--danger-800)]">{errorMessage(error)}</p>
      ) : (
        <>
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-f-surface p-4">
            <ProviderLogo provider={payment.provider} size={48} className="shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[24px] leading-none">{formatXof(payment.amountXof)}</p>
              <p className="mt-1 text-[13.5px] text-f-muted">
                sur votre numéro {PROVIDER_NAME[payment.provider]} {formatPhone(payment.payeePhone)}
              </p>
            </div>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
            <div>
              <dt className="text-f-muted">Référence de la transaction</dt>
              <dd className="flex items-center gap-2 font-mono font-semibold">
                {payment.transactionRef}
                <button type="button" onClick={copyRef} aria-label="Copier la référence" className="rounded-md p-1 text-f-muted hover:bg-f-surface hover:text-f-text">
                  <CopyIcon size={14} />
                </button>
              </dd>
            </div>
            <div>
              <dt className="text-f-muted">Payé par</dt>
              <dd className="font-semibold">
                {payment.payerName} · {formatPhone(payment.payerPhone)}
              </dd>
            </div>
            <div>
              <dt className="text-f-muted">Déclaré</dt>
              <dd>{timeAgo(payment.declaredAt)}</dd>
            </div>
            <div>
              <dt className="text-f-muted">À traiter avant le</dt>
              <dd>{new Date(payment.expiresAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13.5px] text-f-muted">
            Ouvrez votre application {PROVIDER_NAME[payment.provider]} et vérifiez que vous avez bien reçu ce montant avec cette référence.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setDialog('confirm')} className="cta-primary rounded-full px-5 py-3 text-[15px]">
              <CheckIcon size={16} /> Dépôt confirmé
            </button>
            <button type="button" onClick={() => setDialog('reject')} className="cta-ghost rounded-full px-5 py-3 text-[15px]">
              <CloseIcon size={16} /> Rien reçu
            </button>
          </div>

          <ConfirmPaymentModal open={dialog === 'confirm'} onClose={() => setDialog(null)} delivery={delivery} payment={payment} />
          <RejectPaymentModal open={dialog === 'reject'} onClose={() => setDialog(null)} delivery={delivery} paymentId={payment.id} />
        </>
      )}
    </Card>
  );
}

function ConfirmPaymentModal({
  open,
  onClose,
  delivery,
  payment,
}: {
  open: boolean;
  onClose: () => void;
  delivery: Delivery;
  payment: { id: string; amountXof: number; transactionRef: string; provider: keyof typeof PROVIDER_NAME };
}) {
  const confirm = useConfirmPayment();
  const { showToast } = useToast();
  const [err, setErr] = useState<string | null>(null);

  const submit = () =>
    confirm.mutate(
      { paymentId: payment.id, deliveryId: delivery.id },
      {
        onSuccess: () => {
          showToast('Dépôt confirmé', 'success');
          onClose();
        },
        onError: e => setErr(errorMessage(e)),
      },
    );

  return (
    <Modal open={open} onClose={onClose} title="Confirmer le dépôt">
      <div className="space-y-4 text-[15px]">
        <FormAlert message={err} />
        <p>
          Vous confirmez avoir reçu <strong>{formatXof(payment.amountXof)}</strong> sur votre compte {PROVIDER_NAME[payment.provider]}, référence{' '}
          <strong className="font-mono">{payment.transactionRef}</strong>.
        </p>
        <p className="rounded-2xl bg-f-surface px-4 py-3 text-[13.5px] text-f-muted">
          Action définitive. Le client devra ensuite régler les frais Fid’s ({formatXof(delivery.fee.amountXof)}) pour recevoir l’application ;
          d’ici là, il garde l’accès à la démo seulement.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="cta-ghost justify-center rounded-full px-5 py-3 text-[15px]">
            Annuler
          </button>
          <button type="button" onClick={submit} disabled={confirm.isPending} className="cta-primary justify-center rounded-full px-6 py-3 text-[15px]">
            {confirm.isPending ? <SpinnerIcon /> : <CheckIcon size={16} />} Oui, j’ai bien reçu le paiement
          </button>
        </div>
      </div>
    </Modal>
  );
}

function RejectPaymentModal({ open, onClose, delivery, paymentId }: { open: boolean; onClose: () => void; delivery: Delivery; paymentId: string }) {
  const reject = useRejectPayment();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<string | null>(null);

  const close = () => {
    setReason('');
    setErr(null);
    setFieldErr(null);
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setFieldErr('Expliquez en quelques mots (5 caractères minimum).');
      return;
    }
    reject.mutate(
      { paymentId, deliveryId: delivery.id, reason: reason.trim() },
      {
        onSuccess: () => {
          showToast('Paiement signalé comme non reçu', 'info');
          close();
        },
        onError: e2 => setErr(errorMessage(e2)),
      },
    );
  };

  return (
    <Modal open={open} onClose={close} title="Rien reçu ?">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormAlert message={err} />
        <p className="text-[15px] text-f-muted">
          Le client sera informé et pourra ouvrir un ticket avec ses preuves. Vérifiez bien votre historique avant de répondre.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-[13.5px] font-semibold">Motif</span>
          <textarea
            rows={3}
            maxLength={500}
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              setFieldErr(null);
            }}
            aria-invalid={fieldErr ? true : undefined}
            placeholder="Ex. : aucun dépôt reçu sur mon numéro à cette date."
            className={`w-full resize-y rounded-2xl border bg-f-card px-4 py-3 text-[15px] outline-none placeholder:text-f-muted/70 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)] ${
              fieldErr ? 'border-[var(--danger)]' : 'border-f-line focus:border-[var(--color-accent)]'
            }`}
          />
          {fieldErr ? <span className="mt-1.5 block text-[13px] font-medium text-[var(--danger-800)]">{fieldErr}</span> : null}
        </label>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={close} className="cta-ghost justify-center rounded-full px-5 py-3 text-[15px]">
            Annuler
          </button>
          <button
            type="submit"
            disabled={reject.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--danger)] px-6 py-3 text-[15px] font-bold text-white hover:brightness-95"
          >
            {reject.isPending ? <SpinnerIcon /> : null} Signaler : rien reçu
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Modifier / annuler une livraison (avant paiement)                   */
/* ------------------------------------------------------------------ */

export function DeliveryManage({ delivery }: { delivery: Delivery }) {
  const [dialog, setDialog] = useState<'edit' | 'cancel' | null>(null);
  return (
    <Card className="p-6">
      <h2 className="heading-sans text-[16px]">Gérer la livraison</h2>
      <p className="mt-1 text-[13.5px] text-f-muted">Possible tant qu’aucun paiement n’est déclaré.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setDialog('edit')} className="cta-ghost rounded-full px-5 py-2.5 text-[14.5px]">
          Modifier
        </button>
        <button
          type="button"
          onClick={() => setDialog('cancel')}
          className="rounded-full px-5 py-2.5 text-[14.5px] font-semibold text-[var(--danger-800)] hover:bg-[var(--danger-100)]"
        >
          Annuler la livraison
        </button>
      </div>
      <EditDeliveryModal open={dialog === 'edit'} onClose={() => setDialog(null)} delivery={delivery} />
      <CancelDeliveryModal open={dialog === 'cancel'} onClose={() => setDialog(null)} delivery={delivery} />
    </Card>
  );
}

function EditDeliveryModal({ open, onClose, delivery }: { open: boolean; onClose: () => void; delivery: Delivery }) {
  const update = useUpdateDelivery();
  const { showToast } = useToast();
  const [values, setValues] = useState<DeliveryValues>(() => valuesFrom(delivery));
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    setValues(valuesFrom(delivery));
    setErrors({});
    setErr(null);
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { errors: errs, valid, input } = validateDelivery(values);
    setErrors(errs);
    setErr(null);
    if (!valid) return;
    update.mutate(
      { deliveryId: delivery.id, input },
      {
        onSuccess: () => {
          showToast('Livraison modifiée', 'success');
          onClose();
        },
        onError: e2 => setErr(errorMessage(e2)),
      },
    );
  };

  return (
    <Modal open={open} onClose={close} title="Modifier la livraison">
      <form onSubmit={submit} noValidate className="space-y-5">
        <FormAlert message={err} />
        <DeliveryFields values={values} onChange={setValues} errors={errors} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={close} className="cta-ghost justify-center rounded-full px-5 py-3 text-[15px]">
            Annuler
          </button>
          <button type="submit" disabled={update.isPending} className="cta-primary justify-center rounded-full px-6 py-3 text-[15px]">
            {update.isPending ? <SpinnerIcon /> : null} Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CancelDeliveryModal({ open, onClose, delivery }: { open: boolean; onClose: () => void; delivery: Delivery }) {
  const cancel = useCancelDelivery();
  const { showToast } = useToast();
  const [err, setErr] = useState<string | null>(null);

  const submit = () =>
    cancel.mutate(delivery.id, {
      onSuccess: () => {
        showToast('Livraison annulée', 'info');
        onClose();
      },
      onError: e => setErr(errorMessage(e)),
    });

  return (
    <Modal open={open} onClose={onClose} title="Annuler la livraison ?">
      <div className="space-y-4 text-[15px]">
        <FormAlert message={err} />
        <p>
          Le lien de livraison ne fonctionnera plus pour <strong>{delivery.client.name}</strong>, et la démo comme le code déposé seront supprimés.
        </p>
        <p className="rounded-2xl bg-[var(--danger-100)] px-4 py-3 text-[13.5px] text-[var(--danger-800)]">Action définitive.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="cta-ghost justify-center rounded-full px-5 py-3 text-[15px]">
            Garder la livraison
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={cancel.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--danger)] px-6 py-3 text-[15px] font-bold text-white hover:brightness-95"
          >
            {cancel.isPending ? <SpinnerIcon /> : null} Oui, annuler
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Nouvelle livraison sur un projet existant                           */
/* ------------------------------------------------------------------ */

export function NewDeliveryButton({ projectId, onCreated }: { projectId: string; onCreated?: (d: Delivery) => void }) {
  const create = useCreateDelivery();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  // Champs vides : les exemples ne sont que des textes indicatifs.
  const [values, setValues] = useState<DeliveryValues>(EMPTY_DELIVERY);
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [err, setErr] = useState<string | null>(null);

  const close = () => {
    setValues(EMPTY_DELIVERY);
    setErrors({});
    setErr(null);
    setOpen(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { errors: errs, valid, input } = validateDelivery(values);
    setErrors(errs);
    setErr(null);
    if (!valid) return;
    create.mutate(
      { projectId, input },
      {
        onSuccess: d => {
          showToast('Nouvelle livraison créée', 'success');
          close();
          onCreated?.(d);
        },
        onError: e2 => setErr(errorMessage(e2)),
      },
    );
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cta-ghost rounded-full px-5 py-3 text-[15px]">
        <PlusIcon size={16} /> Nouvelle livraison
      </button>
      <Modal open={open} onClose={close} title="Nouvelle livraison">
        <form onSubmit={submit} noValidate className="space-y-5">
          <FormAlert message={err} />
          <p className="text-[14px] text-f-muted">Pour une nouvelle version ou un autre client sur ce même projet. Elle aura son propre lien.</p>
          <DeliveryFields values={values} onChange={setValues} errors={errors} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="cta-ghost justify-center rounded-full px-5 py-3 text-[15px]">
              Annuler
            </button>
            <button type="submit" disabled={create.isPending} className="cta-primary justify-center rounded-full px-6 py-3 text-[15px]">
              {create.isPending ? <SpinnerIcon /> : null} Créer la livraison
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

