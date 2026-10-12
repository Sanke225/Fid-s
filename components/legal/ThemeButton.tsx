'use client';

import { MoonIcon, SunIcon } from '@/components/Icons';
import { useTheme } from '@/lib/theme';

export function ThemeButton() {
  const { isDark, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      className="grid size-9 place-items-center rounded-full border border-f-line bg-f-card text-f-text transition-colors hover:bg-f-surface"
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
}
