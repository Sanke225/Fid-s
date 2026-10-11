import { redirect } from 'next/navigation';

/** Ancienne adresse : connexion et inscription ont chacune leur page. */
export default async function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  redirect(mode === 'signup' ? '/inscription' : '/connexion');
}
