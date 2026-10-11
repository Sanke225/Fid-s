'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_KEY } from './theme-script';

export type Theme = 'light' | 'dark';

const EVENT = 'fids-theme-change';

const read = (): Theme => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

function subscribe(onChange: () => void) {
  // Changement dans un autre onglet : on applique puis on prévient.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY || (e.newValue !== 'dark' && e.newValue !== 'light')) return;
    document.documentElement.setAttribute('data-theme', e.newValue);
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Thème clair / sombre. La source de vérité est l'attribut data-theme de <html>
 * (posé avant l'affichage par THEME_SCRIPT) ; le choix est gardé dans le localStorage.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => 'light' as Theme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Navigation privée stricte : le thème vaut pour la session seulement.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const toggleTheme = useCallback(() => setTheme(read() === 'dark' ? 'light' : 'dark'), [setTheme]);

  return { theme, isDark: theme === 'dark', setTheme, toggleTheme };
}
