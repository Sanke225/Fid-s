'use client';

import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import { EASE, VIEWPORT_ONCE } from './easing';

const container: Variants = {
  hidden: {},
  show: (gap: number) => ({ transition: { staggerChildren: gap, delayChildren: 0.05 } }),
};

const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

/** Conteneur : ses `StaggerItem` apparaissent l'un après l'autre. */
export function Stagger({ children, className, gap = 0.09 }: { children: ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div className={className} variants={container} custom={gap} initial="hidden" whileInView="show" viewport={VIEWPORT_ONCE}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}
