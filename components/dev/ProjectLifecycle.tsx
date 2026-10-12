'use client';

import { useState, type FormEvent } from 'react';
import { CheckIcon, CopyIcon, WhatsAppIcon } from '@/components/Icons';
import { Field, FormAlert } from '@/components/auth/Field';
import { MailIcon, PhoneIcon, SpinnerIcon, UserRoundIcon } from '@/components/auth/AuthIcons';
import { useToast } from '@/components/Toast';
import { Card } from '@/components/dev/ui';
import { Modal } from '@/components/dev/Modal';
import { errorMessage } from '@/lib/api/client';
import type { AssignClientInput, AssignClientResult, Project, ProjectStatus } from '@/lib/contracts';
import { PROJECT_STATUS_UI, PROJECT_STEPS, TONE_CLASS, formatXof } from '@/lib/delivery-ui';
import { normalizePhone } from '@/lib/phone';
import { useAssignClient, useProjectStep } from '@/lib/queries/projects';

const MIN = 100;
const MAX = 100_000_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** « 350 000 » / « 350.000 » / « 350000 » → 350000 ; NaN si autre chose que des chiffres. */
export const parseAmount = (raw: string) => (raw.trim() ? Number(raw.replace(/[\s.  ]/g, '')) : NaN);

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const ui = PROJECT_STATUS_UI[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[ui.tone]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {ui.label}
    </span>
  );
}

