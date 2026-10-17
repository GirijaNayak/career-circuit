import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  HardDrive,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Server,
  Cloud,
} from 'lucide-react';
import {
  getPreferences,
  savePreferences,
  exportUserData,
  importUserData,
  resetLocalData,
  subscribeToStorage,
} from '../storage/localStorageService';
import { validateBackupFile, UserDataBackupValidated } from '../storage/backupSchema';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { UserPreferences } from '../types';

export const SettingsPage: React.FC = () => {
  const [prefs, setPrefs] = useState<UserPreferences>(getPreferences());
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Import preview modal state
  const [importCandidate, setImportCandidate] = useState<UserDataBackupValidated | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeToStorage(() => {
      setPrefs(getPreferences());
    });
  }, []);

  const handlePreferenceChange = (updated: Partial<UserPreferences>) => {
    const next = savePreferences(updated);
    setPrefs(next);
    setStatusMessage({ type: 'success', text: 'Preferences saved.' });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleExportData = () => {
    const backup = exportUserData();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `careercircuit_backup_v${backup.schemaVersion}_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMessage({ type: 'success', text: 'Backup JSON downloaded successfully.' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupFile(content);

      if (!validation.success) {
        setStatusMessage({
          type: 'error',
          text: `Import validation failed: ${validation.error}`,
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Validated successfully; open preview modal
      setImportCandidate(validation.data);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!importCandidate) return;

    const success = importUserData(importCandidate, importMode);
    if (success) {
      setStatusMessage({
        type: 'success',
        text: `Data successfully ${importMode === 'replace' ? 'replaced' : 'merged'}.`,
      });
      setImportCandidate(null);
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Failed to write imported data to storage.',
      });
    }
  };

  const handleResetData = () => {
    resetLocalData();
    setIsResetConfirmOpen(false);
    setStatusMessage({
      type: 'success',
      text: 'Local storage reset. Default preferences restored.',
    });
  };

  return (
    <div className="page-container" style={{ maxWidth: '840px' }}>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            System & Privacy
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Settings & Data Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          Manage your local workspace, theme preferences, backup exports, and optional integration boundaries.
        </p>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            background: statusMessage.type === 'success' ? 'var(--status-official-bg)' : 'var(--status-danger-bg)',
            color: statusMessage.type === 'success' ? 'var(--status-official-text)' : 'var(--status-danger-text)',
            border: `1px solid ${statusMessage.type === 'success' ? 'var(--status-official-border)' : 'var(--status-danger-border)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Visual & Accessibility Preferences */}
      <div className="surface-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Visual & Accessibility Preferences</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Theme */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Interface Theme</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Select light, dark, or follow your operating system settings.
              </div>
            </div>
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={prefs.theme}
              onChange={(e) => handlePreferenceChange({ theme: e.target.value as UserPreferences['theme'] })}
            >
              <option value="system">System Default</option>
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          {/* High Contrast Mode */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>High Contrast Mode</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Enhances border definition and text contrast for maximum legibility.
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.highContrast}
                onChange={(e) => handlePreferenceChange({ highContrast: e.target.checked })}
              />
              <span style={{ fontSize: '0.875rem' }}>Enable High Contrast</span>
            </label>
          </div>

          {/* Reduced Motion */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Reduced Motion</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Minimizes UI animations and transitions across the interface.
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs.reducedMotion}
                onChange={(e) => handlePreferenceChange({ reducedMotion: e.target.checked })}
              />
              <span style={{ fontSize: '0.875rem' }}>Enable Reduced Motion</span>
            </label>
          </div>
        </div>
      </div>

      {/* Data Backup, Export & Import */}
      <div className="surface-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardDrive size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Local Data Backup & Migration</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Export a schema-validated JSON backup of your preparation plan, attempts history, and employer bookmarks to transfer your progress between computers or browsers.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-primary" onClick={handleExportData}>
            <Download size={16} />
            <span>Export Data Backup (JSON)</span>
          </button>

          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Import Backup File</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={handleFileSelected}
            />
          </label>
        </div>
      </div>

      {/* Optional Integration Boundaries Documentation */}
      <div className="surface-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Integration Boundaries & Optional Services</span>
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          CareerCircuit works completely without external servers. If you host an isolated code evaluation sandbox or cloud sync server, configure their endpoints below:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Isolated Code Evaluator Endpoint (Optional)</label>
            <input
              type="url"
              className="form-input font-mono"
              placeholder="e.g. https://evaluator.yourdomain.com/v1"
              value={prefs.remoteEvaluatorUrl || ''}
              onChange={(e) => handlePreferenceChange({ remoteEvaluatorUrl: e.target.value })}
            />
            <p className="form-help">
              Requires a POST /evaluate boundary implementing container process limits (2s timeout, 128MB RAM, no network). If unconfigured, coding questions are honestly evaluated as self-review.
            </p>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Cloud Sync Endpoint (Optional)</label>
            <input
              type="url"
              className="form-input font-mono"
              placeholder="e.g. https://sync.yourdomain.com/v1"
              value={prefs.remoteSyncUrl || ''}
              onChange={(e) => handlePreferenceChange({ remoteSyncUrl: e.target.value })}
            />
            <p className="form-help">
              When configured, provides secure multi-device synchronization. When blank, all data remains strictly private on your computer.
            </p>
          </div>
        </div>
      </div>

      {/* Local Storage Reset (Destructive) */}
      <div
        style={{
          border: '1px solid var(--status-danger-border)',
          background: 'var(--status-danger-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--status-danger-text)' }}>
              Reset Local Storage
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--status-danger-text)', marginTop: '0.25rem', maxWidth: '520px' }}>
              Permanently wipes all locally saved preparation plans, completed assessment attempts, and bookmarks from this browser. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <RotateCcw size={14} />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>

      {/* Import Preview & Strategy Modal */}
      {importCandidate && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm data import">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Import Backup Preview
              </h3>
              <button type="button" className="btn-icon" onClick={() => setImportCandidate(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Backup Contents (Version {importCandidate.schemaVersion}):
                </div>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>Assessment attempts: <strong>{importCandidate.assessmentAttempts.length}</strong></li>
                  <li>Bookmarked employers: <strong>{importCandidate.bookmarkedEmployerIds.length}</strong></li>
                  <li>Active preparation plan: <strong>{importCandidate.preparationPlan ? 'Yes' : 'None'}</strong></li>
                  <li>Interview module entries: <strong>{Object.keys(importCandidate.interviewProgress).length}</strong></li>
                </ul>
              </div>

              <div>
                <label className="form-label">Select Import Strategy:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importStrategy"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div>
                      <strong>Merge with existing data</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Combines bookmarks and attempts without deleting existing records.
                      </div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="importStrategy"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      style={{ marginTop: '0.2rem' }}
                    />
                    <div>
                      <strong>Replace existing data</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Overwrites current local state entirely with the imported backup.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setImportCandidate(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleExecuteImport}>
                Apply Import ({importMode.toUpperCase()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Confirm Local Data Reset"
        message="Are you sure you want to delete all locally stored data? Your preparation plans, score records, bookmarks, and notes will be permanently removed from this browser."
        confirmLabel="Yes, Reset Everything"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
