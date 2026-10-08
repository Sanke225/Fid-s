'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import {
  DashIcon,
  InvoiceIcon,
  PlusIcon,
  ProjectsIcon,
  SearchIcon,
  ServerIcon,
  ShieldIcon
} from './Icons';

export function CmdPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { state } = useRecette();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-cmd-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-cmd-palette', handleCustomOpen);
    };
  }, []);

  if (!open) return null;

  const navigateTo = (path: string) => {
    setOpen(false);
    setQuery('');
    router.push(path);
  };

  const navItems = [
    { label: 'Tableau de bord Développeur', path: '/dev/dashboard', icon: <DashIcon size={18} /> },
    { label: 'Mes projets', path: '/dev/projects', icon: <ProjectsIcon size={18} /> },
    { label: 'Nouveau projet à livrer', path: '/dev/new', icon: <PlusIcon size={18} /> },
    { label: 'Moyens de réception (Wave & OM)', path: '/dev/payouts', icon: <DashIcon size={18} /> },
    { label: 'Factures émises', path: '/dev/invoices', icon: <InvoiceIcon size={18} /> },
    { label: 'Supervision Admin (Systalink)', path: '/admin/overview', icon: <ServerIcon size={18} /> },
    { label: 'Espace Client (Mariam Traoré)', path: '/client/dashboard', icon: <DashIcon size={18} /> },
    { label: 'Design System Apple-Level', path: '/design-system', icon: <ShieldIcon size={18} /> }
  ];

  const filteredNav = navItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = state.projects.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.client.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 8, 6, 0.65)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh'
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          background: 'var(--card)',
          color: 'var(--color-text)',
          borderRadius: '26px',
          width: '100%',
          maxWidth: '580px',
          boxShadow: 'var(--shadow-float)',
          border: '1px solid var(--color-divider)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 16px'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-divider)'
          }}
        >
          <span style={{ color: 'var(--muted)' }}>
            <SearchIcon size={20} />
          </span>
          <input
            type="text"
            placeholder="Rechercher une action, un projet, une vue..."
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 0,
              background: 'transparent',
              color: 'var(--color-text)',
              font: 'inherit',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              background: 'var(--color-surface)',
              padding: '3px 8px',
              borderRadius: '6px',
              color: 'var(--muted)'
            }}
          >
            ÉCHAP
          </span>
        </div>

        <div
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          {filteredNav.length > 0 && (
            <>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  padding: '6px 12px'
                }}
              >
                Navigation rapide
              </span>
              {filteredNav.map(item => (
                <div
                  key={item.path}
                  onClick={() => navigateTo(item.path)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ color: 'var(--color-accent)' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </>
          )}

          {filteredProjects.length > 0 && (
            <>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                  textTransform: 'uppercase',
                  padding: '10px 12px 6px'
                }}
              >
                Projets récents
              </span>
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigateTo(`/dev/project/${p.id}`)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)' }} />
                    <strong>{p.name}</strong>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {(p.amountXof || 0).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
