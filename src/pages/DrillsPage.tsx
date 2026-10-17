import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Zap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { getAllQuestions } from '../data';
import {
  getDrillStats,
  recordDrillAttempt,
  getAssessmentAttempts,
} from '../storage/localStorageService';
import { Question } from '../types';
import { evaluateQuestion } from '../domain/scoring';

export const DrillsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const attempts = useMemo(() => getAssessmentAttempts(), []);

  // Skill filter
  const targetSkill = searchParams.get('skill') || 'all';

  // Extract all unique skills
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    allQuestions.forEach((q) => q.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [allQuestions]);

  // Questions matching drill criteria
  const drillQuestions = useMemo(() => {
    if (targetSkill === 'all') return allQuestions;
    if (targetSkill === 'all-missed') {
      // Find questions missed in past attempts
      const missedIds = new Set<string>();
      attempts.forEach((att) => {
        if (!att.results) return;
        Object.entries(att.results.questionEvaluations).forEach(([qid, ev]) => {
          if (ev.isCorrect === false) missedIds.add(qid);
        });
      });
      const missedList = allQuestions.filter((q) => missedIds.has(q.id));
      return missedList.length > 0 ? missedList : allQuestions;
    }
    return allQuestions.filter((q) => q.skills.includes(targetSkill));
  }, [allQuestions, targetSkill, attempts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [showSolution, setShowSolution] = useState(false);

  const currentQ: Question | undefined = drillQuestions[currentIndex];

  const handleCheckAnswer = () => {
    if (!currentQ || isEvaluated) return;

    let candidateAnswer = {
      questionId: currentQ.id,
      selectedOptionId: selectedOption,
      textAnswer: textAnswer,
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const evaluation = evaluateQuestion(currentQ, candidateAnswer);
    setIsEvaluated(true);

    // Record into drill stats
    recordDrillAttempt(currentQ.skills[0] || 'General', Boolean(evaluation.isCorrect));
  };

  const handleNextDrill = () => {
    setIsEvaluated(false);
    setSelectedOption('');
    setTextAnswer('');
    setHintsRevealed(0);
    setShowSolution(false);
    setCurrentIndex((prev) => (prev + 1) % drillQuestions.length);
  };

  const drillStats = getDrillStats();
  const currentSkillStat = currentQ ? drillStats[currentQ.skills[0]] : null;

  return (
    <div className="page-container" style={{ maxWidth: '820px' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        <Link to="/practice">Practice</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Targeted Skill Drill</span>
      </nav>

      {/* Title */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Zap size={18} style={{ color: '#d97706' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Interactive Drill Session
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Targeted Skill Practice
          </h1>
        </div>

        {/* Skill filter selector */}
        <div>
          <select
            className="form-select"
            value={targetSkill}
            onChange={(e) => {
              setSearchParams({ skill: e.target.value });
              setCurrentIndex(0);
              setIsEvaluated(false);
              setSelectedOption('');
              setTextAnswer('');
              setHintsRevealed(0);
              setShowSolution(false);
            }}
            aria-label="Filter drill by skill"
          >
            <option value="all">All Topics ({allQuestions.length})</option>
            <option value="all-missed">Previously Missed Questions</option>
            {availableSkills.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {drillQuestions.length === 0 ? (
        <div className="surface-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No drill questions found for this topic</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Try selecting a different skill or return to the full catalog.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => setSearchParams({ skill: 'all' })}
          >
            Reset Topic Filter
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card Header & Counter */}
          <div className="surface-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  Drill {currentIndex + 1} of {drillQuestions.length}
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {currentQ?.skills.join(', ')}
                </span>
              </div>

              {currentSkillStat && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Drill Accuracy: <strong>{currentSkillStat.correct} / {currentSkillStat.attempts}</strong> ({currentSkillStat.attempts > 0 ? Math.round((currentSkillStat.correct / currentSkillStat.attempts) * 100) : 0}%)
                </div>
              )}
            </div>

            {/* Prompt */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {currentQ?.title}
              </h2>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {currentQ?.prompt}
              </div>
            </div>

            {/* Answer Input */}
            {currentQ?.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {currentQ.options.map((opt) => {
                  const isChecked = selectedOption === opt.id;
                  const isCorrect = opt.id === currentQ.correctOptionId;

                  let borderStyle = '1px solid var(--border-default)';
                  let bgStyle = 'var(--bg-surface)';

                  if (isEvaluated) {
                    if (isCorrect) {
                      borderStyle = '2px solid #10b981';
                      bgStyle = 'var(--status-official-bg)';
                    } else if (isChecked) {
                      borderStyle = '2px solid #ef4444';
                      bgStyle = 'var(--status-danger-bg)';
                    }
                  } else if (isChecked) {
                    borderStyle = '2px solid var(--border-focus)';
                    bgStyle = 'var(--accent-subtle)';
                  }

                  return (
                    <label
                      key={opt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: borderStyle,
                        background: bgStyle,
                        cursor: isEvaluated ? 'default' : 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="drill-radio"
                        value={opt.id}
                        disabled={isEvaluated}
                        checked={isChecked}
                        onChange={() => setSelectedOption(opt.id)}
                        style={{ marginTop: '0.2rem' }}
                      />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {currentQ?.type === 'short_answer' && (
              <div>
                <label className="form-label">Your calculated answer:</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ maxWidth: '300px' }}
                  disabled={isEvaluated}
                  placeholder="e.g. 62"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                />
              </div>
            )}

            {/* Progressive Hints Section */}
            {currentQ?.hints && currentQ.hints.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <Lightbulb size={16} style={{ color: '#d97706' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Progressive Hints ({hintsRevealed} of {currentQ.hints.length} revealed):
                  </span>
                  {hintsRevealed < currentQ.hints.length && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setHintsRevealed((prev) => prev + 1)}
                    >
                      Reveal Next Hint
                    </button>
                  )}
                </div>

                {hintsRevealed > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {currentQ.hints.slice(0, hintsRevealed).map((hint, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-subtle)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          borderLeft: '2px solid #d97706',
                        }}
                      >
                        <strong>Hint {i + 1}:</strong> {hint}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Check Answer CTA or Explanation */}
            {!isEvaluated ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowSolution(!showSolution)}
                >
                  {showSolution ? 'Hide Solution' : 'View Worked Solution'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedOption && !textAnswer.trim()}
                  onClick={handleCheckAnswer}
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {selectedOption === currentQ?.correctOptionId ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 700 }}>
                        <CheckCircle2 size={18} /> Correct!
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444', fontWeight: 700 }}>
                        <XCircle size={18} /> Incorrect
                      </span>
                    )}
                  </div>

                  <button type="button" className="btn btn-primary" onClick={handleNextDrill}>
                    <span>Next Drill Question</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div
                  style={{
                    background: 'var(--status-original-bg)',
                    border: '1px solid var(--status-original-border)',
                    borderRadius: 'var(--radius-xs)',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    color: 'var(--status-original-text)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Detailed Concept Explanation:</strong>
                  <div style={{ marginTop: '0.35rem', whiteSpace: 'pre-wrap' }}>{currentQ?.explanation}</div>
                </div>
              </div>
            )}

            {/* Revealed Solution Box if clicked before check */}
            {showSolution && !isEvaluated && (
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-xs)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <strong>Worked Solution:</strong>
                <p style={{ marginTop: '0.35rem' }}>{currentQ?.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
