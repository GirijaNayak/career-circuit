import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Award,
  Clock,
  Building2,
  Calendar,
  RotateCcw,
  Zap,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  getAssessmentAttempts,
  getBookmarkedEmployerIds,
  subscribeToStorage,
} from '../storage/localStorageService';
import { getAssessmentById, getEmployerById } from '../data';
import { calculateSkillAnalytics } from '../domain/analytics';
import { EmptyState } from '../components/common/EmptyState';
import { Employer } from '../types';

export const ProgressPage: React.FC = () => {
  const [attempts, setAttempts] = useState(getAssessmentAttempts());
  const [bookmarkedIds, setBookmarkedIds] = useState(getBookmarkedEmployerIds());

  useEffect(() => {
    return subscribeToStorage(() => {
      setAttempts(getAssessmentAttempts());
      setBookmarkedIds(getBookmarkedEmployerIds());
    });
  }, []);

  const skillAnalytics = calculateSkillAnalytics(attempts);

  const bookmarkedEmployers = bookmarkedIds
    .map((id) => getEmployerById(id))
    .filter((e): e is Employer => Boolean(e));

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            Candidate Analytics
          </span>
        </div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Progress & Skill Diagnostics
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem', maxWidth: '750px' }}>
          Transparent tracking of verified assessment scores. Metric accuracy requires repeated evaluation; small samples are clearly highlighted.
        </p>
      </div>

      {/* Skill Performance Breakdown */}
      <div className="surface-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Skill Accuracy & Statistical Confidence
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Calculated exclusively from auto-graded verified question evaluations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            <HelpCircle size={14} />
            <span>≥5 attempts required for preliminary reliability; ≥10 for proficiency</span>
          </div>
        </div>

        {skillAnalytics.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No skill data available"
            description="Complete an assessment in the Practice catalog to generate verified skill accuracy metrics."
            actionText="Browse Assessments"
            onAction={() => window.location.assign('/practice')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {skillAnalytics.map((item) => (
              <div
                key={item.skill}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.skill}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-xs)',
                        background:
                          item.statusLabel === 'Proficient'
                            ? 'var(--status-official-bg)'
                            : item.statusLabel === 'Developing'
                            ? 'var(--status-original-bg)'
                            : item.statusLabel === 'Needs Practice'
                            ? 'var(--status-danger-bg)'
                            : 'var(--status-community-bg)',
                        color:
                          item.statusLabel === 'Proficient'
                            ? 'var(--status-official-text)'
                            : item.statusLabel === 'Developing'
                            ? 'var(--status-original-text)'
                            : item.statusLabel === 'Needs Practice'
                            ? 'var(--status-danger-text)'
                            : 'var(--status-community-text)',
                      }}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {item.statusDescription}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {item.correctCount} / {item.totalAttempts} ({item.accuracyPercentage}%)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Verified Attempts
                    </div>
                  </div>

                  <Link
                    to={`/practice/drills?skill=${encodeURIComponent(item.skill)}`}
                    className="btn btn-secondary btn-sm"
                  >
                    <span>Practice Drill</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attempt History List */}
      <div className="surface-card" style={{ padding: '1.75rem', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Complete Assessment Attempt History
        </h2>

        {attempts.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attempts submitted yet"
            description="When you complete diagnostic assessments or practice tests, your historical attempts will be archived here for review."
            actionText="Start Practice"
            onAction={() => window.location.assign('/practice')}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Assessment</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Mode</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Time Spent</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Verified Score</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Self-Reviewed</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Completed Date</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => {
                  const assessment = getAssessmentById(att.assessmentId);
                  const autoScore = att.results?.autoGradedScore ?? 0;
                  const autoMax = att.results?.autoGradedMax ?? 0;
                  const selfScore = att.results?.selfReviewScore ?? 0;
                  const selfMax = att.results?.selfReviewMax ?? 0;

                  return (
                    <tr key={att.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {assessment?.title || 'Practice Assessment'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {att.mode}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                        {Math.round(att.timeSpentSeconds / 60)} mins
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {autoScore} / {autoMax}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                        {selfScore} / {selfMax}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-tertiary)' }}>
                        {new Date(att.startTime).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <Link
                          to={`/practice/${att.assessmentId}/results/${att.id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          Review Breakdown
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bookmarked Employers Quick List */}
      <div className="surface-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Saved Employers ({bookmarkedEmployers.length})
        </h2>

        {bookmarkedEmployers.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            No companies saved yet. Visit the <Link to="/companies" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Employer Directory</Link> to bookmark target employers.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {bookmarkedEmployers.map((emp) => (
              <div
                key={emp.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <Link
                    to={`/companies/${emp.id}`}
                    style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}
                  >
                    {emp.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {emp.category} · {emp.hiringStages.length} stages
                  </div>
                </div>
                <Link to={`/companies/${emp.id}`} className="btn btn-secondary btn-sm">
                  View Stages
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
