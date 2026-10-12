'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CloseIcon } from '@/components/Icons';
import { EASE } from '@/components/motion/easing';

/**
 * Fenêtre modale accessible : titre relié, focus déplacé à l'ouverture et rendu à la fermeture,
 * Échap et clic sur le voile pour fermer, page derrière figée.
 */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  // Dernière version de onClose, lue par Échap sans faire dépendre l'effet de cette fonction :
  // le parent la recrée à chaque rendu (chaque frappe), ce qui relançait l'effet et déplaçait le focus.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Ne s'exécute qu'à l'ouverture et à la fermeture réelles de la fenêtre.
  useEffect(() => {
    if (!open) return;
    const returnTo = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus sur le premier élément interactif du contenu.
    const raf = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('input, button, select, textarea, a[href]')?.focus());
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      returnTo?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] grid place-items-end sm:place-items-center">
          <motion.div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fd-ui relative max-h-[92svh] w-full overflow-y-auto rounded-t-[28px] border border-f-line bg-f-card p-6 text-f-text shadow-f-float sm:max-w-lg sm:rounded-[28px] sm:p-8"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <h2 id={titleId} className="font-display text-[24px] leading-tight">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Fermer" className="grid size-9 shrink-0 place-items-center rounded-full text-f-muted hover:bg-f-surface hover:text-f-text">
                <CloseIcon size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
