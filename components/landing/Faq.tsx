'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { EASE } from '@/components/motion/easing';
import { FAQ } from './data';
import { SectionHeading } from './SectionHeading';

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-titre" className="border-t border-f-line bg-f-surface py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading id="faq-titre" eyebrow="FAQ" title="Questions fréquentes">
          Tout ce qu’il faut savoir pour démarrer sereinement.
        </SectionHeading>

        <Stagger className="mt-12 space-y-3" gap={0.07}>
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <StaggerItem key={item.q}>
                <div className={`rounded-[22px] border bg-f-card transition-[border-color,box-shadow] duration-300 ${isOpen ? 'border-[var(--color-accent-300)] shadow-f-soft' : 'border-f-line'}`}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 rounded-[22px] px-6 py-5 text-left font-sans text-[16.5px] font-semibold"
                    >
                      {item.q}
                      <motion.span
                        aria-hidden
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`grid size-8 shrink-0 place-items-center rounded-full text-[20px] leading-none ${isOpen ? 'bg-[#C84A00] text-white' : 'bg-f-surface'}`}
                      >
                        +
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-a-${i}`}
                        role="region"
                        aria-labelledby={`faq-q-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-[15.5px] leading-relaxed text-f-muted">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
