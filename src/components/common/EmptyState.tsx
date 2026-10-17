import React from 'react';
import { LucideIcon, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-md)',
        margin: '1.5rem 0',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--bg-subtle)',
          color: 'var(--text-tertiary)',
          marginBottom: '1rem',
        }}
      >
        <Icon size={24} aria-hidden="true" />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button type="button" onClick={onAction} className="btn btn-secondary">
          {actionText}
        </button>
      )}
    </div>
  );
};
