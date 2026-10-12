'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowRightIcon, CheckIcon, LockIcon } from '@/components/Icons';
import { authClient } from '@/lib/auth-client';
import { AuthShell, OrDivider, type AuthAside } from './AuthShell';
import { MailIcon, SpinnerIcon } from './AuthIcons';
import { authErrorMessage, failureMessage, fetchMe } from './authApi';
import { returnFor } from './paths';
import { Field, FormAlert } from './Field';
import { SocialButtons, type SocialProvider } from './SocialButtons';
import { useSyncMockUser } from './useSyncMockUser';
import { VaultScene, type VaultStatus } from './VaultScene';

const ASIDE: Record<'base' | 'ok', AuthAside> = {
  base: {
    id: 'login',
    eyebrow: 'Espace sécurisé',
    title: 'Votre coffre vous attend.',
    text: 'Livraisons, paiements et accès restent scellés jusqu’au bon moment. Vous seul avez la clé.',
  },
  ok: {
    id: 'login-ok',
    eyebrow: 'Accès accordé',
    title: 'Le coffre s’ouvre.',
    text: 'Redirection vers votre espace…',
  },
};

/**
 * account_not_linked : un compte e-mail existe déjà avec cette adresse. Better Auth refuse de le relier
 * tant que l'adresse n'a pas été vérifiée (protection contre la prise de compte) : on oriente vers le mot de passe.
 */
function oauthMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  if (code === 'account_not_linked')
    return 'Un compte existe déjà avec cette adresse e-mail. Connectez-vous avec votre mot de passe.';
  if (code === 'access_denied') return 'Connexion annulée. Vous pouvez réessayer ou utiliser votre e-mail.';
  return 'La connexion avec ce fournisseur n’a pas abouti. Réessayez ou utilisez votre e-mail.';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginViewProps {
  providers: SocialProvider[];
  /** Page réservée demandée avant la connexion (déjà filtrée côté serveur). */
  retour: string | null;
  /** Code d'échec d'un aller-retour Google / Apple / GitHub (paramètre « error » de Better Auth). */
  oauthError?: string | null;
}

export function LoginView({ providers, retour, oauthError }: LoginViewProps) {
  const router = useRouter();
  const syncMock = useSyncMockUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<VaultStatus>('idle');
  const [formError, setFormError] = useState<string | null>(oauthMessage(oauthError));
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const fail = (message: string) => {
    setFormError(message);
    setStatus('error');
    setTimeout(() => setStatus(s => (s === 'error' ? 'idle' : s)), 900);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof fieldErrors = {};
    // E-mail, ou identifiant d'un compte client créé par son développeur.
    const login = email.trim();
    const byUsername = !login.includes('@');
    if (byUsername ? login.length < 3 : !EMAIL_RE.test(login)) errs.email = 'Saisissez votre adresse e-mail ou votre identifiant.';
    if (!password) errs.password = 'Saisissez votre mot de passe.';
    setFieldErrors(errs);
    setFormError(null);
    if (errs.email || errs.password) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 600);
      return;
    }

    setStatus('loading');
    const { error } = byUsername
      ? await authClient.signIn.username({ username: login, password })
      : await authClient.signIn.email({ email: login, password });
    if (error) return fail(authErrorMessage(error));

    try {
      const user = await fetchMe();
      // Compte créé par un développeur : choisir son mot de passe avant tout.
      if (user.mustChangePassword) {
        router.push('/compte/mot-de-passe');
        return;
      }
      if (!user.role) {
        router.push('/inscription?etape=role');
        return;
      }
      syncMock(user);
      setStatus('success');
      setTimeout(() => router.push(returnFor(user.role, retour)), 1100);
    } catch (err) {
      fail(failureMessage(err));
    }
  };

  const busy = status === 'loading' || status === 'success';

  return (
    <AuthShell scene={<VaultScene status={status} />} aside={status === 'success' ? ASIDE.ok : ASIDE.base}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-f-surface text-f-ink-accent">
          <LockIcon size={20} />
        </span>
        <div>
          <h1 className="font-display text-[30px] leading-none">Bon retour</h1>
          <p className="mt-1 text-[14.5px] text-f-muted">Connectez-vous à votre espace.</p>
        </div>
      </div>

      {providers.length ? (
        <>
          <div className="mt-7">
            <SocialButtons
              providers={providers}
              verb="Continuer avec"
              callbackURL={retour ? `/auth/suite?retour=${encodeURIComponent(retour)}` : '/auth/suite'}
              onError={fail}
              disabled={busy}
            />
          </div>
          <OrDivider />
        </>
      ) : (
        <div className="h-7" />
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        <FormAlert message={formError} />
        <Field
          label="E-mail ou identifiant"
          icon={<MailIcon size={18} />}
          type="text"
          name="email"
          autoComplete="username"
          autoCapitalize="none"
          placeholder="vous@exemple.sn ou mariam.traore42"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={fieldErrors.email}
          disabled={busy}
          required
        />
        <Field
          label="Mot de passe"
          icon={<LockIcon size={18} />}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={fieldErrors.password}
          disabled={busy}
          required
        />

        <button type="submit" disabled={busy} className="cta-primary group h-[54px] w-full rounded-2xl text-[16px] disabled:cursor-wait">
          {status === 'loading' ? (
            <>
              <SpinnerIcon /> Vérification…
            </>
          ) : status === 'success' ? (
            <motion.span initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2">
              <CheckIcon size={18} /> Accès accordé
            </motion.span>
          ) : (
            <>
              Se connecter
              <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-[14.5px] text-f-muted">
        Pas encore de compte ?{' '}
        <Link href="/inscription" transitionTypes={['nav-forward']} className="font-semibold text-f-ink-accent underline-offset-4 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthShell>
  );
}
