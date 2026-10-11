'use client';

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { useRef, useState } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { EASE } from '@/components/motion/easing';
import { STEPS } from './data';
import { SectionHeading } from './SectionHeading';
import { StepVisual } from './StepVisual';

/**
 * Grand écran : section épinglée, les étapes avancent avec le scroll et une ligne se dessine.
 * Petit écran : frise verticale classique (le contenu ne tiendrait pas épinglé).
 */
export function HowItWorks() {
  return (
    <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="relative border-y border-f-line bg-f-surface">
      <div className="hidden lg:block">
        <PinnedSteps />
      </div>
      <div className="px-4 py-24 sm:px-6 lg:hidden">
        <SectionHeading id="fonctionnement-titre" eyebrow="Comment ça marche" title="Cinq temps, zéro pari" />
        <ol className="mx-auto mt-14 max-w-xl space-y-10 border-l-2 border-f-line pl-7">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[45px] top-0 grid size-9 place-items-center rounded-full bg-[linear-gradient(120deg,#A63E00,#FF6A00)] text-[14px] font-bold text-white">
                {i + 1}
              </span>
              <Reveal>
                <h3 className="font-display text-[22px]">{s.title}</h3>
                <p className="mt-1.5 text-[15.5px] leading-relaxed text-f-muted">{s.text}</p>
                <div className="mt-5 rounded-[24px] border border-f-line bg-f-bg">
                  <StepVisual index={i} />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PinnedSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  useMotionValueEvent(scrollYProgress, 'change', v => {
    setActive(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length)));
  });

  return (
    <div ref={ref} className="relative" style={{ height: `${STEPS.length * 75 + 25}vh` }}>
      <div className="sticky top-0 flex h-svh items-center">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_1.05fr] items-center gap-16 px-8">
          <div>
            <span className="text-[12.5px] font-bold uppercase tracking-[.14em] text-f-ink-accent">Comment ça marche</span>
            <h2 className="mt-3 font-display text-[clamp(2rem,3.6vw,3.1rem)] leading-[1.06] tracking-[-0.02em]">Cinq temps, zéro pari</h2>

            <ol className="relative mt-10 space-y-1">
              <svg aria-hidden className="absolute left-[19px] top-5 h-[calc(100%-40px)] w-[3px] overflow-visible" preserveAspectRatio="none" viewBox="0 0 2 100">
                <line x1="1" y1="0" x2="1" y2="100" stroke="var(--color-divider)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <motion.line
                  x1="1" y1="0" x2="1" y2="100" stroke="url(#fd-step-grad)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                  style={{ pathLength: progress }}
                />
                <defs>
                  <linearGradient id="fd-step-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FF6A00" />
                    <stop offset="1" stopColor="#FFB547" />
                  </linearGradient>
                </defs>
              </svg>
              {STEPS.map((s, i) => {
                const isActive = i === active;
                const done = i < active;
                return (
                  <li key={s.title} aria-current={isActive ? 'step' : undefined} className="relative flex gap-5 py-3">
                    <span
                      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border-2 text-[14px] font-bold transition-all duration-500 ${
                        isActive || done
                          ? 'border-transparent bg-[linear-gradient(120deg,#A63E00,#FF6A00)] text-white shadow-[0_6px_20px_-4px_rgba(255,106,0,.6)]'
                          : 'border-f-line bg-f-bg text-f-muted'
                      } ${isActive ? 'scale-110' : ''}`}
                    >
                      {i + 1}
                    </span>
                    <div className={`pt-1.5 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-55'}`}>
                      <h3 className="font-display text-[21px] leading-tight">{s.title}</h3>
                      <motion.p
                        initial={false}
                        animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden text-[15.5px] leading-relaxed text-f-muted"
                      >
                        <span className="block pt-1.5">{s.text}</span>
                      </motion.p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="relative aspect-[5/4.4] [perspective:1200px]">
            <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,var(--orb-a),transparent)] opacity-40 blur-3xl" />
            <div className="relative size-full overflow-hidden rounded-[32px] border border-f-line bg-f-bg shadow-f-float">
              <div aria-hidden className="absolute right-6 top-5 font-display text-[64px] leading-none text-f-line">0{active + 1}</div>
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, rotateX: -8, y: 30 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, rotateX: 6, y: -24 }}
                  transition={{ duration: 0.65, ease: EASE }}
                >
                  <StepVisual index={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
