import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { BRAND } from '@/components/landing/data';
import { Faq } from '@/components/landing/Faq';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingNav } from '@/components/landing/LandingNav';
import { LiveDemo } from '@/components/landing/LiveDemo';
import { Pricing } from '@/components/landing/Pricing';
import { Problem } from '@/components/landing/Problem';
import { Security } from '@/components/landing/Security';
import { TrustBar } from '@/components/landing/TrustBar';

export const metadata: Metadata = {
  title: `${BRAND} · La livraison contre paiement, pour les logiciels`,
  description: `${BRAND} est le tiers de confiance qui sécurise la livraison de logiciels entre freelances et clients : démo hébergée, paiement Mobile Money direct au développeur, passation instantanée.`,
};

const SLIDE = { 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' };

export default function LandingPage() {
  return (
    <ViewTransition enter={SLIDE} exit={SLIDE} default="none">
      <SmoothScroll>
        <div className="landing overflow-x-clip">
          <a href="#contenu" className="skip-link">Aller au contenu</a>
          <LandingNav />
          <div id="contenu">
            <Hero />
            <TrustBar />
            <Problem />
            <HowItWorks />
            <LiveDemo />
            <Security />
            <Pricing />
            <Faq />
            <FinalCta />
          </div>
          <Footer />
        </div>
      </SmoothScroll>
    </ViewTransition>
  );
}
