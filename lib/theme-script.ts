/** Clé du thème choisi dans le localStorage. */
export const THEME_KEY = 'fids_theme';

/**
 * Exécuté dans <head> avant l'affichage : pose data-theme tout de suite (pas de flash clair → sombre).
 * Ordre : choix enregistré, ancien choix (état simulé « recette »), sinon préférence du système.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='dark'&&t!=='light'){var s=JSON.parse(localStorage.getItem('recette_app_state_v2')||'null');t=s&&s.theme;}if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
