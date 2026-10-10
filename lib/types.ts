export type Role = 'dev' | 'client' | 'admin';

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  businessName: string;
  businessAddress: string;
  role: Role;
}

export interface PayoutAccount {
  id: string;
  provider: 'wave' | 'orange_money';
  label: string;
  phone: string;
  status: 'active' | 'pending';
  createdAt: string;
}

export type ProjectStatus =
  | 'draft'
  | 'building'
  | 'demo_ready'
  | 'paid'
  | 'handing_over'
  | 'handover_failed'
  | 'delivered'
  | 'expired'
  | 'cancelled';

export interface ProjectLog {
  seq: number;
  stream: 'system' | 'stdout' | 'stderr';
  line: string;
  at: string;
}

export interface ProjectManifest {
  version: number;
  type: string;
  nodeVersion: string;
  install?: string;
  build?: string;
  start?: string;
  port?: number;
  healthcheck?: string;
  migrate?: string;
  seedDemo?: string;
  env?: Record<string, string>;
  generate?: string[];
}

export interface Project {
  id: string;
  name: string;
  client: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  amountXof: number;
  status: ProjectStatus;
  includeSource: boolean;
  publicToken: string;
  demoUrl?: string | null;
  clientUrl?: string | null;
  clientAccessToken?: string;
  expiresInDays?: number;
  expiresAt?: string;
  createdAt: string;
  stack: string;
  manifest?: ProjectManifest;
  logs?: ProjectLog[];
  visits?: number;
  lastActivity?: string;
  invoiceNumber?: string;
  adminCredentials?: {
    email: string;
    password: string;
  };
  failureStage?: string;
  failureMessage?: string;
  deliveredAt?: string;
}

export interface ServerTelemetry {
  cpuPercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  activeDemos: number;
  maxDemos: number;
  bandwidthMbps: number;
  todayDeliveries: number;
  totalVolumeXof: number;
}

export interface WebhookAudit {
  id: string;
  provider: 'wave' | 'orange_money';
  amountXof: number;
  status: 'verified' | 'failed' | 'pending';
  transactionId: string;
  signatureValid: boolean;
  receivedAt: string;
  deliveryId: string;
  details: string;
}

export interface AppNotification {
  id: string;
  text: string;
  time: string;
  read: boolean;
}

export interface AppState {
  theme: Theme;
  currentUser: User;
  payoutAccounts: PayoutAccount[];
  projects: Project[];
  serverTelemetry: ServerTelemetry;
  webhooksAudit: WebhookAudit[];
  notifications: AppNotification[];
}
