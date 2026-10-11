'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRightIcon, LockIcon } from '@/components/Icons';
import { Field, FormAlert } from '@/components/auth/Field';
import { BriefcaseIcon, MailIcon, PhoneIcon, SpinnerIcon, UserRoundIcon } from '@/components/auth/AuthIcons';
import { Card, DevPage, PageHeader } from '@/components/dev/ui';
import { ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import { formatXof } from '@/lib/delivery-ui';
import { FEE_RATE, computeFee } from '@/lib/payments/fee-rules';
import { normalizePhone } from '@/lib/phone';
import { usePayoutMethods } from '@/lib/queries/payouts';
import { useCreateProjectWithDelivery } from '@/lib/queries/projects';

const MIN = 100;
const MAX = 100_000_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Partial<Record<'name' | 'clientName' | 'clientEmail' | 'clientPhone' | 'amount', string>>;

/** « 350 000 » / « 350.000 » / « 350000 » → 350000 ; NaN si autre chose que des chiffres. */
const parseAmount = (raw: string) => (raw.trim() ? Number(raw.replace(/[\s.  ]/g, '')) : NaN);

export default function NewProjectPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateProjectWithDelivery();
  const { data: methods } = usePayoutMethods();

  // Tous les champs démarrent vides : les exemples ne sont que des textes indicatifs.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [amountText, setAmountText] = useState('');
  const [includeSource, setIncludeSource] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<{ message: string; projectId?: string } | null>(null);

  const amount = parseAmount(amountText);
  const amountOk = Number.isInteger(amount) && amount >= MIN && amount <= MAX;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const phone = clientPhone.trim() ? normalizePhone(clientPhone) : null;
    const errs: Errors = {};
    if (name.trim().length < 2) errs.name = 'Donnez un nom au projet (2 caractères minimum).';
    if (clientName.trim().length < 2) errs.clientName = 'Indiquez le nom du client.';
    if (clientEmail.trim() && !EMAIL_RE.test(clientEmail.trim())) errs.clientEmail = 'Adresse e-mail invalide.';
    if (clientPhone.trim() && !phone) errs.clientPhone = 'Numéro attendu au format 07 00 00 00 00 ou +225…';
    if (!amountOk) errs.amount = `Montant en FCFA, entre ${formatXof(MIN)} et ${formatXof(MAX)}.`;
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;

    create.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        amountXof: amount,
        includeSource,
        client: { name: clientName.trim(), email: clientEmail.trim() || undefined, phone: phone ?? undefined },
      },
      {
        onSuccess: project => {
          showToast('Projet créé', 'success');
          router.push(`/dev/project/${project.id}`);
        },
        onError: err => setFormError({ message: errorMessage(err), projectId: (err as { projectId?: string }).projectId }),
      },
    );
  };

  return (
    <DevPage>
      <PageHeader eyebrow="Nouvelle livraison" title="Nouveau projet" />

      <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <FormAlert message={formError?.message ?? null} />
          {formError?.projectId ? (
            <p className="-mt-3 text-[14px]">
              Le projet a bien été créé.{' '}
              <Link href={`/dev/project/${formError.projectId}`} className="font-semibold text-f-ink-accent underline">
                Ouvrir le projet
              </Link>
            </p>
          ) : null}

          <Section title="Le projet">
            <Field
              label="Nom du projet"
              icon={<BriefcaseIcon size={18} />}
              placeholder="Ex. : Caisse et gestion de stock"
              value={name}
              onChange={e => setName(e.target.value)}
              error={errors.name}
              maxLength={100}
              required
            />
            <TextArea
              label="Description"
              placeholder="Ce que fait l’application, en une ou deux phrases."
              value={description}
              onChange={setDescription}
            />
          </Section>

          <Section title="Le client" hint="Il recevra le lien de livraison pour tester puis payer.">
            <Field
              label="Nom du client"
              icon={<UserRoundIcon size={18} />}
              placeholder="Ex. : Mariam Traoré"
              autoComplete="off"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              error={errors.clientName}
              maxLength={100}
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
                value={clientEmail}
                onChange={e => setClientEmail(e.target.value)}
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
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                error={errors.clientPhone}
                hint={<span className="text-[12.5px] text-f-muted">Pour lui envoyer le lien par WhatsApp.</span>}
              />
            </div>
          </Section>

          <Section title="La livraison">
            <Field
              label="Montant convenu (FCFA)"
              icon={<span aria-hidden className="text-[13px] font-bold">F</span>}
              inputMode="numeric"
              placeholder="Ex. : 350 000"
              value={amountText}
              onChange={e => setAmountText(e.target.value.replace(/[^\d\s.]/g, ''))}
              error={errors.amount}
              required
            />
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-f-line p-4">
              <input type="checkbox" checked={includeSource} onChange={e => setIncludeSource(e.target.checked)} className="mt-1 size-4 accent-[#C84A00]" />
              <span>
                <span className="block text-[14.5px] font-semibold">Remettre le code source au client</span>
                <span className="block text-[13px] text-f-muted">
                  Il le reçoit à la passation, jamais avant le paiement complet.
                </span>
              </span>
            </label>
            <p className="flex items-start gap-2 rounded-2xl bg-f-surface px-4 py-3 text-[13.5px] text-f-muted">
              <LockIcon size={15} className="mt-0.5 shrink-0" />
              L’envoi du code (.zip) et la mise en ligne automatique de la démo arrivent bientôt : la livraison est créée « en attente du code ».
            </p>
          </Section>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <Card className="p-6">
            <h2 className="heading-sans text-[16px]">Récapitulatif</h2>
            <dl className="mt-4 space-y-3 text-[14.5px]">
              <Line label="Vous recevez (100 %)" value={amountOk ? formatXof(amount) : '—'} strong />
              <Line label={`Frais Fid’s, payés par le client (${FEE_RATE * 100} %)`} value={amountOk ? formatXof(computeFee(amount)) : '—'} />
              <div className="h-px bg-f-line" />
              <Line label="Le client paie au total" value={amountOk ? formatXof(amount + computeFee(amount)) : '—'} />
            </dl>
            <button type="submit" disabled={create.isPending} className="cta-primary group mt-6 h-[52px] w-full rounded-2xl text-[15.5px]">
              {create.isPending ? (
                <>
                  <SpinnerIcon /> Création…
                </>
              ) : (
                <>
                  Créer le projet
                  <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </Card>

          {methods && methods.length === 0 ? (
            <Card className="border-[var(--warning)] bg-[var(--warning-100)] p-5">
              <p className="text-[14px] font-semibold text-[var(--warning-800)]">Aucun moyen de paiement enregistré</p>
              <p className="mt-1 text-[13.5px] text-[var(--warning-800)]">Votre client ne pourra pas vous payer tant que vous n’en avez pas ajouté un.</p>
              <Link href="/dev/payouts" className="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold text-[var(--warning-800)] underline">
                <ProviderLogo provider="wave" size={20} className="rounded-md" /> Ajouter un moyen de paiement
              </Link>
            </Card>
          ) : null}
        </div>
      </form>
    </DevPage>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="heading-sans text-[17px]">{title}</h2>
        {hint ? <p className="mt-0.5 text-[13.5px] text-f-muted">{hint}</p> : null}
      </div>
      {children}
    </Card>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-f-muted">{label}</dt>
      <dd className={`whitespace-nowrap tabular-nums ${strong ? 'text-[17px] font-bold text-f-success-ink' : 'font-semibold'}`}>{value}</dd>
    </div>
  );
}

function TextArea({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13.5px] font-semibold">
        {label}
        <span className="text-[12px] font-normal text-f-muted">Facultatif</span>
      </span>
      <textarea
        rows={3}
        maxLength={1000}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full resize-y rounded-2xl border border-f-line bg-f-card px-4 py-3 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-f-muted/70 focus:border-[var(--color-accent)] focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)]"
      />
    </label>
  );
}
