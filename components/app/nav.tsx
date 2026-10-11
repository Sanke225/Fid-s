import type { ReactNode } from 'react';
import { ClientsIcon, DashIcon, InvoiceIcon, LogsIcon, PlusIcon, ProjectsIcon, ShieldIcon, UserIcon, WalletIcon } from '@/components/Icons';
import type { UserRole } from '@/lib/contracts';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  /** Préfixes qui rendent l'entrée active (par défaut : href seul). */
  match?: string[];
  /** Compteur affiché à droite. */
  badge?: 'projects' | 'deliveries' | 'devDisputes' | 'clientDisputes' | 'adminFees' | 'adminDisputes';
}

export interface RoleNav {
  /** Libellé sous le logo. */
  space: string;
  home: string;
  cta?: { href: string; label: string; icon: ReactNode };
  groups: { title?: string; items: NavItem[] }[];
}

/** Menu de chaque espace : une seule source pour la colonne, le tiroir mobile et la palette Ctrl+K. */
export const NAV: Record<UserRole, RoleNav> = {
  dev: {
    space: 'Espace développeur',
    home: '/dev/dashboard',
    cta: { href: '/dev/new', label: 'Nouveau projet', icon: <PlusIcon size={18} /> },
    groups: [
      {
        items: [
          { href: '/dev/dashboard', label: 'Tableau de bord', icon: <DashIcon size={19} /> },
          { href: '/dev/projects', label: 'Projets', icon: <ProjectsIcon size={19} />, match: ['/dev/projects', '/dev/project/'], badge: 'projects' },
        ],
      },
      {
        title: 'Encaissement',
        items: [
          { href: '/dev/payouts', label: 'Moyens de paiement', icon: <WalletIcon size={19} /> },
          { href: '/dev/invoices', label: 'Factures', icon: <InvoiceIcon size={19} /> },
        ],
      },
      {
        title: 'Relation client',
        items: [
          { href: '/dev/clients', label: 'Clients', icon: <ClientsIcon size={19} /> },
          { href: '/dev/disputes', label: 'Litiges', icon: <ShieldIcon size={19} />, badge: 'devDisputes' },
        ],
      },
      { title: 'Compte', items: [{ href: '/dev/profile', label: 'Profil', icon: <UserIcon size={19} /> }] },
    ],
  },
  client: {
    space: 'Espace client',
    home: '/client/dashboard',
    cta: { href: '/client/ajouter', label: 'Ajouter une livraison', icon: <PlusIcon size={18} /> },
    groups: [
      {
        items: [
          { href: '/client/dashboard', label: 'Tableau de bord', icon: <DashIcon size={19} /> },
          { href: '/client/deliveries', label: 'Mes livraisons', icon: <ProjectsIcon size={19} />, match: ['/client/deliveries'], badge: 'deliveries' },
        ],
      },
      {
        title: 'Règlements',
        items: [
          { href: '/client/payments', label: 'Paiements', icon: <WalletIcon size={19} /> },
          { href: '/client/invoices', label: 'Factures', icon: <InvoiceIcon size={19} /> },
          { href: '/client/disputes', label: 'Litiges', icon: <ShieldIcon size={19} />, badge: 'clientDisputes' },
        ],
      },
      { title: 'Compte', items: [{ href: '/client/profile', label: 'Profil', icon: <UserIcon size={19} /> }] },
    ],
  },
  admin: {
    space: 'Administration',
    home: '/admin/overview',
    groups: [
      { items: [{ href: '/admin/overview', label: 'Vue d’ensemble', icon: <DashIcon size={19} /> }] },
      {
        title: 'À traiter',
        items: [
          { href: '/admin/fees', label: 'Frais à confirmer', icon: <WalletIcon size={19} />, badge: 'adminFees' },
          { href: '/admin/disputes', label: 'Litiges à trancher', icon: <ShieldIcon size={19} />, badge: 'adminDisputes' },
        ],
      },
      {
        title: 'Plateforme',
        items: [
          { href: '/admin/deliveries', label: 'Livraisons', icon: <ProjectsIcon size={19} /> },
          { href: '/admin/users', label: 'Utilisateurs', icon: <ClientsIcon size={19} /> },
          { href: '/admin/journal', label: 'Journal', icon: <LogsIcon size={19} /> },
        ],
      },
      { title: 'Compte', items: [{ href: '/admin/profile', label: 'Profil', icon: <UserIcon size={19} /> }] },
    ],
  },
};

export function isActive(item: NavItem, pathname: string) {
  return (item.match ?? [item.href]).some(p => pathname === p || pathname.startsWith(p.endsWith('/') ? p : `${p}/`));
}
