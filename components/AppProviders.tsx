'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiClientError } from '@/lib/api/client';

/** Fournisseurs communs à toute l'application. Un QueryClient par navigateur, créé une seule fois. */
export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // Pas de nouvel essai sur une erreur « normale » (401, 403, 404, 422…) : seulement réseau / 5xx.
            retry: (count, e) => !(e instanceof ApiClientError && e.status >= 400 && e.status < 500) && count < 2,
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
