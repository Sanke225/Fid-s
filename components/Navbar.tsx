'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { useToast } from './Toast';
import { BellIcon, LogoIcon, MenuIcon, MoonIcon, SearchIcon, SunIcon } from './Icons';

export function Navbar() {
  const { state, setTheme, switchRole, markAllNotificationsRead } = useRecette();
  const { showToast } = useToast();
  const pathname = usePathname();
  const router = useRouter();

  const [notifsOpen, setNotifsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isDark = state.theme === 'dark';
  const role = state.currentUser.role;
  const unreadCount = state.notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const openCmd = () => {
    window.dispatchEvent(new CustomEvent('open-cmd-palette'));
  };

  const handleRoleSwitch = (targetRole: 'dev' | 'client' | 'admin') => {
    switchRole(targetRole);
    setProfileOpen(false);
    showToast(`Passé en mode ${targetRole.toUpperCase()}`, 'success');
    if (targetRole === 'dev') router.push('/dev/dashboard');
    else if (targetRole === 'client') router.push('/client/dashboard');
    else if (targetRole === 'admin') router.push('/admin/overview');
  };

  const handleLogout = () => {
    setProfileOpen(false);
    showToast('Déconnexion effectuée', 'info');
    router.push('/');
  };

  if (pathname === '/auth') {
    return null;
  }

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, padding: '8px clamp(8px, 2.5vw, 24px) 4px', background: 'transparent' }}>
      <nav
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6px clamp(8px, 1.8vw, 14px) 6px clamp(10px, 2vw, 18px)',
          borderRadius: '999px',
          background: 'var(--glass-strong)',
          backdropFilter: 'blur(24px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Bouton Hamburger mobile */}
          {pathname.startsWith('/dev') ? (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('toggle-dev-sidebar'))}
              className="md:hidden"
              aria-label="Ouvrir le menu de navigation"
              style={{
                display: 'grid',
                placeItems: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <MenuIcon size={18} />
            </button>
          ) : (
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden"
              aria-label="Ouvrir le menu de navigation"
              style={{
                display: 'grid',
                placeItems: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <MenuIcon size={18} />
            </button>
          )}

          {/* Logo Recette */}
          <Link
            href="/"
            id="nav-logo"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text)' }}
          >
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--grad)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(255,106,0,.4)',
                flex: 'none'
              }}
            >
              <LogoIcon size={16} color="#fff" />
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', letterSpacing: '-.01em' }}>
              Recette
            </span>
            {role === 'admin' ? (
              <span className="hidden sm:inline" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: 'var(--grad)', color: '#fff' }}>
                Admin
              </span>
            ) : role === 'client' ? (
              <span className="hidden sm:inline" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' }}>
                Client
              </span>
            ) : null}
          </Link>
        </div>

        {/* Liens centraux / Fil d'Ariane */}
        <div className="hidden md:flex items-center gap-1 text-[14px]">
          {pathname.startsWith('/dev') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', fontWeight: 600, padding: '6px 14px', borderRadius: '999px', background: 'var(--color-surface)' }}>
              <span>Espace Développeur</span>
              <span style={{ opacity: 0.5 }}>/</span>
              <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
                {pathname === '/dev/dashboard'
                  ? 'Tableau de bord'
                  : pathname === '/dev/projects'
                  ? 'Mes projets'
                  : pathname === '/dev/new'
                  ? 'Nouveau projet'
                  : pathname === '/dev/payouts'
                  ? 'Moyens de réception'
                  : pathname === '/dev/invoices'
                  ? 'Factures & Reçus'
                  : pathname.startsWith('/dev/project')
                  ? 'Détail du projet'
                  : 'Dashboard'}
              </span>
            </div>
          ) : pathname.startsWith('/admin') ? (
            <Link
              href="/admin/overview"
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                textDecoration: 'none',
                color: 'var(--color-accent)',
                fontWeight: 700,
                background: 'var(--color-accent-100)'
              }}
            >
              Télémétrie Serveur
            </Link>
          ) : (
            <>
              <a
                href="/#fonctionnement"
                style={{ padding: '8px 14px', borderRadius: '999px', textDecoration: 'none', color: 'var(--color-text)' }}
              >
                Comment ça marche
              </a>
              <a
                href="/#demo"
                style={{ padding: '8px 14px', borderRadius: '999px', textDecoration: 'none', color: 'var(--color-text)' }}
              >
                Démo 3 min
              </a>
              <a
                href="/#tarifs"
                style={{ padding: '8px 14px', borderRadius: '999px', textDecoration: 'none', color: 'var(--color-text)' }}
              >
                Tarifs
              </a>
              <Link
                href="/design-system"
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  color: pathname === '/design-system' ? 'var(--color-accent)' : 'var(--color-text)'
                }}
              >
                Design System
              </Link>
            </>
          )}
        </div>

        {/* Outils de droite : Cmd+K, Thème, Notifications, Profil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Déclencheur Palette Cmd+K */}
          <button
            onClick={openCmd}
            title="Recherche rapide (⌘K)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid var(--color-divider)',
              background: 'var(--color-surface)',
              color: 'var(--muted)',
              font: 'inherit',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <SearchIcon size={14} />
            <span className="hidden sm:inline" style={{ fontFamily: 'var(--mono)', fontSize: '11px', background: 'var(--card)', padding: '2px 6px', borderRadius: '6px' }}>
              ⌘K
            </span>
          </button>

          {/* Bascule de Thème Clair / Sombre */}
          <button
            onClick={toggleTheme}
            title="Changer de thème"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1px solid var(--color-divider)',
              background: 'transparent',
              color: 'var(--color-text)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}
          >
            {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>

          {/* Centre de Notifications */}
          <div ref={notifsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifsOpen(prev => !prev)}
              title="Notifications"
              style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                border: '1px solid var(--color-divider)',
                background: 'transparent',
                color: 'var(--color-text)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              <BellIcon size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--color-accent)',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {notifsOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '320px',
                  borderRadius: '24px',
                  background: 'var(--card)',
                  boxShadow: 'var(--shadow-float)',
                  border: '1px solid var(--color-divider)',
                  padding: '14px',
                  zIndex: 60
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '14px' }}>Notifications</strong>
                  <button
                    onClick={() => {
                      markAllNotificationsRead();
                      showToast('Toutes les notifications sont lues', 'success');
                    }}
                    style={{ border: 0, background: 'transparent', color: 'var(--color-accent)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Tout lire
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {state.notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '10px',
                        borderRadius: '14px',
                        background: 'var(--color-surface)',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px'
                      }}
                    >
                      <span style={{ color: 'var(--color-text)' }}>{n.text}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '10px' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Menu Profil & Sélecteur de Rôle */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 4px',
                borderRadius: '999px',
                border: '1px solid var(--color-divider)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--color-text)',
                  color: 'var(--color-bg)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '11px'
                }}
              >
                {state.currentUser.fullName
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {state.currentUser.fullName.split(' ')[0]}
              </span>
            </button>

            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '240px',
                  borderRadius: '24px',
                  background: 'var(--card)',
                  boxShadow: 'var(--shadow-float)',
                  border: '1px solid var(--color-divider)',
                  padding: '12px',
                  zIndex: 60,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-divider)', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '14px', display: 'block' }}>{state.currentUser.fullName}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{state.currentUser.email}</span>
                </div>

                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', padding: '4px 10px' }}>
                  Changer de rôle
                </span>
                <button
                  onClick={() => handleRoleSwitch('dev')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: 0,
                    background: role === 'dev' ? 'var(--color-accent-100)' : 'transparent',
                    color: role === 'dev' ? 'var(--color-accent-800)' : 'var(--color-text)',
                    font: 'inherit',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  👨‍💻 Développeur
                </button>
                <button
                  onClick={() => handleRoleSwitch('client')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: 0,
                    background: role === 'client' ? 'var(--color-accent-100)' : 'transparent',
                    color: role === 'client' ? 'var(--color-accent-800)' : 'var(--color-text)',
                    font: 'inherit',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  🏢 Client (Mariam Traoré)
                </button>
                <button
                  onClick={() => handleRoleSwitch('admin')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '12px',
                    border: 0,
                    background: role === 'admin' ? 'var(--color-accent-100)' : 'transparent',
                    color: role === 'admin' ? 'var(--color-accent-800)' : 'var(--color-text)',
                    font: 'inherit',
                    fontSize: '13px',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  🛡️ Administrateur Systalink
                </button>

                <div style={{ borderTop: '1px solid var(--color-divider)', marginTop: '6px', paddingTop: '6px' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '12px',
                      border: 0,
                      background: 'transparent',
                      color: 'var(--danger)',
                      font: 'inherit',
                      fontSize: '13px',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Menu Drawer Mobile pour le site vitrine et pages publiques */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex'
          }}
        >
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)'
            }}
          />

          {/* Drawer Content */}
          <div
            style={{
              position: 'relative',
              width: '300px',
              maxWidth: '85vw',
              height: '100%',
              background: 'var(--card)',
              borderRight: '1px solid var(--color-divider)',
              boxShadow: 'var(--shadow-float)',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              zIndex: 101,
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    boxShadow: '0 4px 12px rgba(255,106,0,.35)'
                  }}
                >
                  <LogoIcon size={16} color="#fff" />
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px' }}>
                  Recette
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
                style={{
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-surface)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--color-text)',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Navigation
              </span>
              <a
                href="/#fonctionnement"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600 }}
              >
                Comment ça marche
              </a>
              <a
                href="/#demo"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600 }}
              >
                Démo en 3 min
              </a>
              <a
                href="/#tarifs"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600 }}
              >
                Tarifs &amp; Calculateur
              </a>
              <a
                href="/#securite"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600 }}
              >
                Sécurité &amp; Tech
              </a>
              <a
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600 }}
              >
                FAQ
              </a>
              <Link
                href="/design-system"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '14px', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', fontSize: '14px', fontWeight: 600 }}
              >
                Design System
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--color-divider)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                Espaces
              </span>
              <Link
                href="/dev/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--color-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                👨‍💻 Espace Développeur
              </Link>
              <Link
                href="/client/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--color-text)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                🏢 Portail Client
              </Link>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '999px',
                  background: 'var(--grad)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                Envoyer mon projet →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
