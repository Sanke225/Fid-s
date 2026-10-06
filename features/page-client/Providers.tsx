'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function PageClientProviders({ children }: { children: ReactNode }) {
  // Un client par navigateur, créé une seule fois (jamais partagé entre requêtes serveur).
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: true, staleTime: 1_000 } } }),
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
