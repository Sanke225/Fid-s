'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, type ReactNode } from 'react';
import { BrandSymbol } from '@/components/Brand';
import { useFinePointer } from '@/components/motion/useMedia';
import type { AccountRole } from './authApi';
import { BuildingIcon, CodeIcon } from './AuthIcons';

export type SignupStep = 'role' | 'infos' | 'done';

const EASE = [0.22, 1, 0.36, 1] as const;

// Repère 800 × 600 : le dev à gauche, Fid’s au sommet, le client à droite.
const NODES = {
  dev: { x: 170, y: 390 },
  fids: { x: 400, y: 190 },
  client: { x: 630, y: 390 },
};
const PATHS = {
  devToFids: 'M170 390 C 200 260, 290 190, 400 190',
  fidsToClient: 'M400 190 C 510 190, 600 260, 630 390',
  clientToDev: 'M630 390 C 560 540, 240 540, 170 390',
};

// Poussière d'ambiance : positions fixes (pas d'aléatoire au rendu).
const DUST = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 137.5) % 100,
  y: (i * 61.8 + 13) % 100,
  s: 2 + (i % 3),
  d: 6 + (i % 5) * 1.7,
  delay: -(i % 7) * 1.3,
}));

/**
 * Fond de l'inscription : le pacte à trois. Le rôle choisi s'allume et se relie à Fid’s,
 * puis le code circule vers le client, et enfin le paiement revient au dev.
 */
export function NetworkScene({ step, role, busy }: { step: SignupStep; role: AccountRole | null; busy?: boolean }) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const mx = useSpring(useMotionValue(0), { stiffness: 50, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 50, damping: 18 });

  useEffect(() => {
    if (!fine || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(((e.clientX / window.innerWidth) * 2 - 1) * 14);
      my.set(((e.clientY / window.innerHeight) * 2 - 1) * 10);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine, reduced, mx, my]);

  const after = step !== 'role';
  const done = step === 'done';
  const devLink = after || role === 'dev';
  const clientLink = after || role === 'client';
  const flow = !reduced;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-f-bg">
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-c" />
      {DUST.map((d, i) => (
        <span
          key={i}
          className="auth-dust absolute rounded-full"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, animationDuration: `${d.d}s`, animationDelay: `${d.delay}s` }}
        />
      ))}

      <motion.div
        style={{ x: mx, y: my }}
        className="absolute left-1/2 top-[17svh] w-[min(112vw,640px)] -translate-x-1/2 -translate-y-1/2 opacity-95 lg:left-[30%] lg:top-[40%] lg:w-[min(54vw,820px)] lg:opacity-100"
      >
        <svg viewBox="0 0 800 600" className="w-full overflow-visible">
          <defs>
            <linearGradient id="fd-link" x1="0" x2="1">
              <stop offset="0" stopColor="#FF6A00" />
              <stop offset="1" stopColor="#FFB547" />
            </linearGradient>
          </defs>

          {/* Rails en pointillé, toujours visibles */}
          {Object.values(PATHS).map(d => (
            <path key={d} d={d} fill="none" stroke="var(--color-divider)" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" />
          ))}

          {/* Liens qui se dessinent selon l'étape */}
          <LinkPath d={PATHS.devToFids} on={devLink} />
          <LinkPath d={PATHS.fidsToClient} on={clientLink} delay={role === 'client' && !after ? 0 : 0.25} />
          <LinkPath d={PATHS.clientToDev} on={done} color="var(--success)" delay={0.3} />

          {/* Paquets : le code vers Fid’s, la démo vers le client, le paiement vers le dev */}
          {flow && devLink ? <Packets d={PATHS.devToFids} fill="#FF6A00" dur={busy ? 1.1 : 2.4} /> : null}
          {flow && clientLink ? <Packets d={PATHS.fidsToClient} fill="#FFB547" dur={busy ? 1.1 : 2.4} offset={0.6} /> : null}
          {flow && done ? <Packets d={PATHS.clientToDev} fill="var(--success)" dur={2.2} /> : null}

          {/* Ondes autour de Fid’s */}
          {[0, 1, 2].map(i => (
            <motion.circle
              key={i}
              cx={NODES.fids.x}
              cy={NODES.fids.y}
              r="46"
              fill="none"
              stroke={done ? 'var(--success)' : 'var(--color-accent)'}
              strokeWidth="1.5"
              initial={false}
              animate={reduced ? { opacity: 0.2 } : { scale: done ? [1, 3.2] : [1, 2], opacity: [0.5, 0] }}
              transition={{ duration: done ? 1.8 : busy ? 1.2 : 3, repeat: Infinity, delay: i * (done ? 0.6 : 1), ease: 'easeOut' }}
              style={{ transformOrigin: `${NODES.fids.x}px ${NODES.fids.y}px`, transformBox: 'view-box' }}
            />
          ))}

          <Node {...NODES.dev} label="Développeur" active={role === 'dev' || after} done={done} float={reduced ? 0 : 7}>
            <CodeIcon size={30} />
          </Node>
          <Node {...NODES.fids} label="Fid’s" active done={done} big float={reduced ? 0 : 5}>
            <BrandSymbol size={34} style={{ color: 'var(--color-text)' }} />
          </Node>
          <Node {...NODES.client} label="Client" active={role === 'client' || after} done={done} float={reduced ? 0 : 8}>
            <BuildingIcon size={30} />
          </Node>
        </svg>
      </motion.div>
    </div>
  );
}

