// Compte créé par un dev sans e-mail : la base en exige un, on pose une adresse en .invalid (domaine réservé,
// jamais livrable). Elle n'est jamais affichée ; le client la remplace par la sienne depuis son profil.
export const PLACEHOLDER_EMAIL_DOMAIN = "clients.fids.invalid";

export const isPlaceholderEmail = (email: string) => email.endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
