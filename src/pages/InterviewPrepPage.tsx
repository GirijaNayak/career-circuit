import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { getAllInterviewModules } from '../data';
import { getInterviewProgress, subscribeToStorage } from '../storage/localStorageService';

export const InterviewPrepPage: React.FC = () => {
  const modules = getAllInterviewModules();
  const [progress, setProgress] = useState(getInterviewProgress());

  useEffect(() => {
    return subscribeToStorage(() => {
      setProgress(getInterviewProgress());
    });
  }, []);

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Technical & Behavioral Deep Dives
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
          Interview Preparation Modules
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem', maxWidth: '750px' }}>
          Interactive interview prompts paired with structured self-review rubrics. Practice structuring live responses for system design, algorithms, low-level design, and behavioral evaluations.
        </p>
      </div>

      {/* Modules List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {modules.map((mod) => {
          const modProgress = progress[mod.key];
          const isCompleted = modProgress?.status === 'completed';
          const completedPromptCount = modProgress?.completedPromptIds?.length || 0;

          return (
            <div
              key={mod.key}
              className="surface-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {mod.category}
                  </span>

                  {isCompleted && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#10b981',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={14} /> Completed
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {mod.title}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {mod.learningObjective}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', gap: '1rem' }}>
                  <span>{mod.prompts.length} Prompts</span>
                  <span>~{mod.estimatedMinutes} Mins</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  {completedPromptCount} of {mod.prompts.length} completed
                </span>
                <Link
                  to={`/interview-prep/${mod.key}`}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <span>Open Module</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