/** Les quatre étapes du projet et l'action suivante du dev. */
export function ProjectLifecycle({ project, demoReady }: { project: Project; demoReady: boolean }) {
  const { showToast } = useToast();
  const step = useProjectStep(project.id);
  const [assignOpen, setAssignOpen] = useState(false);
  const [credentials, setCredentials] = useState<AssignClientResult['credentials']>(null);
  const current = PROJECT_STEPS.indexOf(project.status);

  const run = (s: 'start' | 'finish', done: string) =>
    step.mutate(s, {
      onSuccess: () => showToast(done, 'success'),
      onError: err => showToast(errorMessage(err), 'error'),
    });

  return (
    <Card className="mb-6 p-6">
      <ol className="grid gap-3 sm:grid-cols-4" aria-label="Étapes du projet">
        {PROJECT_STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} aria-current={active ? 'step' : undefined} className="flex items-center gap-3">
              <span
                aria-hidden
                className={`grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${
                  done ? 'bg-[var(--success-100)] text-[var(--success-800)]' : active ? 'bg-[#C84A00] text-white' : 'bg-f-surface text-f-muted'
                }`}
              >
                {done ? <CheckIcon size={15} /> : i + 1}
              </span>
              <span className={`text-[14px] ${active ? 'font-bold' : 'text-f-muted'}`}>{PROJECT_STATUS_UI[s].label}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-f-line pt-5">
        <div className="min-w-0 text-[14.5px]">
          {project.client ? (
            <p>
              Client : <strong>{project.client.name}</strong>
              {project.client.username ? <span className="text-f-muted"> · identifiant {project.client.username}</span> : null}
              {project.client.pendingFirstLogin ? (
                <span className="ml-2 rounded-full bg-[var(--warning-100)] px-2 py-0.5 text-[12px] font-semibold text-[var(--warning-800)]">
                  Pas encore connecté
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-f-muted">Aucun client pour l’instant.</p>
          )}
          <p className="mt-1 text-[13.5px] text-f-muted">{NEXT_HINT[project.status]}</p>
        </div>

        {project.status === 'unassigned' ? (
          <button type="button" onClick={() => setAssignOpen(true)} className="cta-primary rounded-2xl px-5 py-3 text-[14.5px]">
            Assigner un client
          </button>
        ) : project.status === 'assigned' ? (
          <button type="button" disabled={step.isPending} onClick={() => run('start', 'Développement démarré')} className="cta-primary rounded-2xl px-5 py-3 text-[14.5px]">
            {step.isPending ? <SpinnerIcon /> : null} Début du développement
          </button>
        ) : project.status === 'in_progress' ? (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              disabled={step.isPending || !demoReady}
              onClick={() => run('finish', 'Projet terminé : votre client peut voir la démo')}
              className="cta-primary rounded-2xl px-5 py-3 text-[14.5px] disabled:opacity-50"
            >
              {step.isPending ? <SpinnerIcon /> : null} Marquer terminé
            </button>
            {!demoReady ? <span className="text-[12.5px] text-f-muted">Disponible quand la démo est en ligne</span> : null}
          </div>
        ) : null}
      </div>

      <AssignClientModal
        open={assignOpen}
        projectId={project.id}
        onClose={() => setAssignOpen(false)}
        onAssigned={r => {
          setAssignOpen(false);
          showToast('Client assigné', 'success');
          setCredentials(r.credentials);
        }}
      />
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </Card>
  );
}

const NEXT_HINT: Record<ProjectStatus, string> = {
  unassigned: 'Assignez un client : il suivra le projet depuis son espace.',
  assigned: 'Cliquez « Début du développement » quand vous commencez : votre client le verra aussi.',
  in_progress: 'Votre client ne voit pas encore la démo. Marquez le projet terminé quand il est prêt à être livré.',
  finished: 'Votre client peut tester la démo puis vous payer.',
};

type Mode = 'existing' | 'create';
type Errors = Partial<Record<'login' | 'name' | 'email' | 'phone' | 'amount', string>>;

export interface ClientFormValues {
  mode: Mode;
  login: string;
  name: string;
  email: string;
  phone: string;
  amountText: string;
  includeSource: boolean;
}

export const EMPTY_CLIENT_FORM: ClientFormValues = { mode: 'create', login: '', name: '', email: '', phone: '', amountText: '', includeSource: true };

/** Valide le formulaire ; renvoie l'entrée de l'API ou les erreurs à afficher. */
export function toAssignInput(v: ClientFormValues): { input: AssignClientInput | null; errors: Errors } {
  const errors: Errors = {};
  const amount = parseAmount(v.amountText);
  if (!(Number.isInteger(amount) && amount >= MIN && amount <= MAX)) errors.amount = `Montant en FCFA, entre ${formatXof(MIN)} et ${formatXof(MAX)}.`;
  const phone = v.phone.trim() ? normalizePhone(v.phone) : null;
  if (v.mode === 'existing') {
    if (v.login.trim().length < 3) errors.login = 'Indiquez l’identifiant ou l’e-mail du client.';
  } else {
    if (v.name.trim().length < 2) errors.name = 'Indiquez le nom du client.';
    if (v.email.trim() && !EMAIL_RE.test(v.email.trim())) errors.email = 'Adresse e-mail invalide.';
    if (v.phone.trim() && !phone) errors.phone = 'Numéro attendu au format international, ex. +221 77 000 00 00.';
  }
  if (Object.keys(errors).length) return { input: null, errors };
  return {
    errors,
    input: {
      amountXof: amount,
      includeSource: v.includeSource,
      client:
        v.mode === 'existing'
          ? { mode: 'existing', login: v.login.trim() }
          : { mode: 'create', name: v.name.trim(), email: v.email.trim() || undefined, phone: phone ?? undefined },
    },
  };
}

/** Champs « client + montant », partagés par la création de projet et la fenêtre d'assignation. */
export function ClientFields({ values, onChange, errors }: { values: ClientFormValues; onChange: (v: ClientFormValues) => void; errors: Errors }) {
  const set = <K extends keyof ClientFormValues>(k: K, val: ClientFormValues[K]) => onChange({ ...values, [k]: val });
  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Type de client" className="grid grid-cols-2 gap-2">
        {(
          [
            ['create', 'Créer son compte', 'Fid’s génère son identifiant'],
            ['existing', 'Client existant', 'Il a déjà un compte Fid’s'],
          ] as const
        ).map(([m, title, text]) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={values.mode === m}
            onClick={() => set('mode', m)}
            className={`rounded-2xl border p-3 text-left transition-colors ${values.mode === m ? 'border-[#C84A00] bg-[var(--color-accent-100)]' : 'border-f-line hover:bg-f-surface'}`}
          >
            <span className="block text-[14px] font-semibold">{title}</span>
            <span className="block text-[12.5px] text-f-muted">{text}</span>
          </button>
        ))}
      </div>

      {values.mode === 'existing' ? (
        <Field
          label="Identifiant ou e-mail du client"
          icon={<UserRoundIcon size={18} />}
          autoComplete="off"
          placeholder="mariam.traore42 ou client@exemple.sn"
          value={values.login}
          onChange={e => set('login', e.target.value)}
          error={errors.login}
          required
        />
      ) : (
        <>
          <Field
            label="Nom du client"
            icon={<UserRoundIcon size={18} />}
            autoComplete="off"
            placeholder="Ex. : Mariam Traoré"
            value={values.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
            maxLength={100}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-mail" optional icon={<MailIcon size={18} />} type="email" inputMode="email" autoComplete="off" placeholder="client@exemple.sn" value={values.email} onChange={e => set('email', e.target.value)} error={errors.email} />
            <Field label="Téléphone" optional icon={<PhoneIcon size={18} />} type="tel" inputMode="tel" autoComplete="off" placeholder="+221 77 000 00 00" value={values.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} />
          </div>
          <p className="text-[13px] text-f-muted">
            Fid’s crée le compte avec un identifiant et un mot de passe provisoire. Le client devra choisir son propre mot de passe à sa première connexion.
          </p>
        </>
      )}

      <Field
        label="Montant convenu (FCFA)"
        icon={<span aria-hidden className="text-[13px] font-bold">F</span>}
        inputMode="numeric"
        placeholder="Ex. : 350 000"
        value={values.amountText}
        onChange={e => set('amountText', e.target.value.replace(/[^\d\s.]/g, ''))}
        error={errors.amount}
        required
      />
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

function AssignClientModal({ open, projectId, onClose, onAssigned }: { open: boolean; projectId: string; onClose: () => void; onAssigned: (r: AssignClientResult) => void }) {
  const assign = useAssignClient(projectId);
  const [values, setValues] = useState(EMPTY_CLIENT_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const { input, errors: errs } = toAssignInput(values);
    setErrors(errs);
    setFormError(null);
    if (!input) return;
    assign.mutate(input, {
      onSuccess: r => {
        setValues(EMPTY_CLIENT_FORM);
        onAssigned(r);
      },
      onError: err => setFormError(errorMessage(err)),
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Assigner un client">
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormAlert message={formError} />
        <ClientFields values={values} onChange={setValues} errors={errors} />
        <button type="submit" disabled={assign.isPending} className="cta-primary h-[50px] w-full rounded-2xl text-[15px]">
          {assign.isPending ? (
            <>
              <SpinnerIcon /> Assignation…
            </>
          ) : (
            'Assigner'
          )}
        </button>
      </form>
    </Modal>
  );
}

/** Identifiants provisoires d'un compte client créé : affichés une seule fois, jamais stockés côté navigateur. */
export function CredentialsModal({ credentials, onClose }: { credentials: AssignClientResult['credentials']; onClose: () => void }) {
  const { showToast } = useToast();
  const loginUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/connexion`;
  const text = credentials
    ? `Bonjour, votre compte Fid’s est prêt.\nConnexion : ${loginUrl}\nIdentifiant : ${credentials.username}\nMot de passe provisoire : ${credentials.temporaryPassword}\nVous choisirez votre propre mot de passe à la première connexion.`
    : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Identifiants copiés', 'success');
    } catch {
      showToast('Copie impossible : recopiez-les à la main.', 'warning');
    }
  };

  return (
    <Modal open={credentials !== null} onClose={onClose} title="Compte client créé">
      {credentials ? (
        <div className="space-y-4">
          <p className="rounded-2xl bg-[var(--warning-100)] px-4 py-3 text-[13.5px] font-semibold text-[var(--warning-800)]">
            Transmettez ces identifiants maintenant : ils ne seront plus affichés.
          </p>
          <dl className="divide-y divide-[var(--color-divider)] rounded-2xl border border-f-line px-4 text-[15px]">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-f-muted">Identifiant</dt>
              <dd className="font-mono font-semibold">{credentials.username}</dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-f-muted">Mot de passe provisoire</dt>
              <dd className="font-mono font-semibold">{credentials.temporaryPassword}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="cta-ghost rounded-xl px-3 py-2 text-[13.5px]">
              <CopyIcon size={15} /> Copier le message
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="cta-ghost rounded-xl px-3 py-2 text-[13.5px]">
              <WhatsAppIcon size={15} /> Envoyer sur WhatsApp
            </a>
          </div>
          <button type="button" onClick={onClose} className="cta-primary h-[48px] w-full rounded-2xl text-[15px]">
            C’est transmis
          </button>
        </div>
      ) : null}
    </Modal>
  );
}

