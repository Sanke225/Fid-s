'use client';

import type { User as ApiUser } from '@/lib/contracts';
import { useRecette } from '@/lib/context';
import { useSetMe } from '@/lib/queries/me';

/**
 * Après connexion : publie le compte dans le cache React Query (useMe) et, temporairement,
 * dans l'état simulé que lisent encore certains écrans. La partie simulée disparaît au lot 5.
 */
export function useSyncMockUser() {
  const { loginCustomUser } = useRecette();
  const setMe = useSetMe();
  return (user: ApiUser) => {
    setMe(user);
    if (!user.role) return;
    loginCustomUser({
      fullName: user.name,
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      businessName: user.businessName ?? undefined,
      role: user.role,
    });
  };
}
