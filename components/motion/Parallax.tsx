'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useFinePointer } from './useMedia';

/**
 * Décale son contenu pendant le scroll. `speed` > 0 monte plus vite que la page,
 * < 0 traîne derrière. Coupé au tactile et en mouvement réduit.
 */
export function Parallax({ children, speed = 0.2, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 120, speed * -120]);
  const enabled = fine && !reduced;

  return (
    <motion.div ref={ref} className={className} style={enabled ? { y } : undefined}>
      {children}
    </motion.div>
  );
}
