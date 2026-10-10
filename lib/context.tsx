'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppState, Project, ProjectStatus, Role, Theme, User } from './types';
import { INITIAL_STATE, STORAGE_KEY } from './store';

interface RecetteContextType {
  state: AppState;
  setTheme: (theme: Theme) => void;
  switchRole: (role: Role) => void;
  loginCustomUser: (userData: Partial<User> & { role: Role }) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectByToken: (token: string) => Project | undefined;
  addProject: (data: {
    name: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    amountXof: number;
    includeSource: boolean;
    stack?: string;
    filename?: string;
    manifest?: any;
  }) => Project;
  updateProjectStatus: (id: string, status: ProjectStatus, extra?: Partial<Project>) => void;
  appendLog: (projectId: string, stream: 'system' | 'stdout' | 'stderr', line: string) => void;
  simulateBuildProcess: (
    projectId: string,
    onProgress?: (step: number, total: number, line: string) => void,
    onComplete?: () => void
  ) => void;
  simulateHandover: (
    projectId: string,
    onStepUpdate?: (step: number, total: number, title: string, detail: string) => void,
    onComplete?: () => void
  ) => void;
  addNotification: (text: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefault: () => void;
}

const RecetteContext = createContext<RecetteContextType | undefined>(undefined);

export function RecetteProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [mounted, setMounted] = useState(false);