function LinkPath({ d, on, color = 'url(#fd-link)', delay = 0 }: { d: string; on: boolean; color?: string; delay?: number }) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      initial={false}
      animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
      transition={{ duration: 1.1, ease: EASE, delay: on ? delay : 0 }}
    />
  );
}

/** Trois paquets lumineux espacés le long d'un lien (SMIL : léger et suit l'échelle du SVG). */
function Packets({ d, fill, dur, offset = 0 }: { d: string; fill: string; dur: number; offset?: number }) {
  return (
    <g fill={fill}>
      {[0, 1, 2].map(i => (
        <g key={i}>
          <circle r="11" opacity="0.18">
            <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`${-(i * dur) / 3 - offset}s`} />
          </circle>
          <circle r="4.5">
            <animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} begin={`${-(i * dur) / 3 - offset}s`} />
          </circle>
        </g>
      ))}
    </g>
  );
}

function Node({
  x,
  y,
  label,
  active,
  done,
  big,
  float,
  children,
}: {
  x: number;
  y: number;
  label: string;
  active: boolean;
  done: boolean;
  big?: boolean;
  float: number;
  children: ReactNode;
}) {
  const r = big ? 52 : 44;
  const tone = done ? 'var(--success)' : 'var(--color-accent)';
  return (
    <motion.g
      initial={false}
      animate={{ y: float ? [0, -float, 0] : 0 }}
      transition={{ duration: 4 + float * 0.3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.circle
        cx={x}
        cy={y}
        r={r + 18}
        fill={tone}
        initial={false}
        animate={{ opacity: active ? 0.16 : 0, scale: active ? 1 : 0.6 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' }}
      />
      <circle cx={x} cy={y} r={r} fill="var(--card)" stroke={active ? tone : 'var(--color-divider)'} strokeWidth="2" style={{ transition: 'stroke .6s' }} />
      <g style={{ color: active ? (done ? 'var(--success)' : 'var(--color-accent-700)') : 'var(--muted)', transition: 'color .6s' }}>
        <svg x={x - (big ? 17 : 15)} y={y - (big ? 17 : 15)} width={big ? 34 : 30} height={big ? 34 : 30} overflow="visible">
          {children}
        </svg>
      </g>
      <text x={x} y={y + r + 30} textAnchor="middle" fontSize="17" fontWeight="600" fill={active ? 'var(--color-text)' : 'var(--muted)'} style={{ fontFamily: 'var(--font-body)', transition: 'fill .6s' }}>
        {label}
      </text>
    </motion.g>
  );
}
