import Link from 'next/link';
import { ArrowRightIcon, CheckIcon } from '@/components/Icons';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { SplitText } from '@/components/motion/SplitText';
import { BRAND } from './data';
import { GradientCanvas } from './GradientCanvas';
import { PhoneScene } from './PhoneScene';

/**
 * Hero : maillage WebGL dans une bande inclinée (à la Stripe), titre révélé en CSS
 * (visible sans JavaScript), téléphone 3D à droite.
 */
export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-28 sm:pt-32 lg:pb-32 lg:pt-40">
      <div aria-hidden className="hero-band absolute inset-x-0 -top-24 -z-10 h-[calc(100%-4rem)] origin-top-left -skew-y-6 overflow-hidden">
        <div className="hero-fallback absolute inset-0" />
        <GradientCanvas variant="hero" className="absolute inset-0 size-full" />
        <div className="hero-veil absolute inset-0" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-8">
        <div className="flex max-w-xl flex-col gap-7">
          <span className="fd-in inline-flex w-fit items-center gap-2 rounded-full border border-f-glass-line bg-f-glass px-4 py-1.5 text-[13px] font-semibold shadow-f-soft backdrop-blur-xl">
            <span className="size-2 rounded-full bg-[var(--color-accent)] [animation:pulse_2s_infinite]" />
            Le tiers de confiance des livraisons de logiciels
          </span>

          <h1 className="font-display text-[clamp(2.5rem,5.6vw,4.4rem)] leading-[1.02] tracking-[-0.025em]">
            <span className="block">
              <SplitText text="Livrez. Testez." />
            </span>
            <span className="block">
              <SplitText text="Payez. En confiance." startIndex={2} wordClassName="text-grad" />
            </span>
          </h1>

          <p className="fd-in max-w-[34rem] text-[clamp(1.02rem,1.5vw,1.2rem)] leading-relaxed text-f-muted" style={{ animationDelay: '.45s' }}>
            {BRAND} garantit la livraison contre paiement des logiciels sur mesure. Le client teste
            sur une démo hébergée ; dès qu’il paie le développeur par Mobile Money, l’application
            passe à son nom, sur sa propre adresse web.
          </p>

          <div className="fd-in flex flex-wrap items-center gap-4" style={{ animationDelay: '.6s' }}>
            <MagneticButton>
              <Link href="/inscription" transitionTypes={['nav-forward']} className="cta-primary group rounded-full px-7 py-4 text-[16px]">
                Envoyer mon projet
                <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
            <a href="#demo" className="cta-ghost rounded-full px-6 py-[15px] text-[16px]">
              <span aria-hidden className="grid size-6 place-items-center rounded-full bg-f-text text-f-bg">
                <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor"><path d="M0 0.8v8.4a.8.8 0 0 0 1.2.7l7.2-4.2a.8.8 0 0 0 0-1.4L1.2.1A.8.8 0 0 0 0 .8Z" /></svg>
              </span>
              Démo en 3 minutes
            </a>
          </div>

          <ul className="fd-in flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-f-muted" style={{ animationDelay: '.75s' }}>
            {['Zéro rétention de fonds', 'Wave, Orange, Moov, MTN', 'Passation en moins de 60 s'].map(t => (
              <li key={t} className="flex items-center gap-1.5">
                <CheckIcon size={15} className="text-f-success-ink" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="fd-in" style={{ animationDelay: '.3s' }}>
          <PhoneScene />
        </div>
      </div>
    </section>
  );
}
