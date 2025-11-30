export type ConnectionStatus = 'connected' | 'needs_attention' | 'disconnected' | 'syncing';

export interface SyncStatus {
  lastSuccessfulSync: string | null;
  nextScheduledSync: string | null;
  errorMessage: string | null;
}

export interface ConnectedInstitution {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  connectionStatus: ConnectionStatus;
  lastSync: string | null;
  itemId: string; // For Plaid integration later
  createdAt: string;
}

export interface LinkedAccount {
  id: string;
  institutionId: string;
  name: string;
  type: string;
  balance: number;
  isActive: boolean;
  mask: string; // Last 4 digits
  officialName: string;
  subtype: string;
  lastUpdated: string;
}
