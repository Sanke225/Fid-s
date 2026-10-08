import { AppState, Project, Role, Theme } from './types';

export const INITIAL_STATE: AppState = {
  theme: 'light',
  currentUser: {
    id: 'usr_dev_01',
    email: 'yannick@lagune.ci',
    fullName: 'Yannick Kouassi',
    phone: '+225 07 08 45 67 12',
    businessName: 'Lagune Digital Studio',
    businessAddress: 'Cocody Riviera 3, Abidjan',
    role: 'dev'
  },
  payoutAccounts: [
    {
      id: 'po_wave_01',
      provider: 'wave',
      label: 'Compte Wave Marchand',
      phone: '+225 07 08 45 67 12',
      status: 'active',
      createdAt: '2026-09-15T10:00:00Z'
    },
    {
      id: 'po_om_01',
      provider: 'orange_money',
      label: 'Orange Money Business',
      phone: '+225 07 55 90 12 34',
      status: 'active',
      createdAt: '2026-09-20T14:30:00Z'
    }
  ],
  projects: [
    {
      id: 'prj_01',
      name: 'Boutique Kanaga - Caisse & Stock',
      client: {
        name: 'Mariam Traoré',
        email: 'mariam@kanaga.ci',
        phone: '+225 05 44 12 89 30'
      },
      amountXof: 450000,
      status: 'demo_ready',
      includeSource: true,
      publicToken: 'd-kanaga26',
      demoUrl: 'https://d-kanaga26.demo.recette.ci',
      clientUrl: null,
      clientAccessToken: 'acc_kanaga_88',
      expiresInDays: 24,
      expiresAt: '2026-10-30T18:00:00Z',
      createdAt: '2026-10-02T11:20:00Z',
      stack: 'Node.js 22 + React + PostgreSQL',
      manifest: {
        version: 1,
        type: 'node',
        nodeVersion: '22',
        install: 'npm ci',
        build: 'npm run build',
        start: 'node dist/server.js',
        port: 3000,
        healthcheck: '/health',
        migrate: 'npm run migrate',
        seedDemo: 'npm run seed:demo',
        env: { NODE_ENV: 'production', STORE_NAME: 'Boutique Kanaga' },
        generate: ['SESSION_SECRET', 'JWT_SECRET']
      },
      logs: [
        { seq: 1, stream: 'system', line: 'Réception de l’archive source kanaga-v1.zip (14.2 Mo)', at: '11:20:01' },
        { seq: 2, stream: 'system', line: 'Contrôle intégrité SHA256 & chiffrement AES-256-GCM validé', at: '11:20:02' },
        { seq: 3, stream: 'system', line: 'Manifeste recette.json validé avec succès', at: '11:20:03' },
        { seq: 4, stream: 'stdout', line: 'npm ci --prefer-offline [342 packages installés en 4.2s]', at: '11:20:08' },
        { seq: 5, stream: 'stdout', line: 'npm run build -> Vite v5.4 compilation production terminée', at: '11:20:14' },
        { seq: 6, stream: 'stdout', line: 'Conteneur durci provisionné (512 Mo RAM, 0.5 CPU, sandbox)', at: '11:20:16' },
        { seq: 7, stream: 'stdout', line: 'Base PostgreSQL démo créée : sp_7f1c29b4e10a', at: '11:20:18' },
        { seq: 8, stream: 'stdout', line: 'Migrations appliquées + npm run seed:demo exécuté', at: '11:20:20' },
        { seq: 9, stream: 'system', line: 'Healthcheck /health HTTP 200 OK en 18ms', at: '11:20:21' },
        { seq: 10, stream: 'system', line: 'Démo active en ligne sur https://d-kanaga26.demo.recette.ci', at: '11:20:22' }
      ],
      visits: 42,
      lastActivity: 'Démo consultée il y a 25 min'
    },
    {
      id: 'prj_02',
      name: 'Ivoire Express - Suivi Livraison',
      client: {
        name: 'Pharmacie Les Palmiers',
        email: 'direction@palmiers.ci',
        phone: '+225 07 11 22 33 44'
      },
      amountXof: 850000,
      status: 'delivered',
      includeSource: true,
      publicToken: 'd-ivoirexp',
      demoUrl: null,
      clientUrl: 'https://palmiers.app.recette.ci',
      clientAccessToken: 'acc_palmiers_99',
      invoiceNumber: 'RCT-2026-000001',
      adminCredentials: {
        email: 'admin@palmiers.ci',
        password: 'RCT_palmiers2026!'
      },
      deliveredAt: '2026-10-04T15:12:00Z',
      createdAt: '2026-09-28T09:00:00Z',
      stack: 'React + Node.js 24 + PostgreSQL',
      manifest: {
        version: 1,
        type: 'node',
        nodeVersion: '24',
        install: 'pnpm install',
        start: 'node server.js',
        port: 4000,
        healthcheck: '/health'
      },
      logs: [
        { seq: 1, stream: 'system', line: 'Paiement Wave de 850 000 FCFA confirmé', at: '15:10:02' },
        { seq: 2, stream: 'system', line: 'Passation automatique déclenchée', at: '15:10:04' },
        { seq: 3, stream: 'system', line: 'Espace client créé : https://palmiers.app.recette.ci', at: '15:11:30' },
        { seq: 4, stream: 'system', line: 'Facture RCT-2026-000001 émise et démo purgée', at: '15:12:00' }
      ],
      visits: 89,
      lastActivity: 'Livré et sauvegardé'
    },
    {
      id: 'prj_03',
      name: 'Démo Express 3 minutes',
      client: {
        name: 'Client Test Démo',
        email: 'test@demo.ci',
        phone: '+225 07 00 00 01 00'
      },
      amountXof: 100,
      status: 'demo_ready',
      includeSource: true,
      publicToken: 'd-demo100f',
      demoUrl: 'https://d-demo100f.demo.recette.ci',
      clientUrl: null,
      clientAccessToken: 'acc_demo_100',
      expiresInDays: 30,
      createdAt: '2026-10-06T08:00:00Z',
      stack: 'Node.js 22 + React + Postgres',
      manifest: {
        version: 1,
        type: 'node',
        nodeVersion: '22',
        install: 'npm ci',
        start: 'node dist/index.js',
        port: 3000,
        healthcheck: '/health'
      },
      logs: [
        { seq: 1, stream: 'system', line: 'App témoin chargée pour simulation démo 3 minutes', at: '08:00:01' },
        { seq: 2, stream: 'system', line: 'Montant fixé au seuil de test : 100 FCFA', at: '08:00:02' },
        { seq: 3, stream: 'system', line: 'Démo active prête pour le paiement', at: '08:00:03' }
      ],
      visits: 12,
      lastActivity: 'Prêt pour test paiement'
    },
    {
      id: 'prj_04',
      name: 'Portail Scolaire Les Lauriers',
      client: {
        name: 'Groupe scolaire Les Lauriers',
        email: 'info@lauriers.edu.ci',
        phone: '+225 01 02 03 04 05'
      },
      amountXof: 1200000,
      status: 'handover_failed',
      includeSource: false,
      publicToken: 'd-lauriers26',
      demoUrl: 'https://d-lauriers26.demo.recette.ci',
      clientUrl: null,
      clientAccessToken: 'acc_lauriers_55',
      expiresInDays: 19,
      createdAt: '2026-09-30T16:45:00Z',
      stack: 'React + Node.js 22',
      failureStage: 'migrate',
      failureMessage: 'Erreur lors de la migration initiale sur base vide (timeout 90s). Relance admin disponible.',
      logs: [
        { seq: 1, stream: 'system', line: 'Paiement Wave de 1 200 000 FCFA reçu', at: '17:00:10' },
        { seq: 2, stream: 'stderr', line: 'Erreur migration : connect ECONNREFUSED postgres_tenant', at: '17:01:40' },
        { seq: 3, stream: 'system', line: 'Alerte administrateur émise : passation en attente de relance', at: '17:01:45' }
      ],
      visits: 34,
      lastActivity: 'Passation bloquée - relançable'
    },
    {
      id: 'prj_05',
      name: 'Gestion Hôtel Grand Bassam',
      client: {
        name: 'Bassam Resorts SARL',
        email: 'hotel@bassam-resort.ci',
        phone: '+225 05 99 88 77 66'
      },
      amountXof: 650000,
      status: 'building',
      includeSource: true,
      publicToken: 'd-bassam99',
      demoUrl: null,
      clientUrl: null,
      expiresInDays: 30,
      createdAt: '2026-10-06T14:10:00Z',
      stack: 'Node.js 24 + Postgres',
      logs: [
        { seq: 1, stream: 'system', line: 'Déballage de l’archive en mémoire temporaire', at: '14:10:02' },
        { seq: 2, stream: 'stdout', line: 'npm ci en cours dans conteneur de construction isolé...', at: '14:10:08' }
      ],
      visits: 3,
      lastActivity: 'Installation en cours'
    }
  ],
  serverTelemetry: {
    cpuPercent: 28,
    ramUsedGb: 4.3,
    ramTotalGb: 8.0,
    diskUsedGb: 33.6,
    diskTotalGb: 80.0,
    activeDemos: 4,
    maxDemos: 20,
    bandwidthMbps: 48.5,
    todayDeliveries: 3,
    totalVolumeXof: 3150100
  },
  webhooksAudit: [
    {
      id: 'wh_evt_901',
      provider: 'wave',
      amountXof: 850000,
      status: 'verified',
      transactionId: 'WAV_TX_88192039',
      signatureValid: true,
      receivedAt: '2026-10-04T15:10:02Z',
      deliveryId: 'prj_02',
      details: 'Paiement exact vérifié, signature HMAC-SHA256 valide, déblocage prononcé'
    },
    {
      id: 'wh_evt_902',
      provider: 'wave',
      amountXof: 1200000,
      status: 'verified',
      transactionId: 'WAV_TX_99281726',
      signatureValid: true,
      receivedAt: '2026-10-05T17:00:10Z',
      deliveryId: 'prj_04',
      details: 'Paiement reçu, passation en cours'
    },
    {
      id: 'wh_evt_903',
      provider: 'orange_money',
      amountXof: 100,
      status: 'verified',
      transactionId: 'OM_TX_00192837',
      signatureValid: true,
      receivedAt: '2026-10-06T09:15:22Z',
      deliveryId: 'prj_03',
      details: 'Simulation test 100 FCFA reçue'
    }
  ],
  notifications: [
    { id: 'notif_1', text: 'Paiement Wave de 850 000 FCFA reçu pour Ivoire Express', time: 'Il y a 2 jours', read: false },
    { id: 'notif_2', text: 'Boutique Kanaga : démo consultée 8 fois aujourd’hui', time: 'Il y a 3 heures', read: false },
    { id: 'notif_3', text: 'Sauvegarde nocturne chiffrée réussie (3 bases)', time: 'Hier à 03:00', read: true }
  ]
};

export const STORAGE_KEY = 'recette_app_state_v2';
