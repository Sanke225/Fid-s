'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { BrandSymbol, BrandWordmark } from '@/components/Brand';
import { CloseIcon, ExternalIcon, MenuIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon } from '@/components/Icons';
import { BRAND } from '@/components/landing/data';
import { EASE } from '@/components/motion/easing';
import { authClient } from '@/lib/auth-client';
import type { UserRole } from '@/lib/contracts';
import { ROLE_LABEL, initials, useMe } from '@/lib/queries/me';
import { useProjects } from '@/lib/queries/projects';
import { useClientDeliveries, useClientTickets } from '@/lib/queries/client';
import { useDevTickets } from '@/lib/queries/tickets';
import { useAdminStats } from '@/lib/queries/admin';
import { clientAction } from '@/lib/client-ui';
import { useTheme } from '@/lib/theme';
import { NAV, isActive, type NavItem } from './nav';
import { NotificationBell } from './NotificationBell';

/**
 * Coque des espaces connectés (dev, client, admin) : colonne de navigation à gauche,
 * barre fine en haut (recherche, thème), tiroir sur mobile. Remplace Navbar + DevSidebar.
 */
export function AppShell({ role, children }: { role: UserRole; children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const drawerId = useId();

  // Tiroir ouvert : Échap le ferme et la page derrière ne défile plus.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  return (
    <div className="fd-ui flex min-h-svh bg-f-bg text-f-text">
      <a href="#contenu-app" className="skip-link">Aller au contenu</a>

      <aside className="sticky top-0 hidden h-svh w-[264px] shrink-0 border-r border-f-line bg-f-card/70 lg:block">
        <Sidebar role={role} />
      </aside>

      <AnimatePresence>
        {drawer ? (
          <>
            <motion.div
              key="voile"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              key="tiroir"
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
              className="fixed inset-y-0 left-0 z-50 w-[min(86vw,300px)] border-r border-f-line bg-f-card shadow-f-float lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="Fermer le menu"
                className="absolute right-3 top-4 grid size-9 place-items-center rounded-full text-f-muted hover:bg-f-surface hover:text-f-text"
              >
                <CloseIcon size={18} />
              </button>
              <Sidebar role={role} onNavigate={() => setDrawer(false)} autoFocus />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar role={role} onMenu={() => setDrawer(true)} drawerOpen={drawer} drawerId={drawerId} />
        <div id="contenu-app" className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function Logo({ role }: { role: UserRole }) {
  return (
    <Link href={NAV[role].home} className="flex items-center gap-2.5 rounded-xl">
      <BrandSymbol size={36} className="shrink-0" />
      <span className="leading-tight">
        <BrandWordmark height={18} className="block" />
        <span className="mt-1 block text-[11.5px] font-semibold text-f-muted">{NAV[role].space}</span>
      </span>
    </Link>
  );
}

function Sidebar({ role, onNavigate, autoFocus }: { role: UserRole; onNavigate?: () => void; autoFocus?: boolean }) {
  const pathname = usePathname();
  const nav = NAV[role];
  const { data: projects } = useProjects({ enabled: role === 'dev' });
  const { data: clientDeliveries } = useClientDeliveries({ enabled: role === 'client' });
  // Client : nombre de livraisons qui attendent une action de sa part.
  const toAct = clientDeliveries?.filter(d => clientAction(d)?.urgent).length ?? 0;
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (autoFocus) firstLink.current?.focus();
  }, [autoFocus]);

  const { data: devTickets } = useDevTickets({ enabled: role === 'dev' });
  const { data: clientTickets } = useClientTickets({ enabled: role === 'client' });
  const { data: adminStats } = useAdminStats({ enabled: role === 'admin' });

  const counts: Record<NonNullable<NavItem['badge']>, number> = {
    projects: projects?.length ?? 0,
    deliveries: toAct,
    devDisputes: devTickets?.filter(t => t.status === 'awaiting_dev').length ?? 0,
    clientDisputes: clientTickets?.filter(t => t.status === 'open' || t.status === 'awaiting_dev').length ?? 0,
    adminFees: adminStats?.todo.feesToConfirm ?? 0,
    adminDisputes: adminStats?.todo.ticketsToDecide ?? 0,
  };
  const badge = (kind?: NavItem['badge']) => (kind ? counts[kind] || null : null);

  return (
    <nav aria-label="Navigation principale" className="flex h-full flex-col px-4 pb-4 pt-5">
      <div className="px-1">
        <Logo role={role} />
      </div>

      {nav.cta ? (
        <Link
          ref={firstLink}
          href={nav.cta.href}
          onClick={onNavigate}
          className="cta-primary mt-6 h-11 w-full rounded-xl text-[14.5px]"
        >
          {nav.cta.icon} {nav.cta.label}
        </Link>
      ) : null}

      <div className="mt-6 flex-1 space-y-6 overflow-y-auto">
        {nav.groups.map((g, gi) => (
          <div key={g.title ?? gi}>
            {g.title ? <p className="mb-2 px-3 text-[11.5px] font-bold uppercase tracking-[.12em] text-f-muted">{g.title}</p> : null}
            <ul className="space-y-0.5">
              {g.items.map((item, ii) => {
                const active = isActive(item, pathname);
                const count = badge(item.badge);
                return (
                  <li key={item.href}>
                    <Link
                      ref={!nav.cta && gi === 0 && ii === 0 ? firstLink : undefined}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                        active ? 'bg-[var(--color-accent-100)] font-semibold text-f-ink-accent' : 'text-f-text hover:bg-f-surface'
                      }`}
                    >
                      <span className={active ? 'text-f-ink-accent' : 'text-f-muted group-hover:text-f-text'}>{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {count ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold tabular-nums ${active ? 'bg-[#C84A00] text-white' : 'bg-f-surface text-f-muted'}`}>
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <UserMenu />
    </nav>
  );
}

function UserMenu() {
  const { data: me } = useMe();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const logout = async () => {
    setOpen(false);
    await authClient.signOut();
    queryClient.clear();
    router.push('/connexion');
    router.refresh();
  };

  return (
    <div ref={ref} className="relative mt-4 border-t border-f-line pt-4">
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-f-line bg-f-card p-1.5 shadow-f-float"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-[13.5px] font-semibold">{me?.email}</p>
              {me?.role ? <p className="text-[12px] text-f-muted">Compte {ROLE_LABEL[me.role].toLowerCase()}</p> : null}
            </div>
            <div className="my-1 h-px bg-f-line" />
            <Link href="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] hover:bg-f-surface">
              <ExternalIcon size={16} className="text-f-muted" /> Site vitrine
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-semibold text-[var(--danger-800)] hover:bg-[var(--danger-100)]"
            >
              <CloseIcon size={16} /> Se déconnecter
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Menu du compte"
        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-f-surface"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-f-text text-[12.5px] font-bold text-f-bg">
          {initials(me?.name) || '·'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold">{me?.name ?? ' '}</span>
          <span className="block truncate text-[12px] text-f-muted">{me?.role ? ROLE_LABEL[me.role] : ' '}</span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden className={`shrink-0 text-f-muted transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}

function TopBar({ role, onMenu, drawerOpen, drawerId }: { role: UserRole; onMenu: () => void; drawerOpen: boolean; drawerId: string }) {
  const { isDark, toggleTheme } = useTheme();
  const cta = NAV[role].cta;
  const openPalette = () => window.dispatchEvent(new CustomEvent('open-cmd-palette'));

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-f-line bg-f-bg/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Ouvrir le menu"
        aria-expanded={drawerOpen}
        aria-controls={drawerId}
        className="grid size-10 place-items-center rounded-xl text-f-text hover:bg-f-surface lg:hidden"
      >
        <MenuIcon size={20} />
      </button>
      <div className="lg:hidden">
        <Link href={NAV[role].home} aria-label={`${BRAND}, accueil de l’espace`} className="grid size-10 place-items-center rounded-xl text-f-text hover:bg-f-surface">
          <BrandSymbol size={32} />
        </Link>
      </div>

      {/* Mobile : icône seule ; à partir de sm : vrai champ de recherche avec raccourci. */}
      <button
        type="button"
        onClick={openPalette}
        aria-label="Rechercher (Ctrl K)"
        className="grid size-10 place-items-center rounded-xl text-f-text hover:bg-f-surface sm:flex sm:h-10 sm:w-auto sm:min-w-0 sm:max-w-md sm:flex-1 sm:items-center sm:justify-start sm:gap-2.5 sm:border sm:border-f-line sm:bg-f-card sm:px-3 sm:text-left sm:text-[14px] sm:text-f-muted sm:hover:border-[var(--color-accent-300)] sm:hover:bg-f-card"
      >
        <SearchIcon size={17} />
        <span aria-hidden className="hidden flex-1 truncate sm:block">{role === 'dev' ? 'Rechercher un projet, une page…' : 'Rechercher une page…'}</span>
        <kbd className="hidden rounded-md border border-f-line bg-f-surface px-1.5 py-0.5 font-sans text-[11.5px] sm:inline">Ctrl K</kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {cta ? (
          <Link href={cta.href} aria-label={cta.label} className="cta-primary size-10 rounded-xl lg:hidden">
            <PlusIcon size={18} />
          </Link>
        ) : null}
        <NotificationBell />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="grid size-10 place-items-center rounded-xl text-f-text hover:bg-f-surface"
        >
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>
    </header>
  );
}
