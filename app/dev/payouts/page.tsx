'use client';

import { useState, type FormEvent } from 'react';
import { CheckIcon, PlusIcon } from '@/components/Icons';
import { Field, FormAlert } from '@/components/auth/Field';
import { PhoneIcon } from '@/components/auth/AuthIcons';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { Modal } from '@/components/dev/Modal';
import { PROVIDERS, PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { PaymentProvider, PayoutMethod } from '@/lib/contracts';
import { formatPhone, normalizePhone } from '@/lib/phone';
import { useAddPayoutMethod, usePayoutMethods, useRemovePayoutMethod } from '@/lib/queries/payouts';

export default function PayoutsPage() {
  const { data: methods, isPending, error, refetch } = usePayoutMethods();
  const [adding, setAdding] = useState(false);

  return (
    <DevPage>
      <PageHeader
        eyebrow="Encaissement"
        title="Moyens de paiement"
        actions={
          <button type="button" onClick={() => setAdding(true)} className="cta-primary rounded-full px-5 py-3 text-[15px]">
            <PlusIcon size={17} /> Ajouter un moyen de paiement
          </button>
        }
      />

      <Card className="mb-6 flex flex-wrap items-center gap-4 p-5">
        <div className="flex gap-1.5">
          {PROVIDERS.map(p => (
            <ProviderLogo key={p} provider={p} size={34} className="rounded-xl" />
          ))}
        </div>
        <p className="min-w-0 flex-1 text-[14.5px] text-f-muted">
          Vos clients vous paient <strong className="text-f-text">directement</strong> sur ces numéros : vous recevez 100 % du montant.
          Fid’s ne touche jamais cet argent.
        </p>
      </Card>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : methods.length === 0 ? (
        <Card className="border-[var(--warning)] bg-[var(--warning-100)] px-6 py-10 text-center">
          <p className="font-display text-[22px] text-[var(--warning-800)]">Aucun moyen de paiement</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-[var(--warning-800)]">
            Tant qu’aucun numéro n’est enregistré, vos clients ne peuvent pas vous payer depuis leur lien de livraison.
          </p>
          <button type="button" onClick={() => setAdding(true)} className="cta-primary mt-6 rounded-full px-6 py-3 text-[15px]">
            <PlusIcon size={17} /> Ajouter mon premier numéro
          </button>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {methods.map(m => (
            <MethodCard key={m.id} method={m} />
          ))}
        </ul>
      )}

      <AddMethodModal open={adding} onClose={() => setAdding(false)} existing={methods ?? []} />
    </DevPage>
  );
}

function MethodCard({ method }: { method: PayoutMethod }) {
  const remove = useRemovePayoutMethod();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const onRemove = () =>
    remove.mutate(method.id, {
      onSuccess: () => showToast('Numéro retiré', 'info'),
      onError: e => showToast(errorMessage(e), 'warning'),
    });

  return (
    <li>
      <Card className="flex items-center gap-4 p-5">
        <ProviderLogo provider={method.provider} size={48} className="shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold">{PROVIDER_NAME[method.provider]}</p>
          <p className="text-[15px] tabular-nums">{formatPhone(method.phone)}</p>
          {method.label ? <p className="truncate text-[13px] text-f-muted">{method.label}</p> : null}
        </div>
        {confirming ? (
          <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
            <button
              type="button"
              onClick={onRemove}
              disabled={remove.isPending}
              className="rounded-xl bg-[var(--danger-100)] px-3 py-2 text-[13.5px] font-semibold text-[var(--danger-800)] hover:brightness-95"
            >
              {remove.isPending ? 'Retrait…' : 'Confirmer'}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-xl px-3 py-2 text-[13.5px] font-semibold text-f-muted hover:bg-f-surface">
              Annuler
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Retirer ${PROVIDER_NAME[method.provider]} ${formatPhone(method.phone)}`}
            className="shrink-0 rounded-xl px-3 py-2 text-[13.5px] font-semibold text-f-muted hover:bg-[var(--danger-100)] hover:text-[var(--danger-800)]"
          >
            Retirer
          </button>
        )}
      </Card>
    </li>
  );
}

function AddMethodModal({ open, onClose, existing }: { open: boolean; onClose: () => void; existing: PayoutMethod[] }) {
  const add = useAddPayoutMethod();
  const { showToast } = useToast();
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [phone, setPhone] = useState('');
  const [label, setLabel] = useState('');
  const [errors, setErrors] = useState<{ provider?: string; phone?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const close = () => {
    setProvider(null);
    setPhone('');
    setLabel('');
    setErrors({});
    setFormError(null);
    onClose();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phone);
    const errs: typeof errors = {};
    if (!provider) errs.provider = 'Choisissez un opérateur.';
    if (!normalized) errs.phone = 'Numéro attendu au format 07 00 00 00 00 ou +225…';
    else if (provider && existing.some(m => m.provider === provider && m.phone === normalized)) errs.phone = 'Ce numéro est déjà enregistré pour cet opérateur.';
    setErrors(errs);
    setFormError(null);
    if (errs.provider || errs.phone || !provider || !normalized) return;

    add.mutate(
      { provider, phone: normalized, label: label.trim() || undefined },
      {
        onSuccess: () => {
          showToast(`${PROVIDER_NAME[provider]} ajouté`, 'success');
          close();
        },
        onError: err => setFormError(errorMessage(err)),
      },
    );
  };

  return (
    <Modal open={open} onClose={close} title="Ajouter un moyen de paiement">
      <form onSubmit={submit} noValidate className="space-y-5">
        <FormAlert message={formError} />
        <fieldset>
          <legend className="mb-2 text-[13.5px] font-semibold">Opérateur</legend>
          <div className="grid grid-cols-2 gap-2.5">
            {PROVIDERS.map(p => {
              const checked = provider === p;
              return (
                <label
                  key={p}
                  className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-[border-color,box-shadow] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-accent)] ${
                    checked ? 'border-[var(--color-accent)] shadow-[0_8px_24px_-10px_rgba(255,106,0,.5)]' : 'border-f-line hover:border-[var(--color-accent-300)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="provider"
                    value={p}
                    checked={checked}
                    onChange={() => {
                      setProvider(p);
                      setErrors(x => ({ ...x, provider: undefined }));
                    }}
                    className="sr-only"
                  />
                  <ProviderLogo provider={p} size={40} className="shrink-0 rounded-xl" />
                  <span className="text-[14.5px] font-semibold leading-tight">{PROVIDER_NAME[p]}</span>
                  {checked ? (
                    <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-[#C84A00] text-white">
                      <CheckIcon size={11} />
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
          {errors.provider ? <p className="mt-2 text-[13px] font-medium text-[var(--danger-800)]">{errors.provider}</p> : null}
        </fieldset>

        <Field
          label="Numéro de téléphone"
          icon={<PhoneIcon size={18} />}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="07 00 00 00 00"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          error={errors.phone}
          required
        />
        <Field
          label="Libellé"
          optional
          icon={<span aria-hidden className="text-[15px] font-bold">#</span>}
          placeholder="Ex. : compte pro"
          maxLength={50}
          value={label}
          onChange={e => setLabel(e.target.value)}
        />

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button type="button" onClick={close} className="cta-ghost justify-center rounded-full px-5 py-3 text-[15px]">
            Annuler
          </button>
          <button type="submit" disabled={add.isPending} className="cta-primary justify-center rounded-full px-6 py-3 text-[15px]">
            {add.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
