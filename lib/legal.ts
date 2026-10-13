/**
 * Version des CGU et de la politique de confidentialité acceptées à l'inscription.
 * À changer à chaque modification de fond de ces textes : la date est enregistrée sur le compte
 * (users.terms_version) pour savoir quelle version chacun a acceptée.
 */
export const TERMS_VERSION = '2026-10-12';

/** Date affichée « Dernière mise à jour » sur les pages légales. */
export const LEGAL_UPDATED_AT = '12 octobre 2026';

/**
 * Informations de l'éditeur, affichées dans les mentions légales et la politique de confidentialité.
 * « (en mode dev) » : à remplacer avant la mise en production (raison sociale, RCCM, hébergeur…).
 */
export const COMPANY = {
  name: 'Fid’s (en mode dev)',
  legalForm: '(en mode dev)',
  rccm: '(en mode dev)',
  taxId: '(en mode dev)',
  address: '(en mode dev), Abidjan, Côte d’Ivoire',
  phone: '(en mode dev)',
  email: 'fids.dev2@gmail.com',
  privacyEmail: 'fids.dev2@gmail.com',
  director: '(en mode dev)',
  /** Numéro WhatsApp du support (laisser « (en mode dev) » tant qu'il n'est pas ouvert). */
  whatsapp: '(en mode dev)',
  /** Délai de réponse annoncé sur la page Contact. */
  responseTime: '48 heures ouvrées',
  host: {
    name: 'Systalink (en mode dev)',
    address: '(en mode dev)',
    contact: '(en mode dev)',
  },
} as const;

/** Pages légales, dans l'ordre du pied de page. */
export const LEGAL_LINKS = [
  { href: '/cgu', label: 'Conditions d’utilisation' },
  { href: '/cf', label: 'Conditions financières' },
  { href: '/confidentialite', label: 'Confidentialité' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/litiges', label: 'Règlement des litiges' },
  { href: '/regles', label: 'Règles d’utilisation' },
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
] as const;
