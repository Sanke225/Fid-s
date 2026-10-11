'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE, VIEWPORT_ONCE } from './easing';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Décalage de départ en px (négatif = vient de la gauche / du haut). */
  x?: number;
  y?: number;
  duration?: number;
}

/** Apparition à l'entrée dans l'écran, une seule fois. */
export function Reveal({ children, className, delay = 0, x = 0, y = 28, duration = 0.8 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
