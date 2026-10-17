import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { getAssessmentById, getQuestionsForAssessment } from '../data';
import { getAssessmentAttempts, recordAssessmentAttempt } from '../storage/localStorageService';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { Question } from '../types';

export const AssessmentResultsPage: React.FC = () => {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const navigate = useNavigate();

  const assessment = getAssessmentById(id || '');
  const questions = getQuestionsForAssessment(id || '');
  const attempts = getAssessmentAttempts();
  const attempt = attempts.find((a) => a.id === attemptId);

  // Accordion state for question review
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestionExpand = (qid: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qid]: !prev[qid],
    }));
  };

  if (!assessment || !attempt || !attempt.results) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Result Record Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          No submitted assessment results were found for this session.
        </p>
        <Link to="/practice" className="btn btn-primary">
          Return to Practice Catalog
        </Link>
      </div>
    );
  }

  const {
    autoGradedScore,
    autoGradedMax,
    selfReviewScore,
    selfReviewMax,
    totalPossibleScore,
    verifiedPercentage,
    questionEvaluations,
    skillsSummary,
  } = attempt.results;

  // Identify missed questions
  const missedQuestions = questions.filter((q) => {
    const ev = questionEvaluations[q.id];
    return ev && ev.isCorrect === false;
  });

  // Handle self-review score update
  const handleUpdateSelfReview = (questionId: string, rubricId: string, score: number) => {
    const updatedScores = {
      ...(attempt.answers[questionId]?.selfReviewScores || {}),
      [rubricId]: score,
    };

    // Recalculate
    const currentAns = attempt.answers[questionId] || {
      questionId,
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const updatedAnswers = {
      ...attempt.answers,
      [questionId]: {
        ...currentAns,
        selfReviewScores: updatedScores,
      },
    };

    // Update in storage
    const updatedAttempt = {
      ...attempt,
      answers: updatedAnswers,
    };
    recordAssessmentAttempt(updatedAttempt);
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/practice">Practice</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Assessment Results</span>
      </nav>

      {/* Main Score Report Card */}
      <div
        className="surface-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                Diagnostic Report
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {assessment.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Completed in {Math.round(attempt.timeSpentSeconds / 60)} minutes ({attempt.mode} mode) on{' '}
              {new Date(attempt.startTime).toLocaleDateString()}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/practice/${assessment.id}/briefing`} className="btn btn-secondary btn-sm">
              <RotateCcw size={14} />
              <span>Retake Assessment</span>
            </Link>
          </div>
        </div>

        {/* Score Summary Metrics */}
        <div className="grid-3" style={{ marginTop: '0.5rem' }}>
          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Verified Auto-Graded Score
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {autoGradedScore} <span style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>/ {autoGradedMax}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>
              {verifiedPercentage}% verified accuracy
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Self-Reviewed Weight
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
              {selfReviewScore} <span style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-tertiary)' }}>/ {selfReviewMax}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              Evaluated against rubrics below
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Total Questions
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {questions.length}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {missedQuestions.length} missed · {questions.length - missedQuestions.length} correct/reviewed
            </div>
          </div>
        </div>

        {/* Actionable Next Step Banner */}
        {missedQuestions.length > 0 && (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-subtle)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={16} style={{ color: '#d97706' }} />
                <span>Targeted Skill Remediation Available</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                You missed {missedQuestions.length} question{missedQuestions.length === 1 ? '' : 's'}. Reinforce the underlying concepts with a focused drill.
              </p>
            </div>

            <Link
              to={`/practice/drills?skill=${encodeURIComponent(missedQuestions[0]?.skills[0] || 'Algorithms')}`}
              className="btn btn-primary btn-sm"
            >
              <span>Practice Missed Drill ({missedQuestions[0]?.skills[0]}) →</span>
            </Link>
          </div>
        )}
      </div>

      {/* Skills Performance Breakdown */}
      {skillsSummary.length > 0 && (
        <div className="surface-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Topic & Skill Breakdown
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {skillsSummary.map((s) => (
              <div key={s.skill} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {s.skill}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {s.correct} / {s.total} ({s.percentage}%)
                  </span>
                  <Link
                    to={`/practice/drills?skill=${encodeURIComponent(s.skill)}`}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                  >
                    Drill Topic →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question by Question Detailed Review */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Question Analysis & Explanations
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, idx) => {
            const ev = questionEvaluations[q.id];
            const answer = attempt.answers[q.id];
            const isExpanded = expandedQuestions[q.id] ?? (ev?.isCorrect === false);

            return (
              <div
                key={q.id}
                className="surface-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft:
                    ev?.isCorrect === true
                      ? '4px solid #10b981'
                      : ev?.isCorrect === false
                      ? '4px solid #ef4444'
                      : '4px solid #f59e0b',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleQuestionExpand(q.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {ev?.isCorrect === true ? (
                      <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                    ) : ev?.isCorrect === false ? (
                      <XCircle size={20} style={{ color: '#ef4444' }} />
                    ) : (
                      <HelpCircle size={20} style={{ color: '#f59e0b' }} />
                    )}
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Question {idx + 1}: {q.title}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {q.type.replace('_', ' ')} · {q.skills.join(', ')} ·{' '}
                        {ev?.gradingMethod === 'automatic' ? 'Auto-Graded' : 'Self-Review'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>
                      {ev?.scoreAwarded ?? 0} / {ev?.maxScore ?? q.points} pts
                    </span>
                    <button type="button" className="btn-icon" aria-label="Toggle details">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {q.prompt}
                    </div>

                    {/* Candidate Submitted Answer */}
                    <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-xs)', padding: '0.75rem', fontSize: '0.8125rem' }}>
                      <strong>Your Answer:</strong>{' '}
                      {q.type === 'single_choice' || q.type === 'complexity_analysis' || q.type === 'output_prediction' || (q.type === 'debugging' && q.options) ? (
                        <span>
                          {q.options?.find((o) => o.id === answer?.selectedOptionId)?.text || 'No option selected'}
                        </span>
                      ) : q.type === 'multi_select' ? (
                        <span>
                          {answer?.selectedOptionIds && answer.selectedOptionIds.length > 0
                            ? answer.selectedOptionIds
                                .map((id) => q.options?.find((o) => o.id === id)?.text)
                                .join('; ')
                            : 'No options selected'}
                        </span>
                      ) : q.type === 'short_answer' ? (
                        <span>{answer?.textAnswer || 'No answer entered'}</span>
                      ) : q.type === 'sql' ? (
                        <pre style={{ marginTop: '0.35rem' }}>{answer?.sqlAnswer || 'No SQL query entered'}</pre>
                      ) : q.type === 'coding' ? (
                        <pre style={{ marginTop: '0.35rem' }}>{answer?.codeAnswer || 'No code submitted'}</pre>
                      ) : (
                        <div style={{ marginTop: '0.35rem', whiteSpace: 'pre-wrap' }}>{answer?.textAnswer || 'No written response'}</div>
                      )}
                    </div>

                    {/* Feedback & Solution */}
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      <strong>Evaluator Assessment:</strong> {ev?.feedback}
                    </div>

                    {/* Detailed Explanation */}
                    <div
                      style={{
                        background: 'var(--status-original-bg)',
                        border: '1px solid var(--status-original-border)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--status-original-text)',
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
                        Explanation & Core Engineering Invariant:
                      </strong>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{q.explanation}</div>
                    </div>

                    {/* Common Pitfalls if available */}
                    {q.commonPitfalls && q.commonPitfalls.length > 0 && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--status-community-text)', background: 'var(--status-community-bg)', padding: '0.75rem', borderRadius: 'var(--radius-xs)' }}>
                        <strong>Common Traps & Edge Cases:</strong>
                        <ul style={{ margin: '0.25rem 0 0 1.25rem' }}>
                          {q.commonPitfalls.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Rubric evaluation for written responses */}
                    {q.rubricCriteria && (
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                          Self-Review Rubric Alignment:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {q.rubricCriteria.map((c) => {
                            const currentScore = answer?.selfReviewScores?.[c.id] ?? 0;
                            return (
                              <div
                                key={c.id}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.5rem',
                                  borderRadius: 'var(--radius-xs)',
                                  background: 'var(--bg-subtle)',
                                  fontSize: '0.8125rem',
                                }}
                              >
                                <div style={{ maxWidth: '600px' }}>
                                  <strong>{c.label}:</strong> {c.description}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <select
                                    className="form-select"
                                    style={{ width: '70px', padding: '0.2rem' }}
                                    value={currentScore}
                                    onChange={(e) =>
                                      handleUpdateSelfReview(q.id, c.id, Number(e.target.value))
                                    }
                                  >
                                    {Array.from({ length: c.maxPoints + 1 }, (_, i) => (
                                      <option key={i} value={i}>
                                        {i} / {c.maxPoints}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
