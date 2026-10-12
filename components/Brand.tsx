import type { SVGProps } from 'react';
import { BRAND } from '@/features/page-client/lib/brand';

/*
 * Identité visuelle Fid’s : symbole « La Serrure partagée » et mot-symbole officiel.
 * Tracés repris tels quels des fichiers de la charte (Fids-Identite-Visuelle/01_Logo et 02_Symbole),
 * dessinés en ligne pour suivre le thème clair / sombre.
 *
 * Règle des deux camps : la moitié gauche (dev) prend la couleur la plus sombre du contexte,
 * la moitié droite (client) l'orange. Sur fond orange, l'orange disparaît : encre + crème.
 * Jamais de dégradé, d'ombre ni de contour sur le logo.
 */

/**
 * - `auto` : moitié dev et lettres en `currentColor` (encre en clair, crème en sombre), le reste en orange.
 * - `on-orange` : encre + crème, pour un fond orange plein.
 * - `on-dark` : crème + orange, pour un fond encre / nuit quel que soit le thème.
 * - `mono` : tout en `currentColor`.
 */
export type BrandTone = 'auto' | 'on-orange' | 'on-dark' | 'mono';

const ORANGE = '#FF6A00';
const INK = '#1C130C';
const CREAM = '#FFF8F1';

function colors(tone: BrandTone) {
  switch (tone) {
    case 'on-orange':
      return { dev: INK, client: CREAM, letters: CREAM, keyhole: INK };
    case 'on-dark':
      return { dev: CREAM, client: ORANGE, letters: CREAM, keyhole: ORANGE };
    case 'mono':
      return { dev: 'currentColor', client: 'currentColor', letters: 'currentColor', keyhole: 'currentColor' };
    default:
      return { dev: 'currentColor', client: ORANGE, letters: 'currentColor', keyhole: ORANGE };
  }
}

/** Symbole complet (≥ 32 px) et version « petites tailles » (sans fente, trou élargi). */
const SYMBOL = {
  full: {
    dev: 'M8.5,6 H30.5 V17.62 A9.5 9.5 0 0 0 27.23,35.22 L24.5,58 H8.5 Q6,58 6,55.5 V8.5 Q6,6 8.5,6 Z',
    client: 'M33.5,6 H42 A16 16 0 0 1 58,22 V42 A16 16 0 0 1 42,58 H39.5 L36.77,35.22 A9.5 9.5 0 0 0 33.5,17.62 Z',
  },
  small: {
    dev: 'M9,6 H32 V15 A11 11 0 0 0 26.12,35.3 L23.5,58 H9 Q6,58 6,55 V9 Q6,6 9,6 Z',
    client: 'M32,6 H43 A15 15 0 0 1 58,21 V43 A15 15 0 0 1 43,58 H40.5 L37.88,35.3 A11 11 0 0 0 32,15 Z',
  },
};

