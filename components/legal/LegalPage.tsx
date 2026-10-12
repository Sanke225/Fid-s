import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/Brand';
import { ArrowLeftIcon } from '@/components/Icons';
import { LEGAL_LINKS, LEGAL_UPDATED_AT } from '@/lib/legal';
import { ThemeButton } from './ThemeButton';

export type LegalSection = { id: string; title: string; body: ReactNode };

/**
 * Mise en page commune des pages légales : en-tête, titre, date de mise à jour, sommaire,
 * articles numérotés et pied de page listant toutes les pages légales.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  summary,
  sections,
  updatedAt = LEGAL_UPDATED_AT,
  numbered = true,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** Encadré « En bref » sous le titre. */
  summary?: ReactNode;
  sections: LegalSection[];
  updatedAt?: string;
  /** « Article 1 · … » devant chaque titre (désactivé pour la FAQ ou le contact). */
  numbered?: boolean;
  /** Contenu ajouté après les sections (encadrés, liens). */
  children?: ReactNode;
}) {
  return (
    <div className="fd-ui flex min-h-dvh flex-col bg-f-bg text-f-text">
      <header className="sticky top-0 z-30 border-b border-f-line bg-[var(--glass-strong)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" aria-label="Fid’s, accueil" className="rounded text-f-text">
            <BrandLogo height={30} />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-f-line bg-f-card px-3.5 py-1.5 text-[14px] text-f-muted transition-colors hover:text-f-text"
            >
              <ArrowLeftIcon size={14} /> Accueil
            </Link>
            <ThemeButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
          <article className="min-w-0">
            <p className="text-[12.5px] font-semibold uppercase tracking-[.12em] text-f-ink-accent">{eyebrow}</p>
            <h1 className="heading-sans mt-2 text-[clamp(30px,4.5vw,44px)] leading-[1.1]">{title}</h1>
            <p className="mt-3 text-[14.5px] text-f-muted">Dernière mise à jour : {updatedAt}</p>
            {intro ? <div className="legal-prose mt-6">{intro}</div> : null}
            {summary ? (
              <div className="mt-6 rounded-3xl border border-f-line bg-f-surface px-5 py-4 text-[15px] leading-relaxed">
                <p className="mb-1 font-semibold">En bref</p>
                {summary}
              </div>
            ) : null}

            <div className="mt-10 space-y-10">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-titre`} className="scroll-mt-24">
                  <h2 id={`${s.id}-titre`} className="heading-sans mb-3 text-[21px] leading-snug">
                    {numbered ? <span className="text-f-ink-accent">Article {i + 1} · </span> : null}
                    {s.title}
                  </h2>
                  <div className="legal-prose">{s.body}</div>
                </section>
              ))}
            </div>
            {children ? <div className="mt-12">{children}</div> : null}
          </article>

          {sections.length > 2 ? (
            <nav aria-label="Sur cette page" className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.12em] text-f-muted">Sur cette page</p>
                <ol className="space-y-2 border-l border-f-line text-[13.5px]">
                  {sections.map(s => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-3 text-f-muted hover:border-f-text hover:text-f-text">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>
          ) : null}
        </div>
      </main>

      <footer className="mt-auto border-t border-f-line">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <nav aria-label="Pages légales">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13.5px]">
              {LEGAL_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="rounded text-f-muted hover:text-f-text">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-5 text-[12.5px] text-f-muted">© 2026 Fid’s · Opéré par Systalink</p>
        </div>
      </footer>
    </div>
  );
}

/** Ligne « libellé : valeur » des mentions légales et des tableaux de données. */
export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-f-line py-3 last:border-0 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-[13.5px] font-semibold text-f-muted">{label}</dt>
      <dd className="text-[15px]">{children}</dd>
    </div>
  );
}
