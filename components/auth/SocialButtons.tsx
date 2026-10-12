'use client';

import { useState, type ReactNode } from 'react';
import { AppleIcon, GoogleIcon } from '@/components/Icons';
import { authClient } from '@/lib/auth-client';
import { GithubIcon, SpinnerIcon } from './AuthIcons';

export type SocialProvider = 'google' | 'apple' | 'github';

const META: Record<SocialProvider, { name: string; icon: ReactNode }> = {
  google: { name: 'Google', icon: <GoogleIcon size={19} /> },
  apple: { name: 'Apple', icon: <AppleIcon size={19} /> },
  github: { name: 'GitHub', icon: <GithubIcon size={19} /> },
};

/**
 * Boutons des fournisseurs configurés (la liste vient du serveur). Au retour,
 * /auth/suite oriente vers le choix du rôle ou le tableau de bord.
 */
export function SocialButtons({
  providers,
  verb,
  callbackURL = '/auth/suite',
  onError,
  disabled,
}: {
  providers: SocialProvider[];
  /** « Continuer avec » ou « S’inscrire avec ». */
  verb: string;
  callbackURL?: string;
  onError: (msg: string) => void;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  if (!providers.length) return null;

  const go = async (provider: SocialProvider) => {
    setBusy(provider);
    const { error } = await authClient.signIn.social({ provider, callbackURL, errorCallbackURL: '/connexion?erreur=oauth' });
    if (error) {
      setBusy(null);
      onError(`La connexion ${META[provider].name} a échoué. Réessayez ou utilisez votre e-mail.`);
    }
  };

  // Un seul fournisseur : bouton pleine largeur avec libellé. Plusieurs : rangée d'icônes + nom.
  const single = providers.length === 1;
  return (
    <div className={single ? '' : 'grid gap-2.5'} style={single ? undefined : { gridTemplateColumns: `repeat(${providers.length}, minmax(0, 1fr))` }}>
      {providers.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => go(p)}
          disabled={disabled || busy !== null}
          aria-label={`${verb} ${META[p].name}`}
          className="cta-ghost h-[52px] w-full justify-center rounded-2xl text-[15px] disabled:opacity-60"
        >
          {busy === p ? <SpinnerIcon /> : META[p].icon}
          <span className={single ? '' : 'max-[400px]:sr-only'}>{single ? `${verb} ${META[p].name}` : META[p].name}</span>
        </button>
      ))}
    </div>
  );
}
