import Link from 'next/link';
import type { ReactNode } from 'react';
import type { DeliveryStatus } from '@/lib/contracts';
import { STATUS_UI, TONE_CLASS } from '@/lib/delivery-ui';

/** Conteneur des pages de l'espace dev (jetons et focus communs : .fd-ui). */
export function DevPage({ children }: { children: ReactNode }) {
  return <div className="fd-ui mx-auto w-full max-w-7xl px-4 py-8 text-f-text sm:px-8">{children}</div>;
}

export function PageHeader({ eyebrow, title, actions }: { eyebrow: string; title: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <span className="text-[12.5px] font-bold uppercase tracking-[.14em] text-f-ink-accent">{eyebrow}</span>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,3.6vw,2.7rem)] leading-[1.08]">{title}</h1>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: DeliveryStatus }) {
  const ui = STATUS_UI[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[ui.tone]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {ui.label}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[24px] border border-f-line bg-f-card shadow-f-soft ${className}`}>{children}</div>;
}

/** Bloc gris animé pendant le chargement. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-f-surface ${className}`} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="p-8 text-center">
      <p role="alert" className="text-[15px] text-[var(--danger-800)]">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="cta-ghost mt-4 rounded-full px-5 py-2.5 text-[14px]">
          Réessayer
        </button>
      ) : null}
    </Card>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: { href: string; label: string } }) {
  return (
    <Card className="px-6 py-14 text-center">
      <p className="font-display text-[24px]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">{text}</p>
      {action ? (
        <Link href={action.href} className="cta-primary mt-6 rounded-full px-6 py-3 text-[15px]">
          {action.label}
        </Link>
      ) : null}
    </Card>
  );
}
