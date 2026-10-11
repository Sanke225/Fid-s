'use client';

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import QRCode from 'react-qr-code';
import { CheckIcon, LockIcon, OrangeMoneyIcon, UnlockIcon, WaveIcon } from '@/components/Icons';
import { Parallax } from '@/components/motion/Parallax';
import { EASE } from '@/components/motion/easing';
import { useFinePointer } from '@/components/motion/useMedia';
import { BRAND, DOMAIN } from './data';

const SCREENS = ['qr', 'pay', 'confirmed', 'unlocked'] as const;
const DURATIONS = [3000, 3200, 2600, 3800];
const LABELS = ['Scan', 'Paiement', 'Confirmé', 'Débloqué'];

/**
 * Téléphone en 3D : incliné, il suit le curseur (±8°) et rejoue le parcours client
 * QR → paiement Wave → dépôt confirmé → appli débloquée.
 */
export function PhoneScene() {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [screen, setScreen] = useState(0);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 90, damping: 18, mass: 0.7 };
  const rotateY = useSpring(useTransform(mx, [-1, 1], [-8, 8]), spring);
  const rotateX = useSpring(useTransform(my, [-1, 1], [8, -8]), spring);

  useEffect(() => {
    if (!fine || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine, reduced, mx, my]);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setScreen(s => (s + 1) % SCREENS.length), DURATIONS[screen]);
    return () => clearTimeout(t);
  }, [screen, inView]);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Aperçu animé du parcours ${BRAND} : le client scanne le QR code, paie par Wave, le développeur confirme le dépôt, l’application est débloquée.`}
      className="relative mx-auto w-full max-w-[440px] [perspective:1400px]"
    >
      {/* Ombre portée au sol */}
      <div aria-hidden className="absolute inset-x-10 -bottom-6 h-16 rounded-[50%] bg-black/25 blur-2xl dark:bg-black/60" />

      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
        <div aria-hidden style={{ transform: 'rotateY(-13deg) rotateX(7deg) rotateZ(1.5deg)', transformStyle: 'preserve-3d' }} className="relative">
          {/* Carte flottante gauche, en avant du téléphone */}
          <div className="absolute -left-4 top-14 z-20 hidden sm:block lg:-left-14" style={{ transform: 'translateZ(90px)' }}>
            <Parallax speed={0.35}>
              <FloatCard delay="0s">
                <WaveIcon size={26} />
                <div>
                  <strong className="block text-[13px] leading-tight">Paiement direct</strong>
                  <span className="text-[11.5px] text-f-muted">au numéro du développeur</span>
                </div>
              </FloatCard>
            </Parallax>
          </div>

          {/* Carte flottante droite */}
          <div className="absolute -right-2 bottom-8 z-20 hidden sm:block lg:-right-12" style={{ transform: 'translateZ(130px)' }}>
            <Parallax speed={0.6}>
              <FloatCard delay="-2.4s">
                <OrangeMoneyIcon size={26} />
                <div>
                  <strong className="block text-[13px] leading-tight">Dépôt confirmé</strong>
                  <span className="flex items-center gap-1 text-[11.5px] font-semibold text-f-success-ink">Accès débloqué <CheckIcon size={12} /></span>
                </div>
              </FloatCard>
            </Parallax>
          </div>

          {/* Châssis : tranche simulée par deux couches décalées */}
          <div className="relative mx-auto w-[min(78vw,300px)]" style={{ transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0 translate-x-[6px] translate-y-[4px] rounded-[46px] bg-[#3b2a1f] dark:bg-[#1a1a1f]" style={{ transform: 'translateZ(-14px)' }} />
            <div className="relative rounded-[46px] bg-[var(--device)] p-[11px] shadow-[0_40px_80px_-20px_rgba(92,40,4,.45),inset_0_0_0_1.5px_rgba(255,255,255,.12)]">
              <div className="relative aspect-[9/19.2] overflow-hidden rounded-[36px] bg-f-bg">
                <div className="absolute left-1/2 top-2 z-30 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
                <AnimatePresence initial={false}>
                  <motion.div
                    key={SCREENS[screen]}
                    className="absolute inset-0"
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -18, scale: 0.98 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  >
                    {SCREENS[screen] === 'qr' && <QrScreen />}
                    {SCREENS[screen] === 'pay' && <PayScreen />}
                    {SCREENS[screen] === 'confirmed' && <ConfirmedScreen />}
                    {SCREENS[screen] === 'unlocked' && <UnlockedScreen />}
                  </motion.div>
                </AnimatePresence>
                {/* Reflet du verre */}
                <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(115deg,rgba(255,255,255,.22)_0%,transparent_32%,transparent_70%,rgba(255,255,255,.06)_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Étapes de la boucle */}
      <div aria-hidden className="mt-10 flex justify-center gap-2">
        {LABELS.map((l, i) => (
          <span
            key={l}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors duration-500 ${
              i === screen ? 'bg-f-text text-f-bg' : 'bg-f-glass text-f-muted'
            }`}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function FloatCard({ children, delay }: { children: ReactNode; delay: string }) {
  return (
    <div
      className="fd-float flex items-center gap-3 rounded-2xl border border-f-glass-line bg-f-glass px-4 py-3 text-f-text shadow-f-float backdrop-blur-xl"
      style={{ animationDelay: delay }}
    >
      {children}
    </div>
  );
}

