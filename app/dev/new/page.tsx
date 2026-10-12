'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRightIcon } from '@/components/Icons';
import { Field, FormAlert } from '@/components/auth/Field';
import { BriefcaseIcon, SpinnerIcon } from '@/components/auth/AuthIcons';
import { Card, DevPage, PageHeader } from '@/components/dev/ui';
import { ClientFields, CredentialsModal, EMPTY_CLIENT_FORM, parseAmount, toAssignInput, type ClientFormValues } from '@/components/dev/ProjectLifecycle';
import { ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { AssignClientResult, LinkGithubInput } from '@/lib/contracts';
import { GithubPicker, GithubReturnNotice } from '@/components/dev/GithubPicker';
import { formatXof } from '@/lib/delivery-ui';
import { FEE_RATE, computeFee } from '@/lib/payments/fee-rules';
import { usePayoutMethods } from '@/lib/queries/payouts';
import { useCreateProject } from '@/lib/queries/projects';

export default function NewProjectPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateProject();
  const { data: methods } = usePayoutMethods();

  // Tous les champs démarrent vides : les exemples ne sont que des textes indicatifs.
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Sans client, le projet est créé « non assigné » : on l'assignera depuis sa page.
  const [assignNow, setAssignNow] = useState(false);
  const [github, setGithub] = useState<LinkGithubInput | null>(null);
  const [client, setClient] = useState<ClientFormValues>(EMPTY_CLIENT_FORM);
  const [errors, setErrors] = useState<ReturnType<typeof toAssignInput>['errors'] & { name?: string }>({});
  const [formError, setFormError] = useState<{ message: string; projectId?: string } | null>(null);
  const [created, setCreated] = useState<{ projectId: string; credentials: AssignClientResult['credentials'] } | null>(null);

  const amount = parseAmount(client.amountText);
  const amountOk = assignNow && Number.isInteger(amount) && amount >= 100;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (name.trim().length < 2) errs.name = 'Donnez un nom au projet (2 caractères minimum).';
    const assign = assignNow ? toAssignInput(client) : null;
    Object.assign(errs, assign?.errors);
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;

    create.mutate(
      { name: name.trim(), description: description.trim() || undefined, assign: assign?.input ?? undefined, github: github ?? undefined },
      {
        onSuccess: ({ project, credentials }) => {
          showToast('Projet créé', 'success');
          // Identifiants provisoires : à montrer avant de quitter la page, ils ne seront plus affichés.
          if (credentials) setCreated({ projectId: project.id, credentials });
          else router.push(`/dev/project/${project.id}`);
        },
        onError: err => setFormError({ message: errorMessage(err), projectId: (err as { projectId?: string }).projectId }),
      },
    );
  };

  return (
    <DevPage>
      <GithubReturnNotice />
      <PageHeader eyebrow="Nouveau projet" title="Nouveau projet" />

      <form onSubmit={submit} noValidate className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <FormAlert message={formError?.message ?? null} />
          {formError?.projectId ? (
            <p className="-mt-3 text-[14px]">
              Le projet a bien été créé, mais une étape a échoué.{' '}
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

          <Section title="Le code" hint="Facultatif : reliez un dépôt GitHub pour importer vos commits. Vous pouvez aussi envoyer un .zip plus tard.">
            <GithubPicker value={github} onChange={setGithub} />
          </Section>

          <Section title="Le client" hint="Facultatif : vous pourrez l’assigner plus tard depuis la page du projet.">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-f-line p-4">
              <input type="checkbox" checked={assignNow} onChange={e => setAssignNow(e.target.checked)} className="mt-1 size-4 accent-[#C84A00]" />
              <span>
                <span className="block text-[14.5px] font-semibold">Assigner un client maintenant</span>
                <span className="block text-[13px] text-f-muted">Sinon, le projet est créé « non assigné ».</span>
              </span>
            </label>
            {assignNow ? <ClientFields values={client} onChange={setClient} errors={errors} /> : null}
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

      <CredentialsModal
        credentials={created?.credentials ?? null}
        onClose={() => created && router.push(`/dev/project/${created.projectId}`)}
      />
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
