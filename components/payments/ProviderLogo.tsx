import type { PaymentProvider } from '@/lib/contracts';

/** Nom affiché de chaque opérateur Mobile Money. */
export const PROVIDER_NAME: Record<PaymentProvider, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  moov_money: 'Moov Money',
  mtn_momo: 'MTN MoMo',
};

/** Ordre d'affichage des opérateurs. */
export const PROVIDERS: PaymentProvider[] = ['wave', 'orange_money', 'moov_money', 'mtn_momo'];

/**
 * Pastille de l'opérateur, dessinée d'après ses codes visuels (couleur et nom).
 * Pour utiliser les logos officiels : déposer les fichiers dans public/logos/ et remplacer le rendu ici,
 * c'est le seul endroit à changer.
 */
export function ProviderLogo({ provider, size = 40, className = '' }: { provider: PaymentProvider; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: '0 0 48 48', role: 'img', 'aria-label': PROVIDER_NAME[provider], className } as const;
  const font = { fontFamily: 'Arial Black, Arial, Helvetica, sans-serif', fontWeight: 900 } as const;

  switch (provider) {
    case 'wave':
      return (
        <svg {...common}>
          <rect width="48" height="48" rx="12" fill="#1DC4FF" />
          <path d="M8 26c3.5-6 7.5-6 11 0s7.5 6 11 0 7.5-6 10 0" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" />
          <text x="24" y="40.5" textAnchor="middle" fill="#fff" fontSize="9.5" style={font}>wave</text>
        </svg>
      );
    case 'orange_money':
      return (
        <svg {...common}>
          <rect width="48" height="48" rx="6" fill="#FF7900" />
          <rect x="6" y="30" width="20" height="3.2" fill="#fff" />
          <text x="6" y="41" fill="#fff" fontSize="8.4" style={font}>orange</text>
          <text x="6" y="16" fill="#000" fillOpacity=".85" fontSize="8" style={font}>money</text>
        </svg>
      );
    case 'moov_money':
      return (
        <svg {...common}>
          <rect width="48" height="48" rx="12" fill="#0057B8" />
          <text x="24" y="28" textAnchor="middle" fill="#fff" fontSize="13" style={font}>moov</text>
          <rect x="12" y="32" width="24" height="3.5" rx="1.75" fill="#F7941D" />
        </svg>
      );
    case 'mtn_momo':
      return (
        <svg {...common}>
          <rect width="48" height="48" rx="12" fill="#FFCB05" />
          <ellipse cx="24" cy="22" rx="17" ry="10.5" fill="none" stroke="#000" strokeWidth="2.6" />
          <text x="24" y="26.5" textAnchor="middle" fill="#000" fontSize="11" style={font}>MTN</text>
          <text x="24" y="42" textAnchor="middle" fill="#000" fontSize="7.5" style={font}>MoMo</text>
        </svg>
      );
  }
}
