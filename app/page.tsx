'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useConfetti } from '@/components/Confetti';
import { useToast } from '@/components/Toast';
import {
  CheckIcon,
  DatabaseIcon,
  LockIcon,
  LogoIcon,
  OrangeMoneyIcon,
  ShieldIcon,
  WaveIcon
} from '@/components/Icons';

export default function LandingPage() {
  const router = useRouter();
  const { launchConfetti } = useConfetti();
  const { showToast } = useToast();

  // État Démo 3 minutes interactive
  const [demoState, setDemoState] = useState<'idle' | 'running' | 'success'>('idle');
  const [demoStepText, setDemoStepText] = useState('Vérification de la confirmation Wave...');
  const [demoStepPct, setDemoStepPct] = useState('25%');

  // État FAQ Accordion
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // État Calculateur
  const [calcAmount, setCalcAmount] = useState(500000);
  const calcFee = Math.round(calcAmount * 0.03);
  const calcNet = calcAmount - calcFee;

  const run3MinDemo = () => {
    setDemoState('running');

    const steps = [
      { text: 'Réception de la notification Wave (100 FCFA)...', pct: '25%' },
      { text: 'Contrôle de signature webhook HMAC-SHA256 validé...', pct: '50%' },
      { text: 'Provisionnement de l’espace tantie.app.recette.ci...', pct: '75%' },
      { text: 'Base PostgreSQL créée & migrations appliquées...', pct: '90%' },
      { text: 'Passation terminée avec succès !', pct: '100%' }
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setDemoStepText(steps[i].text);
        setDemoStepPct(steps[i].pct);
        i++;
      } else {
        clearInterval(interval);
        setDemoState('success');
        launchConfetti();
        showToast('Application débloquée en 3 minutes chrono !', 'success');
      }
    }, 700);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  return (
    <div className="landing-page" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION */}
      <section style={{ position: 'relative', padding: 'clamp(14px, 2.5vw, 28px) clamp(24px, 5vw, 48px) clamp(60px, 8vw, 96px)', maxWidth: '1280px', margin: '0 auto' }}>
        {/* Orbes d'ambiance */}
        <span
          style={{
            position: 'absolute',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            background: 'var(--orb-a)',
            filter: 'blur(100px)',
            top: '-60px',
            left: '-80px',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
        <span
          style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'var(--orb-b)',
            filter: 'blur(90px)',
            bottom: 0,
            right: '-60px',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'clamp(48px, 6vw, 84px)', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '580px', width: '100%', margin: '0 auto', padding: '0 clamp(4px, 1.5vw, 12px)' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '999px',
                background: 'var(--glass-strong)',
                border: '1px solid var(--glass-border)',
                width: 'fit-content',
                boxShadow: 'var(--shadow-soft)'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.02em' }}>
                Plateforme de confiance opérée par Systalink
              </span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(30px, 3.8vw, 48px)', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0 }}>
              Livrez. Testez. <br />
              <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Payez. En confiance.
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', lineHeight: 1.6, color: 'var(--muted)', margin: 0, maxWidth: '540px' }}>
              Recette garantit la livraison contre paiement pour les logiciels sur mesure. Le client teste sur une démo hébergée. Dès qu’il règle par Mobile Money, l’application passe à son nom sur sa propre adresse web.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', paddingTop: '10px' }}>
              <Link
                href="/auth"
                className="btn btn-primary"
                style={{
                  padding: '16px 30px',
                  fontSize: '16px',
                  fontWeight: 700,
                  borderRadius: '999px',
                  background: 'var(--grad)',
                  color: '#fff',
                  boxShadow: '0 8px 24px rgba(255,106,0,.35)',
                  cursor: 'pointer',
                  border: 0,
                  textDecoration: 'none'
                }}
              >
                Envoyer mon projet →
              </Link>
              <a
                href="#demo"
                className="btn btn-secondary"
                style={{
                  padding: '15px 26px',
                  fontSize: '16px',
                  borderRadius: '999px',
                  background: 'var(--glass-strong)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <span style={{ color: 'var(--color-accent)' }}>▶</span> Démo en 3 minutes
              </a>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', paddingTop: '12px', fontSize: '13.5px', color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> Zéro rétention de fonds
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> Wave & Orange Money
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--success)' }}>✓</span> Passation &lt; 60s
              </span>
            </div>
          </div>

          {/* MOCKUP TÉLÉPHONE 3D FLOTTANT */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: 'clamp(20px, 3vw, 40px) 16px', perspective: '1000px' }}>
            {/* Carte flottante Confiance */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '-16px',
                zIndex: 3,
                padding: '12px 18px',
                borderRadius: '20px',
                background: 'var(--glass-strong)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-float)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'float 6s ease-in-out infinite'
              }}
            >
              <WaveIcon size={24} />
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Plateforme de confiance</strong>
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Garantie de livraison</span>
              </div>
            </div>

            {/* Carte flottante Orange Money */}
            <div
              style={{
                position: 'absolute',
                bottom: '44px',
                right: '-16px',
                zIndex: 3,
                padding: '12px 18px',
                borderRadius: '20px',
                background: 'var(--glass-strong)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-float)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'float 7s ease-in-out infinite reverse'
              }}
            >
              <OrangeMoneyIcon size={24} />
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Déblocage instantané</strong>
                <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>Accès débloqué ✓</span>
              </div>
            </div>

            {/* Cadre de l'appareil mobile */}
            <div
              style={{
                width: '320px',
                maxWidth: '100%',
                borderRadius: '46px',
                background: 'var(--device)',
                padding: '12px',
                boxShadow: '0 30px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.1)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  borderRadius: '36px',
                  background: 'var(--card)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '520px',
                  position: 'relative'
                }}
              >
                {/* Notch */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '110px',
                    height: '20px',
                    background: 'var(--device)',
                    borderRadius: '0 0 14px 14px',
                    zIndex: 10
                  }}
                />

                {/* En-tête simulation démo */}
                <div style={{ padding: '28px 16px 12px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-divider)', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                    Démo en direct
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '2px' }}>Boutique Kanaga - Caisse</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>d-kanaga26.demo.recette.ci</div>
                </div>

                {/* Contenu démo interactive interne */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', background: 'var(--color-bg)' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <strong>Robe Wax Étoile</strong>
                      <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>15 000 F</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Stock : 14 unités en rayon</span>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '14px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <strong>Chemise Lin Kente</strong>
                      <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>22 000 F</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Stock : 8 unités en rayon</span>
                  </div>

                  <div style={{ marginTop: 'auto', padding: '12px', borderRadius: '16px', background: 'var(--grad-soft)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--muted)' }}>Solde de livraison</span>
                      <strong>450 000 FCFA</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Paiement direct au développeur</div>
                  </div>
                </div>

                {/* Bouton payer qui pulse */}
                <div style={{ padding: '14px', background: 'var(--card)', borderTop: '1px solid var(--color-divider)' }}>
                  <button
                    onClick={() => router.push('/client/delivery/d-kanaga26')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '999px',
                      background: 'var(--grad)',
                      color: '#fff',
                      font: 'inherit',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 0,
                      cursor: 'pointer',
                      boxShadow: '0 6px 16px rgba(255,106,0,.4)',
                      animation: 'pulse 2.2s infinite'
                    }}
                  >
                    Payer 450 000 FCFA
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDEAU DE CONFIANCE & CHIFFRES CLÉS */}
      <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)', padding: '32px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'center' }}>
          <div>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 3.2vw, 40px)', color: 'var(--color-accent)' }}>1 248</strong>
            <span style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>projets livrés avec succès</span>
          </div>
          <div>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 3.2vw, 40px)', color: 'var(--color-text)' }}>312</strong>
            <span style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>démos actives en ce moment</span>
          </div>
          <div>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 3.2vw, 40px)', color: 'var(--color-accent)' }}>486,7 M</strong>
            <span style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>FCFA sécurisés sans litige</span>
          </div>
          <div>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(30px, 3.2vw, 40px)', color: 'var(--color-text)' }}>&lt; 60 s</strong>
            <span style={{ display: 'block', fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>délai moyen de passation</span>
          </div>
        </div>
      </section>

      {/* LE PROBLÈME EN MIROIR */}
      <section style={{ padding: '80px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Le problème universel
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 48px)', margin: '8px 0' }}>
            L'impasse de la fin de mission
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
            Celui qui fait confiance en premier est celui qui perd : le développeur ne touche jamais son solde, ou le client paie et ne reçoit jamais son application.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Côté Développeur */}
          <div style={{ padding: '32px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                DEV
              </span>
              <div>
                <strong style={{ fontSize: '16px' }}>Le Développeur Freelance</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>A codé pendant 3 semaines</span>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderRadius: '20px', background: 'var(--color-surface)', fontSize: '15px', fontStyle: 'italic', color: 'var(--color-text)' }}>
              « Je donne le code source et les clés d’accès dès que tu as versé le solde convenu. »
            </div>
            <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600 }}>
              Risque : Travailler pour rien si le client disparaît après la démo locale.
            </span>
          </div>

          {/* Côté Client */}
          <div style={{ padding: '32px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-neutral-300)', color: 'var(--color-text)', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                CLI
              </span>
              <div>
                <strong style={{ fontSize: '16px' }}>Le Client Donneur d'Ordre</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>Veut tester avant de payer</span>
              </div>
            </div>
            <div style={{ padding: '16px 20px', borderRadius: '20px', background: 'var(--color-surface)', fontSize: '15px', fontStyle: 'italic', color: 'var(--color-text)' }}>
              « Je paie le solde quand je vois que ça marche réellement pour mon équipe. »
            </div>
            <span style={{ fontSize: '13px', color: 'var(--danger)', fontWeight: 600 }}>
              Risque : Payer à l'aveugle et recevoir un zip incomplet ou inopérant.
            </span>
          </div>
        </div>

        {/* La Solution Recette */}
        <div style={{ marginTop: '40px', padding: '32px', borderRadius: '28px', background: 'var(--grad-soft)', border: '1px solid var(--color-accent-200)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
            La promesse de Recette
          </span>
          <strong style={{ fontSize: '20px', maxWidth: '720px', lineHeight: 1.4 }}>
            « Nous ne gardons jamais l’argent : l’argent va directement sur le compte Mobile Money du développeur. Ce que nous gardons jusqu’au paiement, c’est l’application. »
          </strong>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE (5 ÉTAPES) */}
      <section id="fonctionnement" style={{ padding: '60px 20px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              Processus infaillible
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 44px)', margin: '8px 0' }}>
              Comment ça marche en 5 temps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '22px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                1
              </span>
              <strong style={{ fontSize: '16px' }}>1. Envoi</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                Le dev dépose son code .zip chiffré et indique le montant à percevoir.
              </p>
            </div>

            <div style={{ padding: '22px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                2
              </span>
              <strong style={{ fontSize: '16px' }}>2. Démo isolée</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                Recette installe l'appli dans un conteneur et génère un lien de livraison sécurisé.
              </p>
            </div>

            <div style={{ padding: '22px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                3
              </span>
              <strong style={{ fontSize: '16px' }}>3. Essai réel</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                Le client ouvre le lien sur son téléphone, teste pour de vrai, sans rien installer.
              </p>
            </div>

            <div style={{ padding: '22px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                4
              </span>
              <strong style={{ fontSize: '16px' }}>4. Règlement</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                Paiement Mobile Money direct au dev via Wave ou Orange Money.
              </p>
            </div>

            <div style={{ padding: '22px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--success-100)', color: 'var(--success-800)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '14px' }}>
                5
              </span>
              <strong style={{ fontSize: '16px' }}>5. Passation</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                L'appli passe au nom du client sur sa propre adresse web avec sa base et ses accès.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DÉMO EN 3 MINUTES INTERACTIVE */}
      <section id="demo" style={{ padding: '80px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Expérience immersive
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 44px)', margin: '8px 0' }}>
            Faites la démo de 3 minutes en direct
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
            Testez le paiement symbolique de 100 FCFA avec le fournisseur simulé et admirez la passation en direct !
          </p>
        </div>

        <div style={{ padding: 'clamp(24px, 4vw, 44px)', borderRadius: '32px', background: 'var(--card)', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-divider)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '36px', alignItems: 'center' }}>
          {/* Étape démo interactive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                1
              </span>
              <strong style={{ fontSize: '16px' }}>Scannez ou cliquez ci-contre</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                2
              </span>
              <strong style={{ fontSize: '16px' }}>Simulez le paiement de 100 FCFA</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                3
              </span>
              <strong style={{ fontSize: '16px' }}>L'application se débloque en temps réel</strong>
            </div>

            <div style={{ padding: '16px', borderRadius: '20px', background: 'var(--grad-soft)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Projet test : Menu QR Resto Tantie Fatou</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Montant de test</span>
                <strong style={{ fontSize: '18px', color: 'var(--color-accent-800)' }}>100 FCFA</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={run3MinDemo}
                disabled={demoState === 'running'}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '14px',
                  fontSize: '15px',
                  fontWeight: 700,
                  borderRadius: '999px',
                  background: 'var(--grad)',
                  color: '#fff',
                  border: 0,
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(255,106,0,.35)',
                  opacity: demoState === 'running' ? 0.6 : 1
                }}
              >
                ⚡ Lancer le paiement (100 FCFA)
              </button>
            </div>
          </div>

          {/* Box de rendu de la démo */}
          <div
            style={{
              padding: '28px',
              borderRadius: '26px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              minHeight: '280px',
              position: 'relative'
            }}
          >
            {demoState === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '16px', background: '#fff', borderRadius: '20px', boxShadow: 'var(--shadow-soft)' }}>
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#1C130C" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  Cliquez sur "Lancer le paiement" pour voir le déblocage en direct
                </span>
              </div>
            )}

            {demoState === 'running' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--color-accent-200)', borderTopColor: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />
                <strong style={{ fontSize: '16px' }}>{demoStepText}</strong>
                <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'var(--color-neutral-300)', overflow: 'hidden' }}>
                  <div style={{ width: demoStepPct, height: '100%', background: 'var(--grad)', transition: 'width .4s' }} />
                </div>
              </div>
            )}

            {demoState === 'success' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', animation: 'rise .4s ease' }}>
                <span style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'grid', placeItems: 'center' }}>
                  <CheckIcon size={32} color="#fff" />
                </span>
                <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-heading)' }}>
                  Application Débloquée !
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  Adresse finale : <span style={{ color: 'var(--color-accent)' }}>https://tantie.app.recette.ci</span><br />
                  Facture n° <strong>RCT-2026-000003</strong> émise
                </p>
                <button
                  onClick={() => setDemoState('idle')}
                  className="btn btn-secondary"
                  style={{ padding: '8px 18px', borderRadius: '999px', fontSize: '13px' }}
                >
                  Réessayer la démo
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SÉCURITÉ & TECHNOLOGIES */}
      <section id="securite" style={{ padding: '60px 20px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
              Architecture durcie
            </span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 44px)', margin: '8px 0' }}>
              Sécurité et technologies certifiées
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ padding: '24px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center' }}>
                <ShieldIcon size={22} />
              </div>
              <strong style={{ fontSize: '16px' }}>Isolation stricte des conteneurs</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Chaque démo s'exécute dans un conteneur sans privilège, système en lecture seule avec /tmp en mémoire de 64 Mo, réseau privé hermétique et base Postgres dédiée.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center' }}>
                <LockIcon size={22} />
              </div>
              <strong style={{ fontSize: '16px' }}>Code chiffré au repos</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                L'archive .zip du développeur est chiffrée en AES-256-GCM. Le code en clair n'est jamais stocké de façon permanente avant le paiement.
              </p>
            </div>

            <div style={{ padding: '24px', borderRadius: '24px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center' }}>
                <DatabaseIcon size={22} />
              </div>
              <strong style={{ fontSize: '16px' }}>Sauvegardes automatiques</strong>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                Sauvegarde chiffrée initiale dès le passage en espace client, puis copie nocturne avec restauration testée et rétention de 7 jours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS & CALCULATEUR */}
      <section id="tarifs" style={{ padding: '80px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
            Modèle économique transparent
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(30px, 4vw, 44px)', margin: '8px 0' }}>
            Calculez votre rentabilité
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '560px', margin: '0 auto' }}>
            Vous ne payez que lorsqu'une livraison aboutit.
          </p>
        </div>

        <div style={{ padding: '32px', borderRadius: '32px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'center' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Montant de votre livraison :
            </label>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', color: 'var(--color-accent)', marginBottom: '12px' }}>
              {calcAmount.toLocaleString('fr-FR')} FCFA
            </div>
            <input
              type="range"
              min="50000"
              max="2500000"
              step="25000"
              value={calcAmount}
              onChange={e => setCalcAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
              <span>50 000 F</span>
              <span>2 500 000 F</span>
            </div>
          </div>

          <div style={{ padding: '24px', borderRadius: '24px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--muted)' }}>Frais de tiers de confiance (3 %) :</span>
              <strong>{calcFee.toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div style={{ height: '1px', background: 'var(--color-divider)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px' }}>
              <span>Vous recevez net sur Wave / OM :</span>
              <strong style={{ color: 'var(--success)', fontSize: '20px' }}>
                {calcNet.toLocaleString('fr-FR')} FCFA
              </strong>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              ✓ L'argent va directement sur votre numéro marchand dès la validation du client.
            </span>
          </div>
        </div>
      </section>

      {/* FAQ ACCORDÉON */}
      <section id="faq" style={{ padding: '60px 20px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-divider)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '36px', margin: '0 0 8px' }}>
              Questions fréquentes
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--muted)' }}>
              Tout ce que vous devez savoir pour démarrer en toute sérénité.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: "Le client peut-il copier ce qu'il voit ?",
                a: "Non. La démo ne montre que la façade exécutée dans notre conteneur isolé. Le code source, le serveur de production, la base PostgreSQL et les mots de passe d'administration restent chiffrés et scellés jusqu'au paiement effectif."
              },
              {
                q: "Que se passe-t-il si le client ne paie pas ?",
                a: "La démo reste active 30 jours avec des rappels automatiques. Sans paiement, elle est automatiquement purgée avec le code déposé. Le développeur conserve son travail, et le client ne garde rien."
              },
              {
                q: "Qui reçoit l'argent ?",
                a: "Le développeur directement sur son compte Wave ou Orange Money ! Recette n'est pas un compte séquestre et ne détient jamais vos fonds : elle détient et garantit l'application logicielle."
              }
            ].map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  onClick={() => toggleFaq(index)}
                  style={{
                    padding: '20px 24px',
                    borderRadius: '20px',
                    background: 'var(--card)',
                    border: '1px solid var(--color-divider)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '16px' }}>
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '18px', transition: 'transform .3s' }}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </div>
                  {isOpen && (
                    <p style={{ margin: '12px 0 0', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '80px 20px', background: 'var(--grad)', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(36px, 5vw, 56px)', margin: 0, lineHeight: 1.05 }}>
            Ne livrez plus jamais à l'aveugle.
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '540px', margin: 0 }}>
            Rejoignez les développeurs qui se font payer 100% de leurs soldes sans négociations de fin de projet.
          </p>
          <Link
            href="/auth"
            style={{
              padding: '16px 36px',
              borderRadius: '999px',
              background: '#fff',
              color: 'var(--color-accent-800)',
              font: 'inherit',
              fontSize: '16px',
              fontWeight: 700,
              border: 0,
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,.25)',
              textDecoration: 'none'
            }}
          >
            Commencer maintenant →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '40px 20px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-divider)', fontSize: '13px', color: 'var(--muted)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff' }}>
              <LogoIcon size={13} color="#fff" />
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--color-text)' }}>Recette</span>
            <span>· Coupe d'Afrique des Développeurs 2026</span>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <a href="#fonctionnement" style={{ color: 'inherit', textDecoration: 'none' }}>Comment ça marche</a>
            <a href="#tarifs" style={{ color: 'inherit', textDecoration: 'none' }}>Tarifs</a>
            <a href="#securite" style={{ color: 'inherit', textDecoration: 'none' }}>Sécurité</a>
            <a href="#faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
            <Link href="/cgu" style={{ color: 'inherit', textDecoration: 'none' }}>CGU</Link>
            <Link href="/cf" style={{ color: 'inherit', textDecoration: 'none' }}>CF</Link>
          </div>
          <div>Opéré par Systalink · Tous droits réservés</div>
        </div>
      </footer>
    </div>
  );
}
