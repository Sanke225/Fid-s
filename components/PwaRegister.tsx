'use client';

import { useEffect } from 'react';

/**
 * Enregistre le service worker (public/sw.js) une fois la page chargée.
 * Seulement en production : en dev, il interférerait avec le rechargement à chaud.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
        // Sans service worker, le site fonctionne normalement : seule l'installation hors ligne manque.
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
