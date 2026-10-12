'use client';

import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { EASE } from './easing';

interface CountUpProps {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

const format = (v: number, decimals: number) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/**
 * Compteur qui monte jusqu'à `to` quand il entre dans l'écran.
 * Le serveur rend la valeur finale (lisible sans JavaScript).
 */
export function CountUp({ to, decimals = 0, prefix = '', suffix = '', duration = 1.8, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduced = useReducedMotion();

  // Hors de l'écran au chargement : repartir de zéro pour que le compteur ait quelque chose à animer.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight) el.textContent = prefix + format(0, decimals) + suffix;
  }, [reduced, prefix, suffix, decimals]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduced) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: v => {
        el.textContent = prefix + format(v, decimals) + suffix;
      },
    });
    return () => controls.stop();
  }, [inView, reduced, to, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ''}`}>
      {prefix + format(to, decimals) + suffix}
    </span>
  );
}
