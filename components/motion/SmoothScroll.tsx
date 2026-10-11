'use client';

import Lenis from 'lenis';
import { MotionConfig } from 'motion/react';
import { useEffect, type ReactNode } from 'react';

/**
 * Scroll fluide (Lenis) + réglage global de Motion.
 * `reducedMotion="user"` : avec « réduire les animations », Motion ne garde que les fondus.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -88 } });
    return () => lenis.destroy();
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
