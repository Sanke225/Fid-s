import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';
import { PREVIEW_HOST } from '@/lib/spaces';

// Zones réservées : sans cookie de session, retour à la connexion.
// « /dev/:path+ » et non « /dev » : /dev seul est la liste des scénarios simulés de la page client.
const PROTECTED = /^\/(dev\/.+|client\/.+|admin(\/.*)?)$/;

/**
 * Premier filtre, sans base de données.
 * 1. Hôte d'aperçu (apercu.<domaine des démos>) : il ne sert QUE la page d'aperçu et son API (dossier apercu-hote).
 * 2. Ailleurs : sans cookie de session, retour à la connexion pour les zones réservées. Le contrôle réel
 *    (session valide + bon rôle) se fait dans les layouts (requirePageRole) et dans chaque route d'API.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0];
  const { pathname } = request.nextUrl;

  if (host === PREVIEW_HOST) {
    // Fichiers de Next.js (scripts, styles) : servis tels quels.
    if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') return NextResponse.next();
    const m = pathname.match(/^\/(t\/[\w.-]+|api\/[\w/-]+|[0-9a-f-]{36})$/);
    if (!m) return new NextResponse('Introuvable', { status: 404 });
    return NextResponse.rewrite(new URL(`/apercu-hote/${m[1]}`, request.url));
  }

  // Les routes de l'hôte d'aperçu n'existent pas sur Fid’s.
  if (pathname.startsWith('/apercu-hote')) return new NextResponse('Introuvable', { status: 404 });

  if (!PROTECTED.test(pathname) || getSessionCookie(request)) return NextResponse.next();

  const url = new URL('/connexion', request.url);
  url.searchParams.set('retour', pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // Toutes les pages (l'hôte d'aperçu se reconnaît à son nom), sauf les fichiers statiques de Next.js.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
