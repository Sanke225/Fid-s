import type { Metadata } from 'next';
import './globals.css';
import { RecetteProvider } from '@/lib/context';
import { ToastProvider } from '@/components/Toast';
import { ConfettiProvider } from '@/components/Confetti';
import { Navbar } from '@/components/Navbar';
import { CmdPalette } from '@/components/CmdPalette';

export const metadata: Metadata = {
  title: 'Recette · La livraison contre paiement, pour les logiciels.',
  description: 'Recette est le tiers de confiance qui sécurise la livraison de logiciels entre freelances et clients. Opéré par Systalink.'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <RecetteProvider>
          <ToastProvider>
            <ConfettiProvider>
              <Navbar />
              <main id="app-content">{children}</main>
              <CmdPalette />
            </ConfettiProvider>
          </ToastProvider>
        </RecetteProvider>
      </body>
    </html>
  );
}
