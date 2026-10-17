import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
  Save,
  Check,
} from 'lucide-react';
import { getInterviewModuleByKey } from '../data';
import {
  getInterviewProgress,
  saveInterviewModuleProgress,
  subscribeToStorage,
} from '../storage/localStorageService';
import { InterviewModuleProgress } from '../types';

export const InterviewPrepModulePage: React.FC = () => {
  const { moduleKey } = useParams<{ moduleKey: string }>();
  const interviewModule = getInterviewModuleByKey(moduleKey || '');

  const [progress, setProgress] = useState<InterviewModuleProgress>(() => {
    const all = getInterviewProgress();
    return (
      all[moduleKey || ''] || {
        moduleKey: moduleKey || '',
        promptNotes: {},
        completedPromptIds: [],
        status: 'not_started',
        lastUpdated: new Date().toISOString(),
      }
    );
  });

  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<string>('');

  useEffect(() => {
    return subscribeToStorage(() => {
      const all = getInterviewProgress();
      if (all[moduleKey || '']) {
        setProgress(all[moduleKey || '']);
      }
    });
  }, [moduleKey]);

  if (!interviewModule) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Interview Module Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          No module found with key &ldquo;{moduleKey}&rdquo;.
        </p>
        <Link to="/interview-prep" className="btn btn-primary">
          Back to Interview Prep Catalog
        </Link>
      </div>
    );
  }

  const activePrompt = interviewModule.prompts[activePromptIndex];
  const currentNote = activePrompt ? progress.promptNotes[activePrompt.id] || '' : '';
  const isCurrentPromptCompleted = activePrompt
    ? progress.completedPromptIds.includes(activePrompt.id)
    : false;

  const handleUpdateNote = (val: string) => {
    if (!activePrompt) return;
    const updated: InterviewModuleProgress = {
      ...progress,
      promptNotes: {
        ...progress.promptNotes,
        [activePrompt.id]: val,
      },
      lastUpdated: new Date().toISOString(),
      status: 'in_progress',
    };
    setProgress(updated);
    saveInterviewModuleProgress(updated);
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleToggleComplete = () => {
    if (!activePrompt) return;
    let completed = [...progress.completedPromptIds];
    if (completed.includes(activePrompt.id)) {
      completed = completed.filter((id) => id !== activePrompt.id);
    } else {
      completed.push(activePrompt.id);
    }

    const allCompleted = interviewModule.prompts.every((p) => completed.includes(p.id));

    const updated: InterviewModuleProgress = {
      ...progress,
      completedPromptIds: completed,
      status: allCompleted ? 'completed' : 'in_progress',
      lastUpdated: new Date().toISOString(),
    };
    setProgress(updated);
    saveInterviewModuleProgress(updated);
  };

  return (
    <div className="page-container" style={{ maxWidth: '960px' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/interview-prep">Interview Prep</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{interviewModule.title}</span>
      </nav>

      {/* Module Overview Header */}
      <div
        className="surface-card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                }}
              >
                {interviewModule.category} · ~{interviewModule.estimatedMinutes} Mins
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {interviewModule.title}
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.6 }}>
              {interviewModule.learningObjective}
            </p>
          </div>

          <Link
            to={`/practice/drills?skill=${encodeURIComponent(interviewModule.recommendedFollowUpDrillSkill)}`}
            className="btn btn-secondary btn-sm"
          >
            <Zap size={14} />
            <span>Launch Related Drill</span>
          </Link>
        </div>

        {/* Prompt Selector Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', overflowX: 'auto' }}>
          {interviewModule.prompts.map((p, idx) => {
            const isCompleted = progress.completedPromptIds.includes(p.id);
            const isActive = idx === activePromptIndex;

            return (
              <button
                key={p.id}
                type="button"
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActivePromptIndex(idx)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {isCompleted && <CheckCircle2 size={13} style={{ color: '#10b981' }} />}
                <span>
                  Prompt {idx + 1}: {p.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Prompt Interactive Workspace */}
      {activePrompt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="surface-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Interactive Prompt {activePromptIndex + 1}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {activePrompt.title}
                </h2>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleToggleComplete}
                style={{
                  background: isCurrentPromptCompleted ? 'var(--status-official-bg)' : undefined,
                  color: isCurrentPromptCompleted ? 'var(--status-official-text)' : undefined,
                  borderColor: isCurrentPromptCompleted ? 'var(--status-official-border)' : undefined,
                }}
              >
                <Check size={14} />
                <span>{isCurrentPromptCompleted ? 'Completed' : 'Mark Completed'}</span>
              </button>
            </div>

            {/* Scenario */}
            <div
              style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                fontSize: '0.9375rem',
                color: 'var(--text-primary)',
                marginBottom: '1rem',
                borderLeft: '3px solid var(--accent-primary)',
              }}
            >
              <strong>Interview Scenario:</strong> {activePrompt.scenario}
            </div>

            {/* Challenge */}
            <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              <strong>Prompt Challenge:</strong> {activePrompt.challenge}
            </div>

            {/* Candidate Practice Notes Area */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Your Prepared Response & Architecture Notes:
                </label>
                {saveStatus && (
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                    {saveStatus}
                  </span>
                )}
              </div>
              <textarea
                rows={8}
                className="form-textarea"
                placeholder="Structure your thoughts: 1. Clarifying questions, 2. Tradeoffs, 3. Invariants..."
                value={currentNote}
                onChange={(e) => handleUpdateNote(e.target.value)}
              />
              <p className="form-help">Notes are autosaved to local storage.</p>
            </div>

            {/* Structured Self-Review Rubric */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Self-Review Rubric & Evaluation Criteria
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activePrompt.rubric.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-subtle)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>{r.criterion}:</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>{r.description}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.45rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-tertiary)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Weight: {r.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Solution Outline */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Reference Architecture & Solution Outline
              </h3>
              <div
                style={{
                  background: 'var(--status-original-bg)',
                  border: '1px solid var(--status-original-border)',
                  color: 'var(--status-original-text)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                }}
              >
                {activePrompt.sampleSolutionOutline}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
