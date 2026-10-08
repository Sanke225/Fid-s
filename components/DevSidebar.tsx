'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRecette } from '@/lib/context';
import {
  DashIcon,
  ProjectsIcon,
  PlusIcon,
  WalletIcon,
  InvoiceIcon,
  ClientsIcon,
  ExternalIcon,
  LogoIcon
} from '@/components/Icons';

export function DevSidebar() {
  const pathname = usePathname();
  const { state } = useRecette();
  const [mobileOpen, setMobileOpen] = useState(false);

  const projectsCount = state.projects.length;
  const deliveredCount = state.projects.filter(p => p.status === 'delivered').length;

  // Écouter les événements d'ouverture du menu mobile depuis la Navbar
  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('toggle-dev-sidebar', handleToggle);
    window.addEventListener('close-dev-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-dev-sidebar', handleToggle);
      window.removeEventListener('close-dev-sidebar', handleClose);
    };
  }, []);

  // Fermer la sidebar sur mobile lors d'un changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navGroups = [
    {
      title: 'Pilotage',
      items: [
        {
          href: '/dev/dashboard',
          label: 'Tableau de bord',
          icon: <DashIcon size={19} />,
          badge: null
        },
        {
          href: '/dev/projects',
          label: 'Mes projets',
          icon: <ProjectsIcon size={19} />,
          badge: projectsCount > 0 ? String(projectsCount) : null
        },
        {
          href: '/dev/new',
          label: 'Nouveau projet',
          icon: <PlusIcon size={19} />,
          badge: null,
          highlight: true
        }
      ]
    },
    {
      title: 'Finances & Encaissement',
      items: [
        {
          href: '/dev/payouts',
          label: 'Moyens de réception',
          icon: <WalletIcon size={19} />,
          badge: 'Wave / OM'
        },
        {
          href: '/dev/invoices',
          label: 'Factures & Reçus',
          icon: <InvoiceIcon size={19} />,
          badge: deliveredCount > 0 ? String(deliveredCount) : null
        }
      ]
    },
    {
      title: 'Navigation externe',
      items: [
        {
          href: '/client/dashboard',
          label: 'Espace Client (Test)',
          icon: <ClientsIcon size={19} />,
          badge: null
        },
        {
          href: '/',
          label: 'Site vitrine',
          icon: <ExternalIcon size={19} />,
          badge: null
        }
      ]
    }
  ];

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px 16px',
        gap: '24px',
        overflowY: 'auto'
      }}
    >
      {/* En-tête de la Sidebar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--grad)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(255,106,0,.35)',
              flexShrink: 0
            }}
          >
            <LogoIcon size={16} color="#fff" />
          </span>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', lineHeight: 1.1 }}>
              Recette
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Espace Développeur
            </div>
          </div>
        </div>

        {/* Bouton fermeture sur mobile */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'grid',
              placeItems: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--color-divider)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Bouton d'action CTA : Créer un projet */}
      <Link
        href="/dev/new"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '999px',
          background: 'var(--grad)',
          color: '#fff',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 700,
          boxShadow: '0 6px 18px rgba(255,106,0,.28)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
      >
        <PlusIcon size={18} color="#fff" />
        <span>Nouveau projet</span>
      </Link>

      {/* Groupes de navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '.06em',
                padding: '4px 10px'
              }}
            >
              {group.title}
            </span>

            {group.items.map(item => {
              const isActive = pathname === item.href || (item.href !== '/dev/dashboard' && item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-accent-800)' : 'var(--color-text)',
                    background: isActive ? 'var(--color-accent-100)' : 'transparent',
                    border: isActive ? '1px solid var(--color-accent-200)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        color: isActive ? 'var(--color-accent)' : 'var(--muted)'
                      }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: isActive ? 'var(--color-accent)' : 'var(--color-neutral-300)',
                        color: isActive ? '#fff' : 'var(--color-text)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bas de sidebar : Profil & statut */}
      <div
        style={{
          padding: '12px',
          borderRadius: '18px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: '12px',
            flexShrink: 0
          }}
        >
          {state.currentUser.fullName
            .split(' ')
            .map(n => n[0])
            .join('')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {state.currentUser.fullName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--muted)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
            <span>Développeur vérifié</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* SIDEBAR DESKTOP (Fixe à gauche) */}
      <aside
        className="hidden md:block"
        style={{
          width: '260px',
          flexShrink: 0,
          position: 'sticky',
          top: '68px',
          height: 'calc(100vh - 68px)',
          background: 'var(--card)',
          borderRight: '1px solid var(--color-divider)',
          zIndex: 30
        }}
      >
        {sidebarContent}
      </aside>

      {/* SIDEBAR MOBILE (Drawer coulissant) */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex'
          }}
        >
          {/* Overlay flou */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          {/* Tiroir */}
          <div
            style={{
              position: 'relative',
              width: '280px',
              maxWidth: '85vw',
              height: '100%',
              background: 'var(--card)',
              borderRight: '1px solid var(--color-divider)',
              boxShadow: 'var(--shadow-float)',
              zIndex: 101,
              animation: 'slideInLeft 0.25s ease-out'
            }}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
