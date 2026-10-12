import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { requirePageRole } from '@/components/auth/guard';

/** Tout l'espace client (/client/…) : réservé au rôle client. */
export default async function ClientLayout({ children }: { children: ReactNode }) {
  await requirePageRole('client', '/client/dashboard');
  return <AppShell role="client">{children}</AppShell>;
}