function ScreenHeader({ eyebrow, title, host }: { eyebrow: string; title: string; host: string }) {
  return (
    <div className="border-b border-f-line bg-f-surface px-4 pb-3 pt-9 text-center">
      <span className="text-[9.5px] font-bold uppercase tracking-[.08em] text-f-ink-accent">{eyebrow}</span>
      <div className="mt-0.5 text-[14px] font-bold">{title}</div>
      <div className="text-[10.5px] text-f-muted">{host}</div>
    </div>
  );
}

function QrScreen() {
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader eyebrow="Livraison privée" title="Boutique Kanaga · Caisse" host={`d-kanaga26.demo.${DOMAIN}`} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          className="relative rounded-2xl bg-white p-3 shadow-f-soft"
        >
          <QRCode value={`https://${DOMAIN}/l/demo-kanaga`} size={132} fgColor="#1C130C" />
          <motion.span
            className="absolute inset-x-3 h-[2px] rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_2px_rgba(255,106,0,.6)]"
            initial={{ top: '12%' }}
            animate={{ top: ['12%', '88%', '12%'] }}
            transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
          />
        </motion.div>
        <p className="text-center text-[12px] text-f-muted">Scannez pour tester l’appli, puis payer le solde</p>
        <div className="w-full rounded-2xl border border-f-line bg-f-card p-3 text-center">
          <div className="text-[10.5px] text-f-muted">Solde de livraison</div>
          <div className="font-display text-[22px]">450 000 FCFA</div>
        </div>
      </div>
    </div>
  );
}

function PayScreen() {
  return (
    <div className="flex h-full flex-col bg-[#0E2A47] text-white">
      <div className="flex items-center gap-2 px-5 pb-3 pt-10">
        <WaveIcon size={26} />
        <span className="text-[14px] font-bold">Wave</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5">
        <div className="text-[11.5px] text-white/70">Envoyer à</div>
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[13px] font-semibold">Yannick K. · développeur</div>
          <div className="text-[11px] text-white/70">+225 07 •• •• 42</div>
        </div>
        <div className="mt-2 text-center font-display text-[30px] leading-none">450 000 F</div>
        <div className="text-center text-[11px] text-white/70">Réf. WV-8F3K-21</div>
        <div className="mt-auto pb-6">
          <div className="relative h-11 overflow-hidden rounded-full bg-[#1DA1F2] text-center text-[13px] font-bold leading-[44px]">
            <motion.span
              className="absolute inset-y-0 left-0 w-full origin-left bg-white/25"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
            />
            <span className="relative">Confirmer le paiement</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmedScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="relative grid size-24 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-[var(--success)]/15"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
        <svg viewBox="0 0 52 52" className="relative size-20">
          <motion.circle
            cx="26" cy="26" r="23" fill="none" stroke="var(--success)" strokeWidth="3"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
          />
          <motion.path
            d="M15 27l7 7 15-16" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.55 }}
          />
        </svg>
      </div>
      <div className="font-display text-[22px] leading-tight">Dépôt confirmé</div>
      <p className="text-[12px] text-f-muted">Le développeur a vu les 450 000 FCFA arriver sur son numéro.</p>
      <span className="rounded-full bg-f-surface px-3 py-1.5 text-[10.5px] font-semibold text-f-muted">
        {BRAND} ne touche jamais l’argent
      </span>
    </div>
  );
}

function UnlockedScreen() {
  const items = [
    { name: 'Robe Wax Étoile', price: '15 000 F', stock: 14 },
    { name: 'Chemise Lin Kente', price: '22 000 F', stock: 8 },
    { name: 'Sac Bogolan', price: '18 500 F', stock: 5 },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="bg-[linear-gradient(120deg,#A63E00,#FF6A00)] px-4 pb-4 pt-9 text-white">
        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[.08em]">
          <motion.span initial={{ rotate: -20, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
            <UnlockIcon size={13} />
          </motion.span>
          Application débloquée
        </div>
        <div className="mt-1 text-[15px] font-bold">Boutique Kanaga</div>
        <div className="text-[10.5px] text-white/85">kanaga.app.{DOMAIN}</div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        {items.map((it, i) => (
          <motion.div
            key={it.name}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.1 }}
            className="flex items-center justify-between rounded-xl border border-f-line bg-f-card p-2.5"
          >
            <div>
              <div className="text-[12px] font-bold">{it.name}</div>
              <div className="text-[10px] text-f-muted">Stock : {it.stock} unités</div>
            </div>
            <span className="text-[12px] font-bold text-f-ink-accent">{it.price}</span>
          </motion.div>
        ))}
        <div className="mt-auto flex items-center gap-2 rounded-xl bg-f-surface p-2.5 text-[10.5px] text-f-muted">
          <LockIcon size={13} /> Accès admin, base et sauvegarde au nom du client
          <CheckIcon size={13} className="ml-auto text-[var(--success)]" />
        </div>
      </div>
    </div>
  );
}
