'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useConfetti } from '@/components/Confetti';
import { WaveIcon } from '@/components/Icons';
import { Reveal } from '@/components/motion/Reveal';
import { EASE } from '@/components/motion/easing';
import { useToast } from '@/components/Toast';
import { DEMO_STEPS, DOMAIN } from './data';
import { SectionHeading } from './SectionHeading';

type Phase = 'idle' | 'running' | 'success';

/** Démo interactive : paiement symbolique de 100 FCFA, confirmation du dev, passation. */
export function LiveDemo() {
  const { launchConfetti } = useConfetti();
  const { showToast } = useToast();
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const run = () => {
    setPhase('running');
    setStep(0);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      if (i < DEMO_STEPS.length) {
        setStep(i);
        return;
      }
      if (timer.current) clearInterval(timer.current);
      setPhase('success');
      launchConfetti();
      showToast('Application débloquée !', 'success');
    }, 900);
  };

  const current = DEMO_STEPS[step];

  return (
    <section id="demo" aria-labelledby="demo-titre" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading id="demo-titre" align="left" eyebrow="À vous de jouer" title="La démo en 3 minutes, en direct">
            Lancez un paiement symbolique de 100 FCFA et regardez la livraison se débloquer.
          </SectionHeading>
          <Reveal delay={0.15}>
            <ol className="mt-8 space-y-4">
              {['Le client paie le dev et saisit la référence', 'Le dev confirme le dépôt', 'Le client règle les 5 % de frais Fid’s', 'L’application passe au nom du client'].map((t, i) => (
                <li key={t} className="flex items-center gap-4 text-[16px]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-f-surface font-bold text-f-ink-accent">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal x={40} y={0} delay={0.1}>
          <div className="relative overflow-hidden rounded-[32px] border border-f-line bg-f-card p-7 shadow-f-float sm:p-9">
            <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-[var(--orb-b)] opacity-50 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px] text-f-muted">Projet de test</div>
                  <div className="text-[17px] font-bold">Menu QR · Resto Tantie Fatou</div>
                </div>
                <WaveIcon size={34} />
              </div>
              <div className="mt-6 rounded-2xl bg-f-surface p-5">
                <div className="text-[12.5px] text-f-muted">Montant de test</div>
                <div className="font-display text-[40px] leading-tight">100 FCFA</div>
              </div>

              <div className="mt-6 min-h-[148px]" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  {phase === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }}>
                      <button type="button" onClick={run} className="cta-primary w-full rounded-full py-4 text-[16px]">
                        Lancer le paiement (100 FCFA)
                      </button>
                      <p className="mt-3 text-center text-[13px] text-f-muted">Simulation : aucun argent réel n’est envoyé.</p>
                    </motion.div>
                  )}

                  {phase === 'running' && (
                    <motion.div key="running" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: EASE }}>
                      <div className="flex justify-between text-[13px] font-semibold">
                        <span>Déblocage en cours</span>
                        <span className="tabular-nums text-f-ink-accent">{current.pct} %</span>
                      </div>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-f-surface" role="progressbar" aria-valuenow={current.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du déblocage">
                        <motion.div
                          className="h-full origin-left rounded-full bg-[linear-gradient(90deg,#FF6A00,#FFB547)]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: current.pct / 100 }}
                          transition={{ duration: 0.8, ease: EASE }}
                        />
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.p key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }} className="mt-4 text-[14.5px] text-f-muted">
                          {current.text}
                        </motion.p>
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {phase === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="text-center">
                      <div className="font-display text-[24px] text-f-success-ink">Application débloquée !</div>
                      <div className="mt-2 text-[13px] text-f-muted">Adresse finale</div>
                      <div className="mt-1 font-mono text-[14.5px] font-semibold">https://tantie.app.{DOMAIN}</div>
                      <div className="mt-2 text-[12.5px] text-f-muted">Facture FD-2026-000003 émise</div>
                      <button type="button" onClick={() => { setPhase('idle'); setStep(0); }} className="cta-ghost mt-5 rounded-full px-6 py-3 text-[14.5px]">
                        Rejouer la démo
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
