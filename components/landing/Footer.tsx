import Link from 'next/link';
import { BrandLogo } from '@/components/Brand';
import { LEGAL_LINKS } from '@/lib/legal';
import { BRAND, NAV_LINKS } from './data';

export function Footer() {
  return (
    <footer className="border-t border-f-line bg-f-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-f-text">
            <BrandLogo height={32} />
          </div>
          <p className="mt-2 text-[13.5px] text-f-muted">Opéré par Systalink · Coupe d’Afrique des Développeurs 2026</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:gap-14">
          <nav aria-label="Navigation">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.12em] text-f-muted">Produit</p>
            <ul className="space-y-2 text-[14px]">
              {NAV_LINKS.map(l => (
                <li key={l.href}>
                  <a href={l.href} className="nav-link rounded text-f-muted hover:text-f-text">{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Informations légales">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.12em] text-f-muted">Légal et aide</p>
            <ul className="grid grid-cols-1 gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {LEGAL_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="nav-link rounded text-f-muted hover:text-f-text">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-f-line py-5 text-center text-[12.5px] text-f-muted">© 2026 {BRAND} · Tous droits réservés</div>
    </footer>
  );
}
