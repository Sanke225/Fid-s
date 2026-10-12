import Link from 'next/link';
import { ArrowRightIcon } from '@/components/Icons';
import { MagneticButton } from '@/components/motion/MagneticButton';
import { Reveal } from '@/components/motion/Reveal';
import { GradientCanvas } from './GradientCanvas';

/** Appel final sur maillage « braise » : assez sombre pour du texte blanc lisible. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-titre" className="relative isolate overflow-hidden bg-[#8A3300] py-28 text-white lg:py-36">
      <GradientCanvas variant="ember" className="absolute inset-0 -z-10 size-full" />
      {/* Motif bogolan de la charte, ton sur ton et très atténué : il reste derrière le texte sans gêner la lecture. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/motif-bogolan-tuile-ton-sur-ton-orange.svg')] bg-[length:120px_120px] opacity-[.18] mix-blend-soft-light"
      />
      <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 id="cta-titre" className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.02] tracking-[-0.02em]">
          Ne livrez plus jamais à l’aveugle.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[18px] leading-relaxed text-white/90">
          Rejoignez les développeurs qui encaissent 100 % de leur solde, sans négociation de fin de projet.
        </p>
        <div className="mt-10 flex justify-center">
          <MagneticButton>
            <Link
              href="/inscription"
              transitionTypes={['nav-forward']}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[16px] font-bold text-[#5C2200] shadow-[0_20px_50px_-12px_rgba(0,0,0,.45)] transition-transform hover:scale-[1.03] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Commencer maintenant
              <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
        </div>
      </Reveal>
      {/* Bande kente : ferme le visuel en bas, comme sur les supports de la charte. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3 bg-[url('/bande-kente.svg')] bg-[length:auto_100%] bg-repeat-x" />
    </section>
  );
}
