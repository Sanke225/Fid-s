import Link from 'next/link';
import { BrandLogo } from '@/components/Brand';
import { BRAND, NAV_LINKS } from './data';

export function Footer() {
  return (
    <footer className="border-t border-f-line bg-f-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-f-text">
            <BrandLogo height={32} />
          </div>
          <p className="mt-2 text-[13.5px] text-f-muted">Opéré par Systalink · Coupe d’Afrique des Développeurs 2026</p>
        </div>
        <nav aria-label="Pied de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            {NAV_LINKS.map(l => (
              <li key={l.href}>
                <a href={l.href} className="nav-link rounded text-f-muted hover:text-f-text">{l.label}</a>
              </li>
            ))}
            <li><Link href="/cgu" className="nav-link rounded text-f-muted hover:text-f-text">CGU</Link></li>
            <li><Link href="/cf" className="nav-link rounded text-f-muted hover:text-f-text">CF</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-f-line py-5 text-center text-[12.5px] text-f-muted">© 2026 {BRAND} · Tous droits réservés</div>
    </footer>
  );
}
