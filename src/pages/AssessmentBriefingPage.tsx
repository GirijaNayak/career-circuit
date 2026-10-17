import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { getAssessmentById, getQuestionsForAssessment, getAllEmployers } from '../data';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { saveActiveAssessmentAttempt } from '../storage/localStorageService';
import { AssessmentAttempt } from '../types';

export const AssessmentBriefingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const assessment = getAssessmentById(id || '');
  const questions = getQuestionsForAssessment(id || '');
  const employers = getAllEmployers();

  const [mode, setMode] = useState<'timed' | 'untimed'>('timed');

  if (!assessment) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Assessment Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          No assessment was found with ID &ldquo;{id}&rdquo;.
        </p>
        <Link to="/practice" className="btn btn-primary">
          Back to Assessment Catalog
        </Link>
      </div>
    );
  }

  // Count auto-graded vs self-review
  const autoGradedQuestions = questions.filter((q) => q.gradingMethod === 'automatic');
  const selfReviewQuestions = questions.filter((q) => q.gradingMethod === 'self_review');

  const handleStartSession = () => {
    const newAttempt: AssessmentAttempt = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      assessmentId: assessment.id,
      mode,
      startTime: new Date().toISOString(),
      timeSpentSeconds: 0,
      status: 'in_progress',
      answers: {},
    };

    saveActiveAssessmentAttempt(newAttempt);
    navigate(`/practice/${assessment.id}/session`);
  };

  const associatedCompanyNames = assessment.associatedEmployerIds
    .map((aid) => employers.find((e) => e.id === aid)?.name)
    .filter(Boolean);

  return (
    <div className="page-container" style={{ maxWidth: '840px' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/practice">Practice</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Pre-Assessment Briefing</span>
      </nav>

      {/* Briefing Card */}
      <div className="surface-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {assessment.title}
            </h1>
            <EvidenceBadge category={assessment.evidenceCategory} />
          </div>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {assessment.description}
          </p>
        </div>

        {/* Honest Scoring Breakdown Notice */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Scoring Transparency & Evaluation Method
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div>
              • <strong>Automatically Verified ({autoGradedQuestions.length} questions):</strong> Evaluated immediately upon submission using rigorous answer keys, syntax match, or normalized string variants.
            </div>
            {selfReviewQuestions.length > 0 && (
              <div>
                • <strong>Self-Reviewed ({selfReviewQuestions.length} questions):</strong> SQL, coding, or written trade-off questions include reference solutions, schema tables, and grading rubrics. You grade your response against the criteria on the results page.
              </div>
            )}
          </div>
        </div>

        {/* Questions & Skills Summary */}
        <div className="grid-2">
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Format & Timing
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {questions.length} Questions · ~{assessment.estimatedDurationMins} Mins
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Includes: {Array.from(new Set(questions.map((q) => q.type.replace('_', ' ')))).join(', ')}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Competencies Covered
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {assessment.skills.length} Technical Skills
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {assessment.skills.join(' · ')}
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Choose Simulation Mode
          </label>
          <div className="grid-2">
            <div
              onClick={() => setMode('timed')}
              style={{
                border: mode === 'timed' ? '2px solid var(--border-focus)' : '1px solid var(--border-default)',
                background: mode === 'timed' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Clock size={18} style={{ color: mode === 'timed' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Timed Simulation
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Fixed {assessment.estimatedDurationMins}-minute countdown with automatic submission at 0:00. Simulates recruitment platform pressure.
              </p>
            </div>

            <div
              onClick={() => setMode('untimed')}
              style={{
                border: mode === 'untimed' ? '2px solid var(--border-focus)' : '1px solid var(--border-default)',
                background: mode === 'untimed' ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Award size={18} style={{ color: mode === 'untimed' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  Untimed Practice
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Elapsed timer without automatic cutoff. Designed for deliberate learning, detailed thinking, and code analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          <strong>Notice:</strong> {assessment.disclaimer}
        </div>

        {/* Start Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <Link to="/practice" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="button" className="btn btn-primary btn-lg" onClick={handleStartSession}>
            <Play size={16} />
            <span>Begin Assessment ({mode.toUpperCase()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