  // Charger l'état depuis le localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(parsed);
        document.documentElement.setAttribute('data-theme', parsed.theme || 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {
      console.warn('Erreur chargement localStorage:', e);
    }
    setMounted(true);
  }, []);

  // Synchroniser le localStorage
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      document.documentElement.setAttribute('data-theme', state.theme);
    } catch (e) {
      console.warn('Erreur sauvegarde localStorage:', e);
    }
  }, [state, mounted]);

  const setTheme = (theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
  };

  const switchRole = (role: Role) => {
    let currentUser: User;
    if (role === 'dev') {
      currentUser = {
        id: 'usr_dev_01',
        email: 'yannick@lagune.ci',
        fullName: 'Yannick Kouassi',
        phone: '+225 07 08 45 67 12',
        businessName: 'Lagune Digital Studio',
        businessAddress: 'Cocody Riviera 3, Abidjan',
        role: 'dev'
      };
    } else if (role === 'client') {
      currentUser = {
        id: 'usr_client_01',
        email: 'mariam@kanaga.ci',
        fullName: 'Mariam Traoré',
        phone: '+225 05 44 12 89 30',
        businessName: 'Boutique Kanaga SARL',
        businessAddress: 'Commerce, Bouaké',
        role: 'client'
      };
    } else {
      currentUser = {
        id: 'usr_admin_01',
        email: 'ops@systalink.ci',
        fullName: 'Administrateur Systalink',
        phone: '+225 07 00 00 00 00',
        businessName: 'Systalink Cloud & Infrastructure',
        businessAddress: 'Plateau, Immeuble CCIA, Abidjan',
        role: 'admin'
      };
    }
    setState(prev => ({ ...prev, currentUser }));
  };

  const loginCustomUser = (userData: Partial<User> & { role: Role }) => {
    const base = userData.role === 'dev'
      ? {
          id: 'usr_dev_' + Date.now().toString(36),
          email: userData.email || 'yannick@lagune.ci',
          fullName: userData.fullName || 'Développeur Recette',
          phone: userData.phone || '+225 07 00 00 00 00',
          businessName: userData.businessName || 'Studio Digital',
          businessAddress: 'Abidjan, Côte d’Ivoire',
          role: 'dev' as Role
        }
      : userData.role === 'client'
      ? {
          id: 'usr_client_' + Date.now().toString(36),
          email: userData.email || 'client@entreprise.ci',
          fullName: userData.fullName || 'Client Partenaire',
          phone: userData.phone || '+225 05 00 00 00 00',
          businessName: userData.businessName || 'Entreprise Client',
          businessAddress: 'Abidjan, Côte d’Ivoire',
          role: 'client' as Role
        }
      : {
          id: 'usr_admin_' + Date.now().toString(36),
          email: userData.email || 'admin@systalink.ci',
          fullName: userData.fullName || 'Superviseur Ops',
          phone: userData.phone || '+225 01 00 00 00 00',
          businessName: 'Systalink Recette Ops',
          businessAddress: 'Plateau CCIA, Abidjan',
          role: 'admin' as Role
        };
    const merged: User = { ...base, ...userData };
    setState(prev => ({ ...prev, currentUser: merged }));
  };

  const getProjectById = (id: string) => {
    return state.projects.find(p => p.id === id);
  };

  const getProjectByToken = (token: string) => {
    return state.projects.find(p => p.publicToken === token);
  };

  const addProject = (data: {
    name: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    amountXof: number;
    includeSource: boolean;
    stack?: string;
    filename?: string;
    manifest?: any;
  }) => {
    const id = 'prj_' + Date.now().toString(36);
    const publicToken = 'd-' + Math.random().toString(36).substring(2, 10);
    const clientAccessToken = 'acc_' + Math.random().toString(36).substring(2, 10);

    const project: Project = {
      id,
      name: data.name,
      client: {
        name: data.clientName,
        email: data.clientEmail || null,
        phone: data.clientPhone || null
      },
      amountXof: Number(data.amountXof) || 100000,
      status: 'building',
      includeSource: !!data.includeSource,
      publicToken,
      demoUrl: null,
      clientUrl: null,
      clientAccessToken,
      expiresInDays: 30,
      createdAt: new Date().toISOString(),
      stack: data.stack || 'Node.js 22 + React + PostgreSQL',
      manifest: data.manifest || {
        version: 1,
        type: 'node',
        nodeVersion: '22',
        install: 'npm ci',
        build: 'npm run build',
        start: 'node server.js',
        port: 3000,
        healthcheck: '/health'
      },
      logs: [
        { seq: 1, stream: 'system', line: `Archive reçue : ${data.filename || 'source.zip'}`, at: new Date().toLocaleTimeString() },
        { seq: 2, stream: 'system', line: 'Chiffrement de sécurité AES-256-GCM effectué', at: new Date().toLocaleTimeString() }
      ],
      visits: 0,
      lastActivity: 'Installation lancée'
    };

    setState(prev => ({
      ...prev,
      projects: [project, ...prev.projects]
    }));

    return project;
  };

  const updateProjectStatus = (id: string, status: ProjectStatus, extra: Partial<Project> = {}) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, status, ...extra } : p))
    }));
  };

  const appendLog = (projectId: string, stream: 'system' | 'stdout' | 'stderr', line: string) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== projectId) return p;
        const currentLogs = p.logs || [];
        return {
          ...p,
          logs: [
            ...currentLogs,
            {
              seq: currentLogs.length + 1,
              stream,
              line,
              at: new Date().toLocaleTimeString()
            }
          ]
        };
      })
    }));
  };

  const simulateBuildProcess = (
    projectId: string,
    onProgress?: (step: number, total: number, line: string) => void,
    onComplete?: () => void
  ) => {
    const proj = getProjectById(projectId);
    if (!proj) return;

    updateProjectStatus(projectId, 'building');

    const steps = [
      { stream: 'system' as const, line: 'Extraction de l’archive dans sandbox mémoire temporaire...', delay: 800 },
      { stream: 'system' as const, line: 'Validation du fichier recette.json : configuration valide', delay: 1000 },
      { stream: 'stdout' as const, line: '> npm ci', delay: 1300 },
      { stream: 'stdout' as const, line: 'added 284 packages in 2.812s', delay: 1700 },
      { stream: 'stdout' as const, line: '> npm run build', delay: 2100 },
      { stream: 'stdout' as const, line: 'vite v5.4.0 building for production... ✓ built in 1.4s', delay: 2600 },
      { stream: 'system' as const, line: 'Empaquetage de l’image conteneur durci (sans privilège)', delay: 3100 },
      { stream: 'stdout' as const, line: `Création du réseau isolé rct_${projectId.slice(-6)}`, delay: 3500 },
      { stream: 'stdout' as const, line: `Création base démo Postgres sp_${Math.random().toString(36).substring(2, 8)}`, delay: 3900 },
      { stream: 'stdout' as const, line: 'Exécution des migrations et du jeu de données de démo', delay: 4400 },
      { stream: 'system' as const, line: 'Contrôle de santé /health : HTTP 200 OK en 14ms', delay: 4900 },
      { stream: 'system' as const, line: `Démo en ligne disponible : https://${proj.publicToken}.demo.recette.ci`, delay: 5400 }
    ];

    let current = 0;
    const runNext = () => {
      if (current < steps.length) {
        const step = steps[current];
        setTimeout(() => {
          appendLog(projectId, step.stream, step.line);
          onProgress?.(current + 1, steps.length, step.line);
          current++;
          runNext();
        }, step.delay);
      } else {
        updateProjectStatus(projectId, 'demo_ready', {
          demoUrl: `https://${proj.publicToken}.demo.recette.ci`,
          lastActivity: 'Démo active et prête au paiement'
        });
        addNotification(`L'application "${proj.name}" a été installée avec succès. La démo est en ligne !`);
        onComplete?.();
      }
    };

    runNext();
  };

  const simulateHandover = (
    projectId: string,
    onStepUpdate?: (step: number, total: number, title: string, detail: string) => void,
    onComplete?: () => void
  ) => {
    const proj = getProjectById(projectId);
    if (!proj) return;

    updateProjectStatus(projectId, 'handing_over');

    const handoverSteps = [
      { num: 1, title: 'Vérification de la confirmation Mobile Money', detail: 'Signature webhook & unicité validées' },
      { num: 2, title: 'Réservation de l’adresse client', detail: `Attribution de ${proj.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.app.recette.ci` },
      { num: 3, title: 'Provisionnement de la base de données client', detail: 'Création base vierge PostgreSQL & rôle isolé' },
      { num: 4, title: 'Exécution des migrations sur base propre', detail: 'Application du schéma sans données de démo' },
      { num: 5, title: 'Lancement du conteneur de production', detail: 'Conteneur durci en lecture seule avec /tmp en mémoire' },
      { num: 6, title: 'Contrôle de santé du nouvel espace', detail: 'Réponse HTTP 200 sur le chemin /health confirmée' },
      { num: 7, title: 'Sauvegarde chiffrée initiale', detail: 'Export pg_dump chiffré AES-256 et stocké hors serveur' },
      { num: 8, title: 'Émission de la facture et remise des accès', detail: 'Génération du reçu officiel et destruction de la démo' }
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < handoverSteps.length) {
        const s = handoverSteps[stepIndex];
        onStepUpdate?.(s.num, handoverSteps.length, s.title, s.detail);
        stepIndex++;
      } else {
        clearInterval(interval);
        const slug = proj.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app';
        const clientUrl = `https://${slug}.app.recette.ci`;
        const invoiceNum = 'RCT-2026-000' + Math.floor(100 + Math.random() * 900);
        const adminPass = 'Pass_' + Math.random().toString(36).substring(2, 8).toUpperCase() + '99!';

        updateProjectStatus(projectId, 'delivered', {
          clientUrl,
          invoiceNumber: invoiceNum,
          adminCredentials: {
            email: proj.client.email || 'admin@client.ci',
            password: adminPass
          },
          deliveredAt: new Date().toISOString(),
          lastActivity: 'Livraison achevée et accès débloqués'
        });

        // Ajouter audit webhook
        setState(prev => ({
          ...prev,
          webhooksAudit: [
            {
              id: 'wh_evt_' + Date.now().toString(36),
              provider: 'wave',
              amountXof: proj.amountXof,
              status: 'verified',
              transactionId: 'TX_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
              signatureValid: true,
              receivedAt: new Date().toISOString(),
              deliveryId: proj.id,
              details: 'Passation terminée avec succès'
            },
            ...prev.webhooksAudit
          ]
        }));

        addNotification(`Paiement de ${proj.amountXof.toLocaleString('fr-FR')} FCFA reçu pour "${proj.name}". Application livrée au client !`);
        onComplete?.();
      }
    }, 1100);
  };

  const addNotification = (text: string) => {
    setState(prev => ({
      ...prev,
      notifications: [
        {
          id: 'notif_' + Date.now(),
          text,
          time: 'À l’instant',
          read: false
        },
        ...prev.notifications
      ]
    }));
  };

  const markAllNotificationsRead = () => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
    }));
  };

  const resetToDefault = () => {
    setState(INITIAL_STATE);
  };

  return (
    <RecetteContext.Provider
      value={{
        state,
        setTheme,
        switchRole,
        loginCustomUser,
        getProjectById,
        getProjectByToken,
        addProject,
        updateProjectStatus,
        appendLog,
        simulateBuildProcess,
        simulateHandover,
        addNotification,
        markAllNotificationsRead,
        resetToDefault
      }}
    >
      {children}
    </RecetteContext.Provider>
  );
}

export function useRecette() {
  const context = useContext(RecetteContext);
  if (!context) {
    throw new Error('useRecette must be used within a RecetteProvider');
  }
  return context;
}
