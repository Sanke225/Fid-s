import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { LoginView } from '@/components/auth/LoginView';
import { returnFor, safeReturn } from '@/components/auth/paths';
import { currentUser, socialProviders } from '@/components/auth/session';
import { BRAND } from '@/components/landing/data';

export const metadata: Metadata = {
  title: `Connexion · ${BRAND}`,
  description: `Connectez-vous à votre espace ${BRAND}.`,
};

const SLIDE = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ retour?: string; erreur?: string; error?: string }>;
}) {
  const { retour, erreur, error } = await searchParams;
  const user = await currentUser();
  if (user) redirect(user.role ? returnFor(user.role, retour) : '/inscription?etape=role');

  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <LoginView providers={socialProviders()} retour={safeReturn(retour)} oauthError={erreur === 'oauth' ? (error ?? 'unknown') : null} />
    </ViewTransition>
  );
}
