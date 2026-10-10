import type { Metadata, Viewport } from 'next'
import { PageClientProviders } from '@/features/page-client/Providers'

export const metadata: Metadata = {
  title: 'Fid’s · Livraison',
  robots: { index: false, follow: false }, // pages à lien privé : jamais indexées
}

export const viewport: Viewport = { themeColor: '#121826' }

/** Groupe des pages vues par le client (pas de compte) : page de livraison et espace client. */
export default function ClientLayout({ children }: LayoutProps<'/'>) {
  return (
    <PageClientProviders>
      <div lang="fr" className="pc-root min-h-dvh w-full font-sans">
        {children}
      </div>
    </PageClientProviders>
  )
}
