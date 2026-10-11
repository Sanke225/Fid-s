import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { RecetteProvider } from '@/lib/context';
import { ToastProvider } from '@/components/Toast';
import { ConfettiProvider } from '@/components/Confetti';
import { CmdPalette } from '@/components/CmdPalette';
import { AppProviders } from '@/components/AppProviders';
import { PwaRegister } from '@/components/PwaRegister';
import { THEME_SCRIPT } from '@/lib/theme-script';

const TITLE = 'Fid’s · La livraison contre paiement, pour les logiciels.';
const DESCRIPTION = 'Fid’s est le tiers de confiance qui sécurise la livraison de logiciels entre freelances et clients. Opéré par Systalink.';
/** Image de partage de la charte (06_Web-OpenGraph). */
const SHARE_IMAGE = { url: '/opengraph-image-1200x630.png', width: 1200, height: 630, alt: 'Fid’s, la livraison contre paiement pour les logiciels' };

export const metadata: Metadata = {
  // URL absolue des images de partage ; BETTER_AUTH_URL est l'URL publique du site.
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: 'Fid’s',
  // Le manifeste PWA vient de app/manifest.ts (lien ajouté automatiquement).
  appleWebApp: { capable: true, title: 'Fid’s', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    // favicon.svg bascule l'encre en crème quand le navigateur est en mode sombre
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Fid’s',
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF8F1' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0F' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Thème posé avant l'hydratation, pour éviter le flash clair → sombre (voir lib/theme-script.ts) */}
        <Script id="fids-theme" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <AppProviders>
          <RecetteProvider>
            <ToastProvider>
              <ConfettiProvider>
                <main id="app-content">{children}</main>
                <CmdPalette />
                <PwaRegister />
              </ConfettiProvider>
            </ToastProvider>
          </RecetteProvider>
        </AppProviders>
      </body>
    </html>
  );
}