/** Lettres « F », « i », « d », « s » du mot-symbole (Caprasimo retravaillé) et apostrophe-serrure. */
const LETTERS = [
  { x: -93, d: 'M93 -1275Q93 -1332 127.0 -1358.0Q161 -1384 214 -1384H863Q892 -1384 920.0 -1386.5Q948 -1389 976 -1396Q1005 -1403 1034.0 -1410.0Q1063 -1417 1094 -1417Q1151 -1417 1179.5 -1396.0Q1208 -1375 1223.5 -1339.5Q1239 -1304 1255 -1259L1256 -1257V-1256Q1258 -1254 1259.5 -1247.5Q1261 -1241 1262 -1238Q1273 -1207 1287.5 -1163.5Q1302 -1120 1313.5 -1076.5Q1325 -1033 1325 -1001Q1325 -955 1286.5 -931.0Q1248 -907 1207 -907Q1164 -907 1142.0 -928.0Q1120 -949 1101 -984Q1067 -1048 1042.0 -1086.5Q1017 -1125 977.5 -1143.0Q938 -1161 858 -1161H728V-743H833Q885 -743 904.5 -767.0Q924 -791 933.5 -822.5Q943 -854 962.0 -878.0Q981 -902 1032 -902Q1111 -902 1132 -819L1193 -565Q1195 -555 1197.0 -543.5Q1199 -532 1199 -521Q1199 -478 1169.0 -450.5Q1139 -423 1096 -423Q1065 -423 1045.5 -438.0Q1026 -453 1006 -475Q977 -509 957.5 -522.5Q938 -536 914.5 -539.0Q891 -542 847 -542H728V-328Q728 -279 754.0 -258.5Q780 -238 813.5 -226.0Q847 -214 873.0 -190.0Q899 -166 899 -109Q899 -52 866.0 -26.0Q833 0 779 0H214Q161 0 127.0 -26.0Q93 -52 93 -109Q93 -159 114.5 -184.5Q136 -210 164.5 -226.5Q193 -243 214.5 -264.0Q236 -285 236 -327V-1057Q236 -1099 214.5 -1120.5Q193 -1142 164.5 -1158.0Q136 -1174 114.5 -1199.0Q93 -1224 93 -1275Z' },
  { x: 1191, d: 'M514 -1056Q555 -1056 577.5 -1028.0Q600 -1000 600 -961V-301Q600 -273 602.5 -244.5Q605 -216 625 -195Q651 -167 668.5 -151.0Q686 -135 686 -91Q686 -47 658.5 -23.5Q631 0 588 0H163Q120 0 92.5 -23.0Q65 -46 65 -91Q65 -134 82.0 -151.5Q99 -169 126 -195Q146 -215 148.5 -245.0Q151 -275 151 -301V-650Q151 -670 148.0 -691.5Q145 -713 131 -728Q127 -733 121.5 -736.0Q116 -739 112 -743Q90 -766 71.5 -780.5Q53 -795 53 -832Q53 -872 78.0 -894.0Q103 -916 137 -929L353 -1016Q391 -1031 432.0 -1043.5Q473 -1056 514 -1056ZM364 -1060Q300 -1060 235.0 -1079.0Q170 -1098 126.5 -1142.5Q83 -1187 83 -1263Q83 -1339 127.0 -1382.5Q171 -1426 236.0 -1444.0Q301 -1462 364 -1462Q427 -1462 492.5 -1444.0Q558 -1426 602.5 -1382.5Q647 -1339 647 -1263Q647 -1186 603.0 -1141.5Q559 -1097 493.5 -1078.5Q428 -1060 364 -1060Z' },
  { x: 1891, d: 'M57 -479Q57 -631 116.0 -762.5Q175 -894 288.0 -975.0Q401 -1056 564 -1056Q662 -1056 743 -1014V-1099Q743 -1143 728.5 -1165.0Q714 -1187 695.5 -1200.5Q677 -1214 662.5 -1230.5Q648 -1247 648 -1280Q648 -1321 672.5 -1342.5Q697 -1364 731 -1377L948 -1464Q986 -1480 1026.0 -1492.0Q1066 -1504 1108 -1504Q1149 -1504 1170.5 -1475.5Q1192 -1447 1192 -1409V-294Q1192 -245 1199.0 -226.0Q1206 -207 1240 -171Q1260 -150 1268.0 -135.5Q1276 -121 1276 -91Q1276 -48 1248.0 -24.0Q1220 0 1178 0H954Q898 0 846.5 -34.5Q795 -69 774 -122Q713 -56 635.5 -13.5Q558 29 462 29Q360 29 283.5 -15.5Q207 -60 157.0 -134.5Q107 -209 82.0 -299.0Q57 -389 57 -479ZM521 -529Q521 -493 526.5 -442.5Q532 -392 547.5 -343.5Q563 -295 593.5 -262.5Q624 -230 673 -230Q711 -230 743 -256V-790Q726 -807 705.0 -817.5Q684 -828 659 -828Q613 -828 585.5 -794.5Q558 -761 544.0 -711.5Q530 -662 525.5 -612.0Q521 -562 521 -529Z' },
  { x: 3549, d: 'M510 -885Q476 -885 449.0 -870.0Q422 -855 422 -816Q422 -784 437.0 -767.0Q452 -750 480 -738Q510 -725 543.0 -719.0Q576 -713 607 -706Q699 -686 779.0 -638.5Q859 -591 908.5 -516.5Q958 -442 958 -340Q958 -203 896.0 -122.0Q834 -41 731.5 -6.0Q629 29 507 29Q476 29 421.5 21.0Q367 13 341 -1H340Q330 -6 307.0 -12.0Q284 -18 273 -18Q242 -18 220.0 6.5Q198 31 166 31Q123 31 98.5 3.0Q74 -25 61.5 -63.5Q49 -102 39 -135Q32 -163 23.0 -190.5Q14 -218 14 -247Q14 -299 42.0 -331.0Q70 -363 123 -363Q175 -363 209.0 -340.5Q243 -318 269.5 -285.0Q296 -252 323.5 -218.5Q351 -185 390.0 -162.5Q429 -140 488 -140Q529 -140 550.0 -164.5Q571 -189 571 -228Q571 -284 541.0 -300.0Q511 -316 464 -325Q378 -342 300.5 -365.0Q223 -388 163.5 -428.0Q104 -468 69.5 -534.0Q35 -600 35 -704Q35 -827 102.0 -904.5Q169 -982 272.5 -1019.0Q376 -1056 483 -1056Q524 -1056 563.5 -1053.0Q603 -1050 642 -1037Q647 -1036 665.5 -1029.0Q684 -1022 702.0 -1015.5Q720 -1009 720 -1009Q753 -1009 776.5 -1032.5Q800 -1056 833 -1056Q875 -1056 895.0 -1023.5Q915 -991 923.5 -948.0Q932 -905 937 -875Q941 -852 945.0 -828.5Q949 -805 949 -782Q949 -742 930.5 -706.5Q912 -671 865 -671Q818 -671 782.0 -703.5Q746 -736 710.0 -778.0Q674 -820 627.0 -852.5Q580 -885 510 -885Z' },
];
const KEYHOLE = 'M3173,-1330 a140,140 0 1 1 280,0 a140,140 0 1 1 -280,0 Z M3247,-1290 H3379 L3421,-890 H3205 Z';

type SvgProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

/** Symbole seul. Sous 32 px, la version « petites tailles » est utilisée automatiquement. */
export function BrandSymbol({ size = 32, tone = 'auto', ...props }: { size?: number; tone?: BrandTone } & SvgProps) {
  const c = colors(tone);
  const s = size < 32 ? SYMBOL.small : SYMBOL.full;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false" {...props}>
      <path d={s.dev} fill={c.dev} />
      <path d={s.client} fill={c.client} />
    </svg>
  );
}

function Letters({ tone }: { tone: BrandTone }) {
  const c = colors(tone);
  return (
    <>
      {LETTERS.map(l => (
        <path key={l.x} transform={`translate(${l.x} 0)`} d={l.d} fill={c.letters} />
      ))}
      <path d={KEYHOLE} fill={c.keyhole} />
    </>
  );
}

/**
 * Logo horizontal (symbole + mot-symbole), proportions du fichier fids-logo-horizontal.
 * `height` = hauteur du symbole en px. Taille minimale de la charte : 96 px de large (height ≈ 24).
 */
export function BrandLogo({ height = 28, tone = 'auto', title = BRAND, ...props }: { height?: number; tone?: BrandTone; title?: string } & SvgProps) {
  const c = colors(tone);
  const s = height < 32 ? SYMBOL.small : SYMBOL.full;
  return (
    <svg
      height={height}
      width={(height * 6527) / 1640}
      viewBox="0 -1530 6527 1640"
      role="img"
      aria-label={title}
      focusable="false"
      {...props}
    >
      <g transform="translate(-189.23 -1719.23) scale(31.54)">
        <path d={s.dev} fill={c.dev} />
        <path d={s.client} fill={c.client} />
      </g>
      <g transform="translate(2020 0)">
        <Letters tone={tone} />
      </g>
    </svg>
  );
}

/** Mot-symbole seul, quand le symbole est déjà présent à côté. `height` = hauteur des capitales en px. */
export function BrandWordmark({ height = 20, tone = 'auto', title = BRAND, ...props }: { height?: number; tone?: BrandTone; title?: string } & SvgProps) {
  return (
    <svg
      height={height}
      width={(height * 4507) / 1570}
      viewBox="0 -1530 4507 1570"
      role="img"
      aria-label={title}
      focusable="false"
      {...props}
    >
      <Letters tone={tone} />
    </svg>
  );
}
