import { BRAND } from '@/features/page-client/lib/brand';

/** Contenu de la landing : un seul endroit pour les textes et le nom de marque. */
export { BRAND };

/** Domaine affiché dans les maquettes (démos *.demo., espaces clients *.app.). */
export const DOMAIN = 'fids.ci';

export const NAV_LINKS = [
  { href: '#fonctionnement', label: 'Fonctionnement' },
  { href: '#demo', label: 'Démo' },
  { href: '#securite', label: 'Sécurité' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#faq', label: 'FAQ' },
] as const;

export const STATS = [
  { to: 1248, label: 'projets livrés avec succès' },
  { to: 312, label: 'démos actives en ce moment' },
  { to: 486.7, decimals: 1, suffix: ' M', label: 'FCFA réglés sans litige' },
  { to: 60, prefix: '< ', suffix: ' s', label: 'délai moyen de passation' },
] as const;

export const MARQUEE = [
  { label: 'Wave', dot: '#1DA1F2' },
  { label: 'Orange Money', dot: '#FF6600' },
  { label: 'Moov Money', dot: '#0057B8' },
  { label: 'MTN MoMo', dot: '#FFCB05' },
  { label: 'Conteneurs isolés', dot: 'var(--color-accent)' },
  { label: 'PostgreSQL dédié', dot: '#336791' },
  { label: 'Chiffrement AES-256-GCM', dot: 'var(--success)' },
  { label: 'Sauvegardes nocturnes', dot: 'var(--amber)' },
  { label: 'Passation < 60 s', dot: 'var(--coral)' },
] as const;

export const STEPS = [
  {
    title: 'Envoi',
    text: 'Le dev dépose son code (.zip chiffré) et fixe le montant de la livraison.',
  },
  {
    title: 'Démo isolée',
    text: `${BRAND} installe l’appli dans un conteneur isolé et génère un lien de livraison privé.`,
  },
  {
    title: 'Essai réel',
    text: 'Le client ouvre le lien sur son téléphone et teste pour de vrai, sans rien installer.',
  },
  {
    title: 'Paiement direct',
    text: 'Le client paie le dev par Mobile Money et saisit la référence. Le dev confirme le dépôt.',
  },
  {
    title: 'Passation',
    text: `Le client règle les frais ${BRAND} (5 %) : l’appli passe à son nom, sur sa propre adresse web, avec sa base et ses accès.`,
  },
] as const;

/** Démo de 3 minutes : pas de notification d'opérateur, c'est le dev qui confirme le dépôt. */
export const DEMO_STEPS = [
  { text: 'Le client paie 100 FCFA par Wave et saisit la référence…', pct: 20 },
  { text: 'Le développeur voit le dépôt et clique « Dépôt confirmé »…', pct: 45 },
  { text: `Le client règle les frais ${BRAND} (5 %)…`, pct: 60 },
  { text: 'Frais confirmés : la livraison est débloquée…', pct: 72 },
  { text: `Création de l’espace tantie.app.${DOMAIN}…`, pct: 82 },
  { text: 'Base PostgreSQL créée, migrations appliquées…', pct: 94 },
  { text: 'Passation terminée !', pct: 100 },
] as const;

export const SECURITY = [
  {
    title: 'Conteneurs isolés',
    text: 'Chaque démo tourne dans un conteneur sans privilège, système en lecture seule, /tmp en mémoire de 64 Mo, réseau privé et base Postgres dédiée.',
  },
  {
    title: 'Code chiffré au repos',
    text: 'L’archive du développeur est chiffrée en AES-256-GCM. Le code en clair n’est jamais stocké durablement avant le paiement.',
  },
  {
    title: 'Sauvegardes automatiques',
    text: 'Sauvegarde chiffrée dès l’ouverture de l’espace client, puis copie nocturne avec restauration testée et rétention de 7 jours.',
  },
] as const;

export const FAQ = [
  {
    q: 'Le client peut-il copier ce qu’il voit ?',
    a: 'Non. La démo ne montre que la façade, exécutée dans notre conteneur isolé. Le code source, la base PostgreSQL et les mots de passe d’administration restent chiffrés jusqu’au paiement.',
  },
  {
    q: 'Qui reçoit l’argent ?',
    a: `Le développeur reçoit 100 % du montant convenu, directement sur son compte Mobile Money. ${BRAND} ne détient jamais cet argent : nous gardons l’application, pas l’argent.`,
  },
  {
    q: `Combien coûte ${BRAND} ?`,
    a: `0 % pour le développeur. Le client règle 5 % de frais de service à ${BRAND} au moment de recevoir son application (100 FCFA minimum). Pas d’abonnement.`,
  },
  {
    q: 'Comment la livraison est-elle débloquée ?',
    a: `Le client paie le dev et saisit la référence ; le dev confirme le dépôt. Le client règle ensuite les frais ${BRAND} (5 %) : dès leur confirmation, l’application passe à son nom. Jusque-là, la démo reste consultable.`,
  },
  {
    q: 'Et si le dev dit n’avoir rien reçu ?',
    a: 'Le client ouvre un ticket avec ses preuves de paiement. Le dev est relancé pour répondre ; à défaut, l’administration peut libérer la livraison. Chaque action est journalisée.',
  },
  {
    q: 'Que se passe-t-il si le client ne paie pas ?',
    a: 'La démo reste active 30 jours avec des rappels. Sans paiement, elle est supprimée avec le code déposé. Le dev garde son travail, le client ne garde rien.',
  },
  {
    q: 'Quels moyens de paiement ?',
    a: 'Wave, Orange Money, Moov Money et MTN MoMo, en Afrique de l’Ouest. Le dev enregistre ses numéros, le client choisit celui qui lui convient.',
  },
] as const;
