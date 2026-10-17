import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Bookmark,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  FileCode,
  Table,
  Check,
  RotateCcw,
} from 'lucide-react';
import { getAssessmentById, getQuestionsForAssessment } from '../data';
import {
  getActiveAssessmentAttempt,
  saveActiveAssessmentAttempt,
  recordAssessmentAttempt,
} from '../storage/localStorageService';
import { AssessmentAttempt, CandidateAnswer, Question } from '../types';
import { calculateAssessmentResults } from '../domain/scoring';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const AssessmentSimulatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const assessment = getAssessmentById(id || '');
  const questions = getQuestionsForAssessment(id || '');

  // Session state
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(() => {
    const existing = getActiveAssessmentAttempt();
    if (existing && existing.assessmentId === id && existing.status === 'in_progress') {
      return existing;
    }
    // Create new if none active
    const newAtt: AssessmentAttempt = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      assessmentId: id || '',
      mode: 'timed',
      startTime: new Date().toISOString(),
      timeSpentSeconds: 0,
      status: 'in_progress',
      answers: {},
    };
    saveActiveAssessmentAttempt(newAtt);
    return newAtt;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timed calculations
  const totalDurationSeconds = (assessment?.estimatedDurationMins || 45) * 60;
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(() => {
    if (attempt && attempt.mode === 'timed') {
      const elapsed = Math.floor(
        (new Date().getTime() - new Date(attempt.startTime).getTime()) / 1000
      );
      return Math.max(0, totalDurationSeconds - elapsed);
    }
    return totalDurationSeconds;
  });

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (attempt) {
      return Math.floor(
        (new Date().getTime() - new Date(attempt.startTime).getTime()) / 1000
      );
    }
    return 0;
  });

  // Current question
  const currentQuestion: Question | undefined = questions[currentIndex];
  const currentAnswer: CandidateAnswer =
    (currentQuestion && attempt?.answers[currentQuestion.id]) || {
      questionId: currentQuestion?.id || '',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

  // Autosave update helper
  const updateCurrentAnswer = useCallback(
    (updater: (prev: CandidateAnswer) => CandidateAnswer) => {
      if (!currentQuestion) return;

      setAttempt((prev) => {
        if (!prev) return null;
        const prevAnswer = prev.answers[currentQuestion.id] || {
          questionId: currentQuestion.id,
          markedForReview: false,
          lastModified: new Date().toISOString(),
        };
        const updatedAnswer = updater(prevAnswer);
        const updatedAttempt: AssessmentAttempt = {
          ...prev,
          answers: {
            ...prev.answers,
            [currentQuestion.id]: updatedAnswer,
          },
        };
        saveActiveAssessmentAttempt(updatedAttempt);
        return updatedAttempt;
      });
    },
    [currentQuestion]
  );

  // Submit assessment logic
  const handleSubmitAssessment = useCallback(() => {
    if (!attempt || isSubmitting) return;
    setIsSubmitting(true);

    const now = new Date().toISOString();
    const finalTimeSpent =
      attempt.mode === 'timed'
        ? totalDurationSeconds - timeRemainingSeconds
        : elapsedSeconds;

    // Calculate official honest results
    const results = calculateAssessmentResults(questions, attempt.answers);

    const completedAttempt: AssessmentAttempt = {
      ...attempt,
      status: 'submitted',
      endTime: now,
      timeSpentSeconds: Math.max(0, finalTimeSpent),
      results,
    };

    recordAssessmentAttempt(completedAttempt);
    navigate(`/practice/${attempt.assessmentId}/results/${completedAttempt.id}`);
  }, [attempt, isSubmitting, totalDurationSeconds, timeRemainingSeconds, elapsedSeconds, questions, navigate]);

  // Timer interval
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;

    const timer = setInterval(() => {
      if (attempt.mode === 'timed') {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto submit when time runs out
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, handleSubmitAssessment]);

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!assessment || questions.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <h2>Invalid Assessment Session</h2>
        <button onClick={() => navigate('/practice')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Practice Catalog
        </button>
      </div>
    );
  }

  // Calculate count answered
  const isQuestionAnswered = (q: Question) => {
    const ans = attempt?.answers[q.id];
    if (!ans) return false;
    if (ans.selectedOptionId) return true;
    if (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) return true;
    if (ans.textAnswer && ans.textAnswer.trim().length > 0) return true;
    if (ans.sqlAnswer && ans.sqlAnswer.trim().length > 0) return true;
    if (ans.codeAnswer && ans.codeAnswer.trim().length > 0) return true;
    return false;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = questions.filter((q) => attempt?.answers[q.id]?.markedForReview).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - var(--header-height))' }}>
      {/* Top Test Navigation & Timer Bar */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--header-height)',
          zIndex: 30,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-default)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
            {assessment.title}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {attempt?.mode}
          </span>
        </div>

        {/* Center: Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background:
              attempt?.mode === 'timed' && timeRemainingSeconds < 300
                ? 'var(--status-danger-bg)'
                : 'var(--bg-subtle)',
            border:
              attempt?.mode === 'timed' && timeRemainingSeconds < 300
                ? '1px solid var(--status-danger-border)'
                : '1px solid var(--border-subtle)',
            color:
              attempt?.mode === 'timed' && timeRemainingSeconds < 300
                ? 'var(--status-danger-text)'
                : 'var(--text-primary)',
          }}
        >
          <Clock size={16} />
          <span className="font-mono tabular-nums" style={{ fontWeight: 700, fontSize: '1rem' }}>
            {attempt?.mode === 'timed'
              ? formatTime(timeRemainingSeconds)
              : formatTime(elapsedSeconds)}
          </span>
          {attempt?.mode === 'timed' && timeRemainingSeconds < 300 && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>&lt; 5m left</span>
          )}
        </div>

        {/* Right: Review List & Final Submit CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsReviewModalOpen(true)}
          >
            <span>Review Drawer ({answeredCount}/{questions.length})</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsSubmitConfirmOpen(true)}
          >
            <Send size={14} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          maxWidth: 'var(--max-content-width)',
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem',
          gap: '1.5rem',
        }}
      >
        {/* Left / Main Question Workspace */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Question Header & Review Flag */}
          <div
            className="surface-card"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {currentQuestion.type.replace('_', ' ')}
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                {currentQuestion.points} Points
              </span>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                updateCurrentAnswer((prev) => ({
                  ...prev,
                  markedForReview: !prev.markedForReview,
                }))
              }
              style={{
                background: currentAnswer.markedForReview ? '#fef3c7' : undefined,
                color: currentAnswer.markedForReview ? '#92400e' : undefined,
                borderColor: currentAnswer.markedForReview ? '#fde68a' : undefined,
              }}
            >
              <Flag size={14} />
              <span>{currentAnswer.markedForReview ? 'Marked for Review' : 'Mark for Review'}</span>
            </button>
          </div>

          {/* Question Prompt Body */}
          <div className="surface-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {currentQuestion.title}
            </h2>

            <div
              style={{
                fontSize: '0.9375rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.5rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {currentQuestion.prompt}
            </div>

            {/* Answer Input Renderers */}
            {/* 1. Single Choice */}
            {currentQuestion.type === 'single_choice' ||
            currentQuestion.type === 'complexity_analysis' ||
            currentQuestion.type === 'output_prediction' ||
            (currentQuestion.type === 'debugging' && currentQuestion.options) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQuestion.options?.map((opt) => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id;
                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected
                          ? '2px solid var(--border-focus)'
                          : '1px solid var(--border-default)',
                        background: isSelected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={opt.id}
                        checked={isSelected}
                        onChange={() =>
                          updateCurrentAnswer((prev) => ({
                            ...prev,
                            selectedOptionId: opt.id,
                            lastModified: new Date().toISOString(),
                          }))
                        }
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            {/* 2. Multi-Select */}
            {currentQuestion.type === 'multi_select' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {currentQuestion.options?.map((opt) => {
                  const selectedSet = new Set(currentAnswer.selectedOptionIds || []);
                  const isChecked = selectedSet.has(opt.id);

                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isChecked
                          ? '2px solid var(--border-focus)'
                          : '1px solid var(--border-default)',
                        background: isChecked ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        value={opt.id}
                        checked={isChecked}
                        onChange={() => {
                          const updated = new Set(currentAnswer.selectedOptionIds || []);
                          if (updated.has(opt.id)) {
                            updated.delete(opt.id);
                          } else {
                            updated.add(opt.id);
                          }
                          updateCurrentAnswer((prev) => ({
                            ...prev,
                            selectedOptionIds: Array.from(updated),
                            lastModified: new Date().toISOString(),
                          }));
                        }}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            {/* 3. Short Answer */}
            {currentQuestion.type === 'short_answer' ? (
              <div>
                <label className="form-label">Enter your calculated answer:</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ maxWidth: '320px', fontSize: '1rem' }}
                  placeholder="e.g. 62"
                  value={currentAnswer.textAnswer || ''}
                  onChange={(e) =>
                    updateCurrentAnswer((prev) => ({
                      ...prev,
                      textAnswer: e.target.value,
                      lastModified: new Date().toISOString(),
                    }))
                  }
                />
                <p className="form-help">
                  Normalized automatically (spacing and capitalization are ignored).
                </p>
              </div>
            ) : null}

            {/* 4. SQL Editor */}
            {currentQuestion.type === 'sql' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">SQL Query Formulation:</label>
                  <textarea
                    rows={8}
                    className="form-textarea font-mono"
                    placeholder="SELECT ... FROM ..."
                    value={currentAnswer.sqlAnswer ?? (currentQuestion.codeStarter || '')}
                    onChange={(e) =>
                      updateCurrentAnswer((prev) => ({
                        ...prev,
                        sqlAnswer: e.target.value,
                        lastModified: new Date().toISOString(),
                      }))
                    }
                  />
                </div>

                {currentQuestion.sqlFixture && (
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <strong>Database Fixture:</strong>
                    <pre style={{ marginTop: '0.35rem', overflowX: 'auto', color: 'var(--text-secondary)' }}>
                      {currentQuestion.sqlFixture.schemaSql}
                    </pre>
                  </div>
                )}
              </div>
            ) : null}

            {/* 5. Coding Workspace */}
            {currentQuestion.type === 'coding' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-community-bg)',
                    border: '1px solid var(--status-community-border)',
                    fontSize: '0.8125rem',
                    color: 'var(--status-community-text)',
                  }}
                >
                  <strong>Execution Boundary:</strong> Code will be self-evaluated against visible test cases and algorithmic constraints upon submission. Never executed insecurely with eval.
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Code Implementation ({currentQuestion.language || 'Python'}):
                    </label>
                  </div>
                  <textarea
                    rows={12}
                    className="form-textarea font-mono"
                    value={currentAnswer.codeAnswer ?? (currentQuestion.codeStarter || '')}
                    onChange={(e) =>
                      updateCurrentAnswer((prev) => ({
                        ...prev,
                        codeAnswer: e.target.value,
                        lastModified: new Date().toISOString(),
                      }))
                    }
                  />
                </div>

                {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Visible Test Case Specifications:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
                      {currentQuestion.testCases.slice(0, 3).map((tc) => (
                        <div
                          key={tc.id}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-subtle)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>Input: {tc.input}</span>
                          <span style={{ color: 'var(--text-tertiary)' }}>Expected: {tc.expectedOutput}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* 6. Written Response */}
            {currentQuestion.type === 'written_response' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Architectural Analysis:</label>
                  <textarea
                    rows={10}
                    className="form-textarea"
                    placeholder="Structure your analysis: 1. Concurrency, 2. Schema Evolution, 3. Partitioning..."
                    value={currentAnswer.textAnswer || ''}
                    onChange={(e) =>
                      updateCurrentAnswer((prev) => ({
                        ...prev,
                        textAnswer: e.target.value,
                        lastModified: new Date().toISOString(),
                      }))
                    }
                  />
                </div>

                {currentQuestion.rubricCriteria && (
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.85rem',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <strong>Self-Review Evaluation Rubric:</strong>
                    <ul style={{ margin: '0.35rem 0 0 1.25rem', color: 'var(--text-secondary)' }}>
                      {currentQuestion.rubricCriteria.map((c) => (
                        <li key={c.id}>
                          <strong>{c.label} ({c.maxPoints} pts):</strong> {c.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft size={16} />
              <span>Previous Question</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              >
                <span>Next Question</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsReviewModalOpen(true)}
              >
                <span>Review & Submit</span>
                <Send size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Grid Picker */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div className="surface-card" style={{ padding: '1.25rem', position: 'sticky', top: '130px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Question Navigation
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = isQuestionAnswered(q);
                const isMarked = attempt?.answers[q.id]?.markedForReview;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      border: isCurrent
                        ? '2px solid var(--border-focus)'
                        : '1px solid var(--border-default)',
                      background: isAnswered ? 'var(--status-official-bg)' : 'var(--bg-surface)',
                      color: isAnswered ? 'var(--status-official-text)' : 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    title={`Question ${idx + 1} (${isAnswered ? 'Answered' : 'Unanswered'}${isMarked ? ', Marked' : ''})`}
                    aria-label={`Question ${idx + 1}`}
                  >
                    <span>{idx + 1}</span>
                    {isMarked && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#f59e0b',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--status-official-bg)', border: '1px solid var(--status-official-border)', borderRadius: '2px' }} />
                <span>Answered ({answeredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '2px' }} />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', margin: '2px' }} />
                <span>Marked for review ({markedCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Drawer Modal */}
      {isReviewModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Review assessment questions before submission">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Assessment Submission Review
              </h3>
              <button type="button" className="btn-icon" onClick={() => setIsReviewModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {answeredCount} / {questions.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Answered</div>
                </div>
                <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: unansweredCount > 0 ? '#b91c1c' : 'var(--text-primary)' }}>
                    {unansweredCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Unanswered</div>
                </div>
                <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d97706' }}>
                    {markedCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Flagged for Review</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {questions.map((q, idx) => {
                  const isAnswered = isQuestionAnswered(q);
                  const isMarked = attempt?.answers[q.id]?.markedForReview;

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsReviewModalOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Q{idx + 1}</span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{q.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isMarked && (
                          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Marked</span>
                        )}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            background: isAnswered ? 'var(--status-official-bg)' : 'var(--status-danger-bg)',
                            color: isAnswered ? 'var(--status-official-text)' : 'var(--status-danger-text)',
                            fontWeight: 600,
                          }}
                        >
                          {isAnswered ? 'Answered' : 'Unanswered'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsReviewModalOpen(false)}>
                Continue Answering
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setIsSubmitConfirmOpen(true);
                }}
              >
                Proceed to Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Submit Confirmation Modal */}
      <ConfirmDialog
        isOpen={isSubmitConfirmOpen}
        title="Submit Assessment?"
        message={
          unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question${unansweredCount === 1 ? '' : 's'}. Once submitted, your answers will be finalized and evaluated against official answer keys.`
            : 'Are you ready to submit your assessment? Your answers will be finalized and an honest score report will be generated.'
        }
        confirmLabel="Finalize & Submit"
        cancelLabel="Keep Working"
        isDestructive={false}
        onConfirm={handleSubmitAssessment}
        onCancel={() => setIsSubmitConfirmOpen(false)}
      />
    </div>
  );
};
