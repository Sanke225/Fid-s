import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ViewTransition } from 'react';
import { SignupView } from '@/components/auth/SignupView';
import { homeFor } from '@/components/auth/paths';
import { currentUser, socialProviders } from '@/components/auth/session';
import { BRAND } from '@/components/landing/data';

export const metadata: Metadata = {
  title: `Créer un compte · ${BRAND}`,
  description: `Inscrivez-vous sur ${BRAND} comme développeur ou comme client.`,
};

const SLIDE = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

export default async function InscriptionPage() {
  const user = await currentUser();
  // Déjà inscrit avec un rôle : rien à faire ici. Connecté sans rôle (retour Google) : choix du rôle seul.
  if (user?.role) redirect(homeFor(user.role));

  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <SignupView providers={socialProviders()} pendingUser={user ? { name: user.name } : null} />
    </ViewTransition>
  );
}
