import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { requirePageRole } from '@/components/auth/guard';

export default async function Layout({ children }: { children: ReactNode }) {
  await requirePageRole('admin', '/admin/overview');
  return <AppShell role="admin">{children}</AppShell>;
}
