'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Field } from '@/components/auth/Field';
import { MailIcon, PhoneIcon, UserRoundIcon } from '@/components/auth/AuthIcons';
import type { Delivery } from '@/lib/contracts';
import { formatXof } from '@/lib/delivery-ui';
import { normalizePhone } from '@/lib/phone';

export const AMOUNT_MIN = 100;
export const AMOUNT_MAX = 100_000_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DeliveryValues {
  amountText: string;
  includeSource: boolean;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

export type DeliveryErrors = Partial<Record<'amount' | 'clientName' | 'clientEmail' | 'clientPhone', string>>;

export const EMPTY_DELIVERY: DeliveryValues = { amountText: '', includeSource: true, clientName: '', clientEmail: '', clientPhone: '' };

/** Valeurs actuelles d'une livraison, pour la modifier (vraies données, pas des exemples). */
export function valuesFrom(d: Delivery): DeliveryValues {
  return {
    amountText: d.amountXof.toLocaleString('fr-FR'),
    includeSource: d.includeSource,
    clientName: d.client.name,
    clientEmail: d.client.email ?? '',
    clientPhone: d.client.phone ?? '',
  };
}

/** « 350 000 » / « 350.000 » / « 350000 » → 350000 ; NaN sinon. */
export const parseAmount = (raw: string) => (raw.trim() ? Number(raw.replace(/[\s.  ]/g, '')) : NaN);

/** Contrôle côté navigateur (le serveur revérifie tout) et prépare les valeurs pour l'API. */
export function validateDelivery(v: DeliveryValues) {
  const amount = parseAmount(v.amountText);
  const phone = v.clientPhone.trim() ? normalizePhone(v.clientPhone) : null;
  const errors: DeliveryErrors = {};
  if (!Number.isInteger(amount) || amount < AMOUNT_MIN || amount > AMOUNT_MAX)
    errors.amount = `Montant en FCFA, entre ${formatXof(AMOUNT_MIN)} et ${formatXof(AMOUNT_MAX)}.`;
  if (v.clientName.trim().length < 2) errors.clientName = 'Indiquez le nom du client.';
  if (v.clientEmail.trim() && !EMAIL_RE.test(v.clientEmail.trim())) errors.clientEmail = 'Adresse e-mail invalide.';
  if (v.clientPhone.trim() && !phone) errors.clientPhone = 'Numéro attendu au format 07 00 00 00 00 ou +225…';
  return {
    errors,
    valid: Object.keys(errors).length === 0,
    input: {
      amountXof: amount,
      includeSource: v.includeSource,
      client: { name: v.clientName.trim(), email: v.clientEmail.trim() || undefined, phone: phone ?? undefined },
    },
  };
}

/** Montant, code source et coordonnées du client. */
export function DeliveryFields({
  values,
  onChange,
  errors,
}: {
  values: DeliveryValues;
  onChange: Dispatch<SetStateAction<DeliveryValues>>;
  errors: DeliveryErrors;
}) {
  // Mise à jour depuis l'état le plus récent : plusieurs champs remplis d'un coup (saisie automatique
  // du navigateur) ne s'écrasent pas entre eux.
  const set = <K extends keyof DeliveryValues>(key: K, value: DeliveryValues[K]) => onChange(prev => ({ ...prev, [key]: value }));
  return (
    <div className="space-y-4">
      <Field
        label="Montant convenu (FCFA)"
        icon={<span aria-hidden className="text-[13px] font-bold">F</span>}
        inputMode="numeric"
        placeholder="Ex. : 350 000"
        value={values.amountText}
        onChange={e => set('amountText', e.target.value.replace(/[^\d\s.  ]/g, ''))}
        error={errors.amount}
        required
      />
      <Field
        label="Nom du client"
        icon={<UserRoundIcon size={18} />}
        placeholder="Ex. : Mariam Traoré"
        autoComplete="off"
        maxLength={100}
        value={values.clientName}
        onChange={e => set('clientName', e.target.value)}
        error={errors.clientName}
        required
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="E-mail"
          optional
          icon={<MailIcon size={18} />}
          type="email"
          inputMode="email"
          autoComplete="off"
          placeholder="client@exemple.ci"
          value={values.clientEmail}
          onChange={e => set('clientEmail', e.target.value)}
          error={errors.clientEmail}
        />
        <Field
          label="Téléphone"
          optional
          icon={<PhoneIcon size={18} />}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          placeholder="07 00 00 00 00"
          value={values.clientPhone}
          onChange={e => set('clientPhone', e.target.value)}
          error={errors.clientPhone}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-f-line p-4">
        <input type="checkbox" checked={values.includeSource} onChange={e => set('includeSource', e.target.checked)} className="mt-1 size-4 accent-[#C84A00]" />
        <span>
          <span className="block text-[14.5px] font-semibold">Remettre le code source au client</span>
          <span className="block text-[13px] text-f-muted">Il le reçoit à la passation, jamais avant le paiement complet.</span>
        </span>
      </label>
    </div>
  );
}
