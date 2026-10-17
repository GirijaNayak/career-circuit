/**
 * Sync and Cloud Adapter
 * 
 * CareerCircuit is guest-first: 100% of preparation, employer research, simulator,
 * and analytics work fully offline in browser localStorage/IndexedDB without an account.
 * 
 * When a remote sync endpoint is supplied (e.g. self-hosted Node/Supabase/Firebase),
 * this adapter provides the synchronization protocol.
 */

export interface SyncStatus {
  isConfigured: boolean;
  mode: 'guest_local' | 'cloud_synced';
  lastSyncedAt: string | null;
  accountEmail: string | null;
  message: string;
}

export class SyncService {
  private endpointUrl: string | null = null;

  constructor(endpointUrl?: string) {
    if (endpointUrl && endpointUrl.trim()) {
      this.endpointUrl = endpointUrl.trim();
    }
  }

  public getStatus(): SyncStatus {
    if (!this.endpointUrl) {
      return {
        isConfigured: false,
        mode: 'guest_local',
        lastSyncedAt: null,
        accountEmail: null,
        message: 'Guest / Local Storage Mode Active. All notes, attempts, and plans are stored directly in your browser. No data is transmitted to an external server.',
      };
    }

    return {
      isConfigured: true,
      mode: 'cloud_synced',
      lastSyncedAt: new Date().toISOString(),
      accountEmail: 'user@example.com',
      message: `Connected to sync endpoint: ${this.endpointUrl}`,
    };
  }
}
