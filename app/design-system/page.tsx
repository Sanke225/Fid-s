'use client';

import React from 'react';
import { useToast } from '@/components/Toast';
import { useConfetti } from '@/components/Confetti';
import { CheckIcon, PlusIcon, WaveIcon } from '@/components/Icons';

export default function DesignSystemPage() {
  const { showToast } = useToast();
  const { launchConfetti } = useConfetti();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div>
        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
          Design System Apple Level
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(28px, 4vw, 38px)', margin: '4px 0 8px' }}>
          Système Visuel Recette
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--muted)', margin: 0, maxWidth: '640px' }}>
          Minimalisme premium, glassmorphism subtil, dégradé orange signature et typographies d'exception pour une confiance instantanée.
        </p>
      </div>

      {/* PALETTE DE COULEURS */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '22px', margin: 0 }}>
          Palette Signature
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', borderRadius: '20px', background: '#FF6A00', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '14px' }}>Orange Principal</strong>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', opacity: 0.9 }}>#FF6A00</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '20px', background: '#FF9A3D', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '14px' }}>Orange Éclat</strong>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', opacity: 0.9 }}>#FF9A3D</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '20px', background: '#FFB547', color: '#1C130C', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '14px' }}>Ambre Doré</strong>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', opacity: 0.9 }}>#FFB547</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '20px', background: '#FFF8F1', color: '#1C130C', border: '1px solid #E5D5C5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '14px' }}>Crème Ground</strong>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: '#777' }}>#FFF8F1</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '20px', background: '#0B0B0F', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '14px' }}>Dark Ground</strong>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', opacity: 0.8 }}>#0B0B0F</span>
          </div>
          <div style={{ padding: '16px', borderRadius: '20px', background: '#2F8A4A', color: '#fff', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <strong style={{ fontSize: '14px' }}>Succès Livré</strong>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', opacity: 0.9 }}>#2F8A4A</span>
          </div>
        </div>
      </section>

      {/* BOUTONS & ÉTATS */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '22px', margin: 0 }}>
          Boutons &amp; États
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', background: 'var(--card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-divider)' }}>
          <button
            onClick={() => showToast('Bouton Primaire cliqué', 'success')}
            className="btn btn-primary"
            style={{ padding: '12px 24px', borderRadius: '999px', fontSize: '14px', fontWeight: 700 }}
          >
            Bouton Primaire
          </button>
          <button
            onClick={() => showToast('Bouton Secondaire cliqué', 'info')}
            className="btn btn-secondary"
            style={{ padding: '12px 24px', borderRadius: '999px', fontSize: '14px' }}
          >
            Bouton Secondaire
          </button>
          <button
            onClick={() => launchConfetti()}
            className="btn btn-primary"
            style={{ padding: '12px 24px', borderRadius: '999px', fontSize: '14px', background: 'var(--grad)' }}
          >
            🎉 Lancer Confettis
          </button>
          <button
            style={{ padding: '12px 24px', borderRadius: '999px', border: '1px dashed var(--color-divider)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer' }}
          >
            Contour Discret
          </button>
        </div>
      </section>

      {/* BADGES DE STATUT */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '22px', margin: 0 }}>
          Badges de Statut (10 étapes de livraison)
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: 'var(--card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--color-divider)' }}>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--color-neutral-300)', color: 'var(--color-neutral-800)', fontSize: '12px', fontWeight: 700 }}>
            Brouillon
          </span>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--info-100)', color: 'var(--info-800)', fontSize: '12px', fontWeight: 700 }}>
            En installation
          </span>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontSize: '12px', fontWeight: 700 }}>
            Démo active
          </span>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--warning-100)', color: 'var(--warning-800)', fontSize: '12px', fontWeight: 700 }}>
            Paiement reçu
          </span>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontSize: '12px', fontWeight: 700 }}>
            En passation
          </span>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--danger-100)', color: 'var(--danger-800)', fontSize: '12px', fontWeight: 700 }}>
            Passation bloquée
          </span>
          <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--success-100)', color: 'var(--success-800)', fontSize: '12px', fontWeight: 700 }}>
            Livré avec succès
          </span>
        </div>
      </section>

      {/* TYPOGRAPHIE */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '22px', margin: 0 }}>
          Échelle Typographique
        </h2>
        <div style={{ background: 'var(--card)', padding: 'clamp(18px, 4vw, 28px)', borderRadius: '24px', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(26px, 4vw, 42px)', lineHeight: 1.15 }}>
            Caprasimo Display 42px — La confiance codée.
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 3.2vw, 32px)' }}>
            Titre de Section 32px — Livrez en confiance.
          </div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(18px, 2.5vw, 24px)' }}>
            Sous-titre 24px — Le tiers de confiance des logiciels.
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 1.8vw, 16px)', color: 'var(--muted)', margin: 0 }}>
            Figtree Body 16px — Recette garantit la livraison contre paiement pour les logiciels sur mesure dans toute la zone UEMOA et au-delà.
          </p>
        </div>
      </section>
    </div>
  );
}
