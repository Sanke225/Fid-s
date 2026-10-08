'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import {
  CheckIcon,
  ChevronRightIcon,
  PlusIcon,
  QrCodeIcon,
  RefreshIcon,
  ServerIcon,
  WalletIcon
} from '@/components/Icons';
import { ProjectStatus } from '@/lib/types';

export default function DevDashboardPage() {
  const router = useRouter();
  const { state } = useRecette();
  const projects = state.projects;

  // Calcul des métriques KPI réelles
  const totalRevenue = projects
    .filter(p => p.status === 'delivered')
    .reduce((sum, p) => sum + (p.amountXof || 0), 0);

  const activeDemosCount = projects.filter(p => p.status === 'demo_ready').length;
  const inProgressCount = projects.filter(p => ['building', 'handing_over'].includes(p.status)).length;
  const conversionRate =
    projects.length > 0
      ? Math.round((projects.filter(p => p.status === 'delivered').length / projects.length) * 100)
      : 100;

  const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; color: string; dot: string }> = {
    draft: { label: 'Brouillon', bg: 'var(--color-neutral-300)', color: 'var(--color-neutral-800)', dot: '#999' },
    building: { label: 'En installation', bg: 'var(--info-100)', color: 'var(--info-800)', dot: 'var(--info)' },
    demo_ready: { label: 'Démo active', bg: 'var(--color-accent-100)', color: 'var(--color-accent-800)', dot: 'var(--color-accent)' },
    paid: { label: 'Payé', bg: 'var(--warning-100)', color: 'var(--warning-800)', dot: 'var(--warning)' },
    handing_over: { label: 'En passation', bg: 'var(--color-accent-100)', color: 'var(--color-accent-800)', dot: 'var(--color-accent)' },
    handover_failed: { label: 'Passation bloquée', bg: 'var(--danger-100)', color: 'var(--danger-800)', dot: 'var(--danger)' },
    delivered: { label: 'Livré', bg: 'var(--success-100)', color: 'var(--success-800)', dot: 'var(--success)' },
    expired: { label: 'Expiré', bg: 'var(--color-neutral-300)', color: 'var(--color-neutral-700)', dot: '#777' },
    cancelled: { label: 'Annulé', bg: 'var(--danger-100)', color: 'var(--danger-800)', dot: 'var(--danger)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1380px', margin: '0 auto' }}>
      {/* En-tête de bienvenue & Action principale */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Espace Développeur
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(28px, 3vw, 38px)', margin: '4px 0 0' }}>
            Bonjour, {state.currentUser.fullName}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            href="/dev/new"
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 22px',
              borderRadius: '999px',
              background: 'var(--grad)',
              color: '#fff',
              border: 0,
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(255,106,0,.35)',
              textDecoration: 'none'
            }}
          >
            <PlusIcon size={18} color="#fff" /> Nouveau projet
          </Link>
        </div>
      </div>

      {/* 4 CARTES KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Revenus perçus</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--success-100)', color: 'var(--success-800)', display: 'grid', placeItems: 'center' }}>
              <WalletIcon size={16} />
            </span>
          </div>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', lineHeight: 1 }}>
            {totalRevenue.toLocaleString('fr-FR')} <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--muted)' }}>FCFA</span>
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>✓ 100 % encaissé sans litige</span>
        </div>

        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Démos en ligne actives</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center' }}>
              <ServerIcon size={16} />
            </span>
          </div>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', lineHeight: 1 }}>
            {activeDemosCount} <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--muted)' }}>démos</span>
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: 600 }}>En attente d'essai ou paiement</span>
        </div>

        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>En cours (build / passation)</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--info-100)', color: 'var(--info-800)', display: 'grid', placeItems: 'center' }}>
              <RefreshIcon size={16} />
            </span>
          </div>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', lineHeight: 1 }}>
            {inProgressCount} <span style={{ fontFamily: 'var(--font-body)', fontSize: '16px', fontWeight: 600, color: 'var(--muted)' }}>processus</span>
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--info-800)', fontWeight: 600 }}>Automatisation sans blocage</span>
        </div>

        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Taux de conversion</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--warning-100)', color: 'var(--warning-800)', display: 'grid', placeItems: 'center' }}>
              <CheckIcon size={16} />
            </span>
          </div>
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', lineHeight: 1 }}>
            {conversionRate} %
          </strong>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Projets débloqués post-démo</span>
        </div>
      </div>

      {/* SECTION GRAPHIQUE & ACTIVITÉ EN DIRECT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Graphique des revenus */}
        <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Revenus par moyen de paiement</span>
              <strong style={{ display: 'block', fontSize: '22px', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
                Historique 12 mois
              </strong>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-accent)' }} /> Wave
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--amber)' }} /> Orange Money
              </span>
            </div>
          </div>

          <div style={{ position: 'relative', height: '180px', width: '100%', marginTop: '10px' }}>
            <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="40" x2="500" y2="40" stroke="var(--color-divider)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="var(--color-divider)" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="var(--color-divider)" />

              <path d="M 0,130 Q 80,110 160,80 T 320,40 T 500,20 L 500,140 L 0,140 Z" fill="url(#chartGrad)" />
              <path d="M 0,130 Q 80,110 160,80 T 320,40 T 500,20" fill="none" stroke="#FF6A00" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 0,140 Q 80,130 160,110 T 320,80 T 500,60" fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5" />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)' }}>
            <span>Oct</span><span>Déc</span><span>Fév</span><span>Avr</span><span>Juin</span><span>Août</span><span>Oct</span>
          </div>
        </div>

        {/* Activité en direct */}
        <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: '16px' }}>Activité en direct</strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success)', background: 'var(--success-100)', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.8s infinite' }} /> En ligne
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <QrCodeIcon size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0, fontSize: '13px' }}>
                <strong>Mariam Traoré</strong> a ouvert la démo Boutique Kanaga
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>Il y a 25 min</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--success-100)', color: 'var(--success-800)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <WalletIcon size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0, fontSize: '13px' }}>
                Paiement de <strong>850 000 FCFA</strong> reçu pour Ivoire Express
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>Il y a 2 jours</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--info-100)', color: 'var(--info-800)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                <ServerIcon size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0, fontSize: '13px' }}>
                Build &amp; conteneur provisionnés pour <strong>Grand Bassam</strong>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--muted)' }}>Il y a 1 heure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROJETS RÉCENTS */}
      <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ fontSize: '18px' }}>Projets et Livraisons récents</strong>
          <Link
            href="/dev/projects"
            style={{ textDecoration: 'none', color: 'var(--color-accent)', fontWeight: 700, fontSize: '14px' }}
          >
            Tout voir ({projects.length}) →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects.slice(0, 5).map(p => {
            const st = STATUS_CONFIG[p.status] || STATUS_CONFIG['draft'];
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/dev/project/${p.id}`)}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '18px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-divider)',
                  cursor: 'pointer',
                  transition: 'transform .2s ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
                  <span
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '14px',
                      background: 'var(--grad)',
                      color: '#fff',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 700,
                      fontFamily: 'var(--font-heading)',
                      fontSize: '16px',
                      flex: 'none'
                    }}
                  >
                    {p.name.charAt(0)}
                  </span>
                  <div>
                    <strong style={{ fontSize: '15px', display: 'block' }}>{p.name}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Client : {p.client.name}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: st.bg,
                      color: st.color,
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot }} />
                    {st.label}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <strong style={{ fontSize: '16px', display: 'block' }}>{(p.amountXof || 0).toLocaleString('fr-FR')} FCFA</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{p.lastActivity || 'Créé récemment'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)' }}>
                  <ChevronRightIcon size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
