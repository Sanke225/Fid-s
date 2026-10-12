'use client';

import type { PointerEvent, ReactNode } from 'react';

/**
 * Carte avec halo qui suit le curseur et bordure dégradée qui tourne au survol.
 * Les positions passent par des variables CSS : aucun rendu React pendant le mouvement.
 */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <div className={`fx-card ${className ?? ''}`} onPointerMove={onMove}>
      {children}
    </div>
  );
}
