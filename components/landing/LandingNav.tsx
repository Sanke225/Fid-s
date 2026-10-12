'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { BrandLogo } from '@/components/Brand';
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from '@/components/Icons';
import { EASE } from '@/components/motion/easing';
import { useTheme } from '@/lib/theme';
import { BRAND, NAV_LINKS } from './data';

/** Barre de verre : se condense au scroll, se cache en descendant, revient en remontant. */
export function LandingNav() {
  const { isDark, setTheme } = useTheme();
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', y => {
    const prev = scrollY.getPrevious() ?? 0;
    setCondensed(y > 24);
    setHidden(y > 160 && y > prev && !open);
  });

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      animate={{ y: hidden ? '-120%' : '0%' }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <nav
        aria-label="Navigation principale"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border transition-all duration-500 ${
          condensed
            ? 'border-f-glass-line bg-f-glass py-2 pl-4 pr-2 shadow-f-soft backdrop-blur-2xl backdrop-saturate-150'
            : 'border-transparent bg-transparent py-3.5 pl-4 pr-3'
        }`}
      >
        <Link href="/" className="flex items-center rounded-full py-1 text-f-text">
          <BrandLogo height={30} title={`${BRAND}, accueil`} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href} className="nav-link rounded-full px-3.5 py-2 text-[14.5px] font-medium text-f-text">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="grid size-10 place-items-center rounded-full text-f-text transition-colors hover:bg-f-surface"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <Link
            href="/connexion"
            transitionTypes={['nav-forward']}
            className="hidden rounded-full px-4 py-2.5 text-[14.5px] font-semibold text-f-text transition-colors hover:bg-f-surface sm:inline-flex"
          >
            Se connecter
          </Link>
          <Link href="/inscription" transitionTypes={['nav-forward']} className="cta-primary hidden rounded-full px-5 py-2.5 text-[14.5px] sm:inline-flex">
            Commencer
          </Link>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="grid size-10 place-items-center rounded-full text-f-text hover:bg-f-surface md:hidden"
          >
            {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="landing-mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto mt-2 max-w-6xl origin-top rounded-3xl border border-f-glass-line bg-f-glass p-3 shadow-f-float backdrop-blur-2xl md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-[16px] font-medium text-f-text hover:bg-f-surface">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href="/connexion" transitionTypes={['nav-forward']} className="cta-ghost justify-center rounded-full py-3 text-[15px]">
                Se connecter
              </Link>
              <Link href="/inscription" transitionTypes={['nav-forward']} className="cta-primary justify-center rounded-full py-3 text-[15px]">
                Commencer
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
