'use client';

import { useState, type FormEvent } from 'react';
import { Field, FormAlert } from '@/components/auth/Field';
import { BriefcaseIcon, MailIcon, PhoneIcon, SpinnerIcon, UserRoundIcon } from '@/components/auth/AuthIcons';
import { Card, DevPage, PageHeader, Skeleton } from '@/components/dev/ui';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { User, UserRole } from '@/lib/contracts';
import { formatPhone, normalizePhone } from '@/lib/phone';
import { ROLE_LABEL, useMe, useUpdateMe } from '@/lib/queries/me';

const ORG_LABEL = { dev: 'Nom commercial ou studio', client: 'Entreprise', admin: 'Organisation' } as const;
const ORG_HINT = {
  dev: 'Apparaît sur vos factures et sur les pages de livraison.',
  client: 'Apparaît sur les factures que vous recevez.',
  admin: '',
} as const;

/** Profil du compte : vraies valeurs pré-remplies, e-mail en lecture seule (identifiant de connexion). */
export function ProfilePage() {
  const { data: me, isPending } = useMe();
  if (isPending || !me || !me.role) {
    return (
      <DevPage>
        <Skeleton className="mb-8 h-16 w-1/2" />
        <Skeleton className="h-80" />
      </DevPage>
    );
  }
  // Monté une fois le compte chargé : les champs partent directement des vraies valeurs.
  return <ProfileForm key={me.id} me={me} role={me.role} />;
}

function ProfileForm({ me, role }: { me: User; role: UserRole }) {
  const update = useUpdateMe();
  const { showToast } = useToast();
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone ? formatPhone(me.phone) : '');
  const [business, setBusiness] = useState(me.businessName ?? '');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = phone.trim() ? normalizePhone(phone) : null;
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = 'Indiquez votre nom (2 caractères minimum).';
    if (phone.trim() && !normalized) errs.phone = 'Numéro attendu au format 07 00 00 00 00 ou +225…';
    setErrors(errs);
    if (errs.name || errs.phone) return;
    update.mutate(
      { name: name.trim(), ...(normalized ? { phone: normalized } : {}), businessName: business.trim() },
      { onSuccess: () => showToast('Profil enregistré', 'success') },
    );
  };

  return (
    <DevPage>
      <PageHeader eyebrow="Compte" title="Profil" />
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-6">
          <form onSubmit={submit} noValidate className="space-y-4">
            <FormAlert message={update.error ? errorMessage(update.error) : null} />
            <Field label="Nom complet" icon={<UserRoundIcon size={18} />} autoComplete="name" value={name} onChange={e => setName(e.target.value)} error={errors.name} maxLength={100} required />
            <Field label="Adresse e-mail" icon={<MailIcon size={18} />} value={me.email} readOnly disabled hint={<span className="text-[12.5px] text-f-muted">Identifiant de connexion : il ne se modifie pas ici.</span>} />
            <Field label="Téléphone" optional icon={<PhoneIcon size={18} />} type="tel" inputMode="tel" autoComplete="tel" placeholder="07 00 00 00 00" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} />
            {role !== 'admin' ? (
              <Field
                label={ORG_LABEL[role]}
                optional
                icon={<BriefcaseIcon size={18} />}
                autoComplete="organization"
                maxLength={100}
                value={business}
                onChange={e => setBusiness(e.target.value)}
                hint={<span className="text-[12.5px] text-f-muted">{ORG_HINT[role]}</span>}
              />
            ) : null}
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={update.isPending} className="cta-primary rounded-full px-6 py-3 text-[15px]">
                {update.isPending ? <SpinnerIcon /> : null} Enregistrer
              </button>
            </div>
          </form>
        </Card>
        <Card className="p-6 text-[14.5px]">
          <h2 className="heading-sans text-[16px]">Votre compte</h2>
          <dl className="mt-4 divide-y divide-[var(--color-divider)]">
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-f-muted">Type de compte</dt>
              <dd className="font-semibold">{ROLE_LABEL[role]}</dd>
            </div>
            <div className="flex justify-between gap-4 py-2.5">
              <dt className="text-f-muted">E-mail</dt>
              <dd className="truncate">{me.email}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[12.5px] text-f-muted">Le type de compte est choisi à l’inscription et ne change pas. Pour toute question, contactez l’équipe Fid’s.</p>
        </Card>
      </div>
    </DevPage>
  );
}

