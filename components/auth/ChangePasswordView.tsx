'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { LockIcon } from '@/components/Icons';
import { AuthShell, type AuthAside } from './AuthShell';
import { SpinnerIcon } from './AuthIcons';
import { Field, FormAlert } from './Field';
import { VaultScene, type VaultStatus } from './VaultScene';
import { changePassword, failureMessage, homeFor, passwordScore } from './authApi';

const ASIDE: AuthAside = {
  id: 'password',
  eyebrow: 'Première connexion',
  title: 'Une clé qui n’appartient qu’à vous.',
  text: 'Votre développeur a créé votre compte avec un mot de passe provisoire. Choisissez le vôtre : lui-même ne le connaîtra pas.',
};

/** Remplacement obligatoire du mot de passe provisoire d'un compte créé par un développeur. */
export function ChangePasswordView({ name }: { name: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<VaultStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!current) errs.current = 'Saisissez le mot de passe reçu de votre développeur.';
    if (next.length < 8) errs.next = '8 caractères minimum.';
    else if (next === current) errs.next = 'Choisissez un mot de passe différent du provisoire.';
    if (confirm !== next) errs.confirm = 'Les deux mots de passe ne correspondent pas.';
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;

    setStatus('loading');
    try {
      const user = await changePassword({ currentPassword: current, newPassword: next });
      setStatus('success');
      setTimeout(() => router.push(homeFor(user.role)), 900);
    } catch (err) {
      setFormError(failureMessage(err));
      setStatus('error');
      setTimeout(() => setStatus(s => (s === 'error' ? 'idle' : s)), 900);
    }
  };

  const busy = status === 'loading' || status === 'success';
  const score = passwordScore(next);

  return (
    <AuthShell scene={<VaultScene status={status} />} aside={ASIDE}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-f-surface text-f-ink-accent">
          <LockIcon size={20} />
        </span>
        <div>
          <h1 className="font-display text-[30px] leading-none">Bienvenue, {name.split(' ')[0]}</h1>
          <p className="mt-1 text-[14.5px] text-f-muted">Choisissez votre mot de passe pour continuer.</p>
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-7 space-y-4">
        <FormAlert message={formError} />
        <Field label="Mot de passe provisoire" icon={<LockIcon size={18} />} type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} error={errors.current} disabled={busy} required />
        <Field
          label="Nouveau mot de passe"
          icon={<LockIcon size={18} />}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={e => setNext(e.target.value)}
          error={errors.next}
          hint={next ? <span className="text-[12.5px] text-f-muted">Solidité : {['', 'faible', 'moyenne', 'bonne', 'excellente'][score]}</span> : undefined}
          disabled={busy}
          required
        />
        <Field label="Confirmez le mot de passe" icon={<LockIcon size={18} />} type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} error={errors.confirm} disabled={busy} required />
        <button type="submit" disabled={busy} className="cta-primary h-[52px] w-full rounded-2xl text-[15.5px]">
          {status === 'loading' ? (
            <>
              <SpinnerIcon /> Enregistrement…
            </>
          ) : (
            'Enregistrer mon mot de passe'
          )}
        </button>
      </form>
    </AuthShell>
  );
}
