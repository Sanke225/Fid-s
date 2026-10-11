'use client';

import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { CheckIcon } from '@/components/Icons';
import { Reveal } from '@/components/motion/Reveal';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { CountUp } from '@/components/motion/CountUp';
import { FEE_RATE, computeFee } from '@/lib/payments/fee-rules';
import { SectionHeading } from './SectionHeading';

const MIN = 50_000;
const MAX = 2_500_000;

/** Nombre qui glisse vers sa nouvelle valeur (ressort) au lieu de sauter. */
function AnimatedAmount({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 120, damping: 22 });
  const text = useTransform(spring, v => `${Math.round(v).toLocaleString('fr-FR')} FCFA`);
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  return <motion.span className={`tabular-nums ${className ?? ''}`}>{text}</motion.span>;
}

export function Pricing() {
  const [amount, setAmount] = useState(500_000);
  const fee = computeFee(amount);
  const pct = ((amount - MIN) / (MAX - MIN)) * 100;

  return (
    <section id="tarifs" aria-labelledby="tarifs-titre" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <SectionHeading id="tarifs-titre" eyebrow="Modèle transparent" title={<><CountUp to={0} suffix=" %" /> pour le développeur</>}>
        Le développeur reçoit 100 % du montant convenu. Le client règle {FEE_RATE * 100} % de frais de service au moment de recevoir son application. Pas d’abonnement, pas de frais cachés.
      </SectionHeading>

      <Reveal delay={0.1} className="mt-14">
        <SpotlightCard className="grid gap-8 rounded-[32px] border border-f-line bg-f-card p-7 shadow-f-soft sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <label htmlFor="calc-amount" className="text-[14.5px] font-semibold">Montant de votre livraison</label>
            <div className="mt-2 font-display text-[clamp(2rem,4vw,2.6rem)] text-f-ink-accent">
              <AnimatedAmount value={amount} />
            </div>
            <input
              id="calc-amount"
              type="range"
              min={MIN}
              max={MAX}
              step={25_000}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              aria-valuetext={`${amount.toLocaleString('fr-FR')} francs CFA`}
              className="fd-range mt-5 w-full"
              style={{ '--fill': `${pct}%` } as CSSProperties}
            />
            <div className="mt-2 flex justify-between text-[12.5px] text-f-muted">
              <span>50 000 F</span>
              <span>2 500 000 F</span>
            </div>
          </div>

          <div className="space-y-4 rounded-[24px] bg-f-surface p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-[16px]">Le développeur reçoit</span>
              <AnimatedAmount value={amount} className="ml-auto whitespace-nowrap text-[22px] font-bold text-f-success-ink" />
            </div>
            <p className="-mt-2 text-[12.5px] text-f-muted">100 %, directement sur son numéro Mobile Money.</p>
            <div className="h-px bg-f-line" />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px]">
              <span className="text-f-muted">Frais Fid’s payés par le client ({FEE_RATE * 100} %)</span>
              <AnimatedAmount value={fee} className="ml-auto whitespace-nowrap font-bold" />
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[15px]">
              <span className="text-f-muted">Le client paie au total</span>
              <AnimatedAmount value={amount + fee} className="ml-auto whitespace-nowrap font-bold" />
            </div>
            <p className="flex items-start gap-1.5 text-[12.5px] text-f-muted">
              <CheckIcon size={14} className="mt-0.5 shrink-0 text-f-success-ink" />
              Les frais ne sont dus qu’à la remise de l’application : tant que le client n’a pas payé, la démo reste une démo.
            </p>
          </div>
        </SpotlightCard>
      </Reveal>
    </section>
  );
}
