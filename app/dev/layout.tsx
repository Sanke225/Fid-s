import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { requirePageRole } from '@/components/auth/guard';

export default async function DevLayout({ children }: { children: ReactNode }) {
  await requirePageRole('dev', '/dev/dashboard');
  return <AppShell role="dev">{children}</AppShell>;
}
