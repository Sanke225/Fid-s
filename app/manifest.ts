import type { MetadataRoute } from 'next';

/**
 * Manifeste PWA (servi sur /manifest.webmanifest, lien ajouté automatiquement par Next).
 * Couleurs et icônes de la charte : crème #FFF8F1, orange #FF6A00 (Fids-Identite-Visuelle/03_Favicon-Icones-App).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Fid’s · La livraison contre paiement',
    short_name: 'Fid’s',
    description: 'Le tiers de confiance qui sécurise la livraison de logiciels entre freelances et clients.',
    lang: 'fr',
    dir: 'ltr',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFF8F1',
    theme_color: '#FF6A00',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Se connecter', url: '/connexion', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
      { name: 'Nouveau projet', url: '/dev/new', icons: [{ src: '/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
