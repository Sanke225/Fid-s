'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { ChevronRightIcon, PlusIcon, SearchIcon } from '@/components/Icons';
import { ProjectStatus } from '@/lib/types';

export default function DevProjectsPage() {
  const router = useRouter();
  const { state } = useRecette();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  let list = state.projects;

  if (filter !== 'all') {
    list = list.filter(p => p.status === filter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(
      p => p.name.toLowerCase().includes(q) || p.client.name.toLowerCase().includes(q)
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1380px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Gestion des livraisons
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(28px, 3vw, 38px)', margin: '4px 0 0' }}>
            Mes projets ({list.length})
          </h1>
        </div>

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

      {/* Barre de recherche et filtres */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 'min(100%, 260px)', maxWidth: '440px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            placeholder="Rechercher par projet ou client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              borderRadius: '999px',
              border: '1px solid var(--color-divider)',
              background: 'var(--card)',
              color: 'var(--color-text)',
              font: 'inherit',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Pilules de statut */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'all', label: 'Tous' },
            { id: 'demo_ready', label: 'Démos en ligne' },
            { id: 'building', label: 'En installation' },
            { id: 'delivered', label: 'Livrés' },
            { id: 'handover_failed', label: 'Bloqués' }
          ].map(f => {
            const isCur = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  border: isCur ? '0' : '1px solid var(--color-divider)',
                  background: isCur ? 'var(--grad)' : 'var(--card)',
                  color: isCur ? '#fff' : 'var(--color-text)',
                  fontSize: '13px',
                  fontWeight: isCur ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des cartes projets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {list.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', background: 'var(--card)', borderRadius: '28px', border: '1px solid var(--color-divider)', color: 'var(--muted)' }}>
            Aucun projet ne correspond aux critères de recherche.
          </div>
        ) : (
          list.map(p => {
            const st = STATUS_CONFIG[p.status] || STATUS_CONFIG.draft;
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/dev/project/${p.id}`)}
                style={{
                  padding: '24px',
                  borderRadius: '28px',
                  background: 'var(--card)',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'transform .2s ease'
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '12px',
                        background: 'var(--grad)',
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                        fontFamily: 'var(--font-heading)',
                        fontSize: '15px'
                      }}
                    >
                      {p.name.charAt(0)}
                    </span>
                    <div>
                      <strong style={{ fontSize: '16px', display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Client : {p.client.name}</span>
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      background: st.bg,
                      color: st.color,
                      fontSize: '11px',
                      fontWeight: 700
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot }} />
                    {st.label}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--color-divider)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Solde convenu</span>
                    <strong style={{ fontSize: '18px', color: 'var(--color-accent-800)' }}>
                      {(p.amountXof || 0).toLocaleString('fr-FR')} FCFA
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-accent)', fontWeight: 600 }}>
                    Suivi <ChevronRightIcon size={16} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
