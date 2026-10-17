import React from 'react';
import { X, HardDrive, Shield, CloudOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sync-modal-title"
    >
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <HardDrive size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 id="sync-modal-title" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              Data Storage & Privacy Status
            </h3>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <CloudOff size={22} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Guest-First Local Storage Active
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Your preparation plans, completed assessment attempts, notes, and employer bookmarks are stored directly on your computer inside browser storage (localStorage). No login is required.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <Shield size={16} style={{ color: 'var(--text-tertiary)', marginTop: '3px' }} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>No Cloud Telemetry:</strong> CareerCircuit does not transmit your assessment answers, scores, or personal study notes to any remote analytics server.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <HardDrive size={16} style={{ color: 'var(--text-tertiary)', marginTop: '3px' }} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <strong>Cross-Device Migration:</strong> To move your preparation data to another computer or browser, export a verified JSON backup from the Settings page.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Link
            to="/settings"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>Open Data Settings & Backup</span>
            <ArrowRight size={14} />
          </Link>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
