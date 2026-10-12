import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ChangePasswordView } from '@/components/auth/ChangePasswordView';
import { homeFor } from '@/components/auth/paths';
import { currentUser } from '@/components/auth/session';
import { BRAND } from '@/components/landing/data';

export const metadata: Metadata = {
  title: `Choisir mon mot de passe · ${BRAND}`,
};

export default async function ChangePasswordPage() {
  const user = await currentUser();
  if (!user) redirect('/connexion');
  if (!user.mustChangePassword) redirect(homeFor(user.role));
  return <ChangePasswordView name={user.name} />;
}
