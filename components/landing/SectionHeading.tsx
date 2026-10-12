import type { ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';

/** Sur-titre + titre + chapeau, communs à toutes les sections. */
export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'center',
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: 'center' | 'left';
  id?: string;
}) {
  const center = align === 'center';
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <span className="text-[12.5px] font-bold uppercase tracking-[.14em] text-f-ink-accent">{eyebrow}</span>
      <h2 id={id} className="mt-3 font-display text-[clamp(2rem,4.4vw,3.3rem)] leading-[1.06] tracking-[-0.02em]">
        {title}
      </h2>
      {children ? <p className="mt-4 text-[17px] leading-relaxed text-f-muted">{children}</p> : null}
    </Reveal>
  );
}
