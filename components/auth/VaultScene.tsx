'use client';

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useEffect } from 'react';
import { LockIcon, UnlockIcon } from '@/components/Icons';
import { useFinePointer } from '@/components/motion/useMedia';

export type VaultStatus = 'idle' | 'loading' | 'error' | 'success';

/** Anneaux du coffre : rayon (en % de la scène), sens et vitesse relatifs, motif du trait, paquets. */
const RINGS = [
  { size: 26, factor: 1.6, dash: '2 6', packets: 1 },
  { size: 42, factor: -1.1, dash: '18 10', packets: 2 },
  { size: 58, factor: 0.75, dash: '1 0', packets: 1 },
  { size: 74, factor: -0.5, dash: '4 14', packets: 3 },
  { size: 92, factor: 0.32, dash: '60 24', packets: 0 },
] as const;

const SPEED: Record<VaultStatus, number> = { idle: 1, loading: 6, error: 0.4, success: 0.25 };

/**
 * Fond de la connexion : un coffre vu en perspective. Les anneaux tournent comme une serrure,
 * accélèrent pendant la vérification, se figent et s'ouvrent quand l'accès est accordé.
 */
export function VaultScene({ status }: { status: VaultStatus }) {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const angle = useMotionValue(0);
  const speed = useSpring(SPEED.idle, { stiffness: 30, damping: 14 });

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(useTransform(my, [-1, 1], [6, -6]), { stiffness: 60, damping: 18 });
  const tiltY = useSpring(useTransform(mx, [-1, 1], [-8, 8]), { stiffness: 60, damping: 18 });

  useEffect(() => {
    speed.set(SPEED[status]);
  }, [status, speed]);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    angle.set(angle.get() + speed.get() * Math.min(delta, 50) * 0.012);
  });

  useEffect(() => {
    if (!fine || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set((e.clientX / window.innerWidth) * 2 - 1);
      my.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [fine, reduced, mx, my]);

  const open = status === 'success';

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-f-bg">
      <div className="auth-orb auth-orb-a" />
      <div className="auth-orb auth-orb-b" />

      <div className="absolute left-1/2 top-[19svh] size-[min(118vw,620px)] -translate-x-1/2 -translate-y-1/2 opacity-95 [perspective:1300px] lg:left-[29%] lg:top-[42%] lg:size-[min(54vw,740px)] lg:opacity-100">
        <motion.div className="relative size-full" style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}>
          {/* Plan incliné : sol quadrillé + anneaux */}
          <motion.div
            className="absolute inset-0"
            style={{ rotateX: 66, transformStyle: 'preserve-3d' }}
            animate={{ scale: open ? 1.1 : 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="auth-floor absolute inset-[-20%] rounded-full" />
            {RINGS.map((r, i) => (
              <Ring key={r.size} {...r} index={i} angle={angle} open={open} />
            ))}
          </motion.div>

          {/* Faisceau vertical entre le plan et le cœur */}
          <motion.div
            className="absolute left-1/2 top-[18%] h-[34%] w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,var(--color-accent),transparent)]"
            animate={{ opacity: status === 'loading' ? [0.4, 1, 0.4] : open ? 1 : 0.55, scaleX: open ? 6 : 1 }}
            transition={status === 'loading' ? { duration: 0.9, repeat: Infinity } : { duration: 0.8 }}
          />

          {/* Cœur : le cadenas */}
          <motion.div
            className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2"
            animate={
              status === 'error'
                ? { x: [0, -14, 12, -8, 6, 0] }
                : { x: 0, y: reduced ? 0 : [0, -10, 0] }
            }
            transition={status === 'error' ? { duration: 0.5 } : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="relative grid size-[clamp(84px,9vw,120px)] place-items-center">
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent) 45%, transparent), transparent)' }}
                animate={{ scale: open ? [1, 2.4] : [1, 1.5, 1], opacity: open ? [0.9, 0] : [0.7, 0.25, 0.7] }}
                transition={open ? { duration: 1.4, repeat: Infinity } : { duration: 3, repeat: Infinity }}
              />
              <div
                className={`relative grid size-full place-items-center rounded-full border backdrop-blur-xl transition-[background-color,border-color,color] duration-700 ${
                  status === 'error'
                    ? 'border-[var(--danger)] bg-[var(--danger-100)] text-[var(--danger)]'
                    : open
                      ? 'border-[var(--success)] bg-[var(--success-100)] text-f-success-ink'
                      : 'border-f-glass-line bg-f-glass text-f-ink-accent'
                } shadow-f-float`}
              >
                <motion.span
                  key={open ? 'open' : 'closed'}
                  initial={{ scale: 0.6, rotate: open ? -25 : 0, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                >
                  {open ? <UnlockIcon size={38} /> : <LockIcon size={38} />}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Ring({
  size,
  factor,
  dash,
  packets,
  index,
  angle,
  open,
}: {
  size: number;
  factor: number;
  dash: string;
  packets: number;
  index: number;
  angle: MotionValue<number>;
  open: boolean;
}) {
  const rotate = useTransform(angle, v => v * factor);
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ width: `${size}%`, height: `${size}%`, rotate }}
      animate={{ opacity: open ? 1 : 0.55 + index * 0.07, scale: open ? 1 + index * 0.025 : 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg viewBox="0 0 200 200" className="size-full overflow-visible">
        <circle
          cx="100" cy="100" r="99" fill="none"
          stroke={open ? 'var(--success)' : 'var(--color-accent)'}
          strokeOpacity={index === 2 ? 0.55 : 0.4}
          strokeWidth={index === 2 ? 1.6 : 1}
          strokeDasharray={dash}
          vectorEffect="non-scaling-stroke"
          style={{ transition: 'stroke 0.8s' }}
        />
        {/* Paquets lumineux posés sur l'anneau */}
        {Array.from({ length: packets }, (_, p) => {
          const a = ((360 / packets) * p + index * 37) * (Math.PI / 180);
          const cx = 100 + 99 * Math.cos(a);
          const cy = 100 + 99 * Math.sin(a);
          return (
            <g key={p} fill={open ? 'var(--success)' : 'var(--color-accent)'} style={{ transition: 'fill 0.8s' }}>
              <circle cx={cx} cy={cy} r={6 - index * 0.8} opacity="0.22" />
              <circle cx={cx} cy={cy} r={2.4 - index * 0.25} />
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
}
