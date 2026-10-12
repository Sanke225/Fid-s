'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/Brand';
import { ArrowLeftIcon, MoonIcon, SunIcon } from '@/components/Icons';
import { EASE } from '@/components/motion/easing';
import { useTheme } from '@/lib/theme';

export interface AuthAside {
  /** Clé de l'animation : changer de clé fait glisser le nouveau texte. */
  id: string;
  eyebrow: string;
  title: string;
  text: string;
}

/**
 * Cadre commun connexion / inscription : scène animée en fond, texte d'ambiance à gauche
 * (grand écran), carte de verre à droite. Reprend les jetons et effets de la landing (.landing).
 */
export function AuthShell({ scene, aside, children }: { scene: ReactNode; aside: AuthAside; children: ReactNode }) {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="landing relative isolate min-h-svh overflow-x-clip text-f-text">
      <div className="absolute inset-0 -z-10">{scene}</div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 pt-5 sm:px-8">
        <Link
          href="/"
          transitionTypes={['nav-back']}
          className="group flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-[14px] font-semibold text-f-text transition-colors hover:bg-f-glass"
        >
          <BrandLogo height={30} />
          <span className="ml-2 hidden items-center gap-1 text-f-muted transition-colors group-hover:text-f-text sm:flex">
            <ArrowLeftIcon size={15} /> Retour au site
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="grid size-10 place-items-center rounded-full border border-f-glass-line bg-f-glass text-f-text backdrop-blur-xl transition-colors hover:bg-f-card"
        >
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-10 px-4 pb-10 pt-[24svh] sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pb-16 lg:pt-6">
        <div className="hidden self-end pb-6 lg:block">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={aside.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="max-w-md rounded-[28px] border border-f-glass-line bg-f-glass p-6 shadow-f-soft backdrop-blur-xl"
            >
              <span className="text-[12px] font-bold uppercase tracking-[.14em] text-f-ink-accent">{aside.eyebrow}</span>
              <p className="mt-2 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.08]">{aside.title}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-f-muted">{aside.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fd-in mx-auto w-full max-w-[468px] lg:mr-0">
          <div className="rounded-[32px] border border-f-glass-line bg-f-glass p-6 shadow-f-float backdrop-blur-2xl backdrop-saturate-150 sm:p-9">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Séparateur « ou » entre Google et le formulaire. */
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-[12.5px] font-medium uppercase tracking-[.12em] text-f-muted">
      <span className="h-px flex-1 bg-f-line" />
      ou
      <span className="h-px flex-1 bg-f-line" />
    </div>
  );
}
