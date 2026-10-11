import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Premier filtre, sans base de données : sans cookie de session, retour à la connexion.
 * Le contrôle réel (session valide + bon rôle) se fait dans les layouts (requirePageRole)
 * et dans chaque route d'API (requireUser / requireRole) : un cookie peut être expiré ou forgé.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const url = new URL('/connexion', request.url);
  url.searchParams.set('retour', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  // « /dev/:path+ » et non « /dev » : /dev seul est la liste des scénarios simulés de la page client.
  matcher: ['/dev/:path+', '/client/:path+', '/admin/:path*'],
};
