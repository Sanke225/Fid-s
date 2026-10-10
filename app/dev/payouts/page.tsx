'use client';

import React, { useState } from 'react';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { OrangeMoneyIcon, WaveIcon } from '@/components/Icons';

export default function DevPayoutsPage() {
  const { state } = useRecette();
  const { showToast } = useToast();

  const [wavePhone, setWavePhone] = useState('+225 07 08 45 67 12');
  const [omPhone, setOmPhone] = useState('+225 07 55 90 12 34');

  const handleSaveWave = () => {
    showToast('Compte Wave marchand mis à jour avec succès', 'success');
  };

  const handleSaveOm = () => {
    showToast('Compte Orange Money mis à jour avec succès', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1100px', margin: '0 auto' }}>
      <div>
        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Finances & Réception
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(24px, 3.5vw, 32px)', margin: '4px 0 0' }}>
          Comptes d'encaissement Mobile Money
        </h1>
      </div>

      <div style={{ padding: '20px', borderRadius: '24px', background: 'var(--grad-soft)', border: '1px solid var(--color-accent-200)', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '24px' }}>🔒</span>
        <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
          <strong>Principe cardinal de Recette :</strong> L'argent ne transite jamais par nos comptes. Vos identifiants marchands sont stockés chiffrés en base et servent exclusivement à émettre les demandes de paiement à votre nom.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
        {/* Compte Wave */}
        <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <WaveIcon size={28} />
              <strong style={{ fontSize: '17px' }}>Wave Business</strong>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'var(--success-100)', color: 'var(--success-800)', fontSize: '11px', fontWeight: 700 }}>
              Actif
            </span>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Numéro de téléphone Wave
            </label>
            <input
              type="text"
              value={wavePhone}
              onChange={e => setWavePhone(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Clé API Marchand Wave (chiffrée)
            </label>
            <input
              type="password"
              defaultValue="wv_prod_live_8819203928172"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleSaveWave}
            className="btn btn-secondary"
            style={{ marginTop: 'auto', padding: '10px', borderRadius: '999px', fontSize: '13px' }}
          >
            Enregistrer les modifications
          </button>
        </div>

        {/* Compte Orange Money */}
        <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <OrangeMoneyIcon size={28} />
              <strong style={{ fontSize: '17px' }}>Orange Money Pro</strong>
            </div>
            <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'var(--success-100)', color: 'var(--success-800)', fontSize: '11px', fontWeight: 700 }}>
              Actif
            </span>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Numéro Orange Money
            </label>
            <input
              type="text"
              value={omPhone}
              onChange={e => setOmPhone(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              ID Marchand Orange Money CI
            </label>
            <input
              type="password"
              defaultValue="OM_CI_PRO_771829"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <button
            onClick={handleSaveOm}
            className="btn btn-secondary"
            style={{ marginTop: 'auto', padding: '10px', borderRadius: '999px', fontSize: '13px' }}
          >
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
