import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  BookOpen,
  Award,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import {
  getPreparationPlan,
  getAssessmentAttempts,
  getActiveAssessmentAttempt,
  getBookmarkedEmployerIds,
  subscribeToStorage,
  updatePlanTaskStatus,
} from '../storage/localStorageService';
import { getAssessmentById, getEmployerById, getAllEmployers } from '../data';
import { calculateSkillAnalytics } from '../domain/analytics';
import { EvidenceBadge } from '../components/common/EvidenceBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Employer } from '../types';

export const DashboardPage: React.FC = () => {
  const [plan, setPlan] = useState(getPreparationPlan());
  const [attempts, setAttempts] = useState(getAssessmentAttempts());
  const [activeAttempt, setActiveAttempt] = useState(getActiveAssessmentAttempt());
  const [bookmarkedIds, setBookmarkedIds] = useState(getBookmarkedEmployerIds());

  useEffect(() => {
    return subscribeToStorage(() => {
      setPlan(getPreparationPlan());
      setAttempts(getAssessmentAttempts());
      setActiveAttempt(getActiveAssessmentAttempt());
      setBookmarkedIds(getBookmarkedEmployerIds());
    });
  }, []);

  // Determine Next Recommended Activity
  let nextTask: {
    title: string;
    description: string;
    link: string;
    actionLabel: string;
    rationale: string;
  } = {
    title: 'Complete Baseline Diagnostic Assessment',
    description: 'Calibrate your problem solving and code analysis accuracy across foundational topics.',
    link: '/practice/assessment-fullstack-core/briefing',
    actionLabel: 'Start Diagnostic (45m)',
    rationale: 'Initial diagnostic assessment recommended to establish your baseline skill profile.',
  };

  if (plan) {
    // Find first uncompleted task
    for (const week of plan.weeklyGoals) {
      const pendingTask = week.tasks.find((t) => !t.isCompleted && !t.isSkipped);
      if (pendingTask) {
        let taskLink = '/practice';
        let action = 'Start Task';
        if (pendingTask.type === 'assessment') {
          taskLink = `/practice/${pendingTask.targetId || 'assessment-fullstack-core'}/briefing`;
          action = 'Start Assessment';
        } else if (pendingTask.type === 'drill') {
          taskLink = `/practice/drills?skill=${encodeURIComponent(pendingTask.targetId || 'Algorithms')}`;
          action = 'Practice Drill';
        } else if (pendingTask.type === 'interview_prep') {
          taskLink = `/interview-prep/${pendingTask.targetId || 'algorithms-ds'}`;
          action = 'Open Module';
        } else if (pendingTask.type === 'employer_research') {
          taskLink = `/companies/${pendingTask.targetId || ''}`;
          action = 'Research Stages';
        }

        nextTask = {
          title: pendingTask.title,
          description: `Part of Week ${week.weekNumber}: ${week.theme}`,
          link: taskLink,
          actionLabel: `${action} (${pendingTask.estimatedMinutes}m)`,
          rationale: pendingTask.rationale,
        };
        break;
      }
    }
  }

  // Active resumable assessment
  const activeAssessment = activeAttempt ? getAssessmentById(activeAttempt.assessmentId) : null;

  // Compute skill analytics
  const skillStats = calculateSkillAnalytics(attempts);

  // Bookmarked employers data
  const bookmarkedEmployers = bookmarkedIds
    .map((id) => getEmployerById(id))
    .filter((e): e is Employer => Boolean(e));

  // Completed tasks count
  let totalTasks = 0;
  let completedTasks = 0;
  if (plan) {
    plan.weeklyGoals.forEach((w) => {
      w.tasks.forEach((t) => {
        totalTasks++;
        if (t.isCompleted) completedTasks++;
      });
    });
  }

  return (
    <div className="page-container">
      {/* Resumable Session Alert */}
      {activeAttempt && activeAssessment && (
        <div
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <RotateCcw size={20} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Active Assessment Session in Progress
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                You have an incomplete session for &ldquo;{activeAssessment.title}&rdquo; ({activeAttempt.mode} mode). Your answers are automatically saved.
              </div>
            </div>
          </div>
          <Link
            to={`/practice/${activeAssessment.id}/session`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <span>Resume Assessment</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Candidate Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Preparation Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', fontSize: '0.9375rem' }}>
            {plan
              ? `Targeting ${plan.targetRole} (${plan.hiringTrack} track) · ${plan.weeklyHours}h weekly goal`
              : 'Guest mode: Explore hiring stages or build a structured preparation plan.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {!plan ? (
            <Link to="/onboarding" className="btn btn-primary">
              <Sparkles size={16} />
              <span>Create Preparation Plan</span>
            </Link>
          ) : (
            <Link to="/onboarding" className="btn btn-secondary">
              <span>Edit Plan Preferences</span>
            </Link>
          )}
        </div>
      </div>

      {/* Primary Call to Action: Next Recommended Activity */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '4px',
            background: 'var(--accent-primary)',
          }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ maxWidth: '650px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--accent-primary)',
                marginBottom: '0.5rem',
              }}
            >
              <Compass size={14} />
              <span>Next Recommended Activity</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {nextTask.title}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {nextTask.description}
            </p>
            <div
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-tertiary)',
                background: 'var(--bg-subtle)',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-xs)',
                borderLeft: '2px solid var(--border-strong)',
              }}
            >
              <strong>Why suggested:</strong> {nextTask.rationale}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
            <Link to={nextTask.link} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <Play size={16} />
              <span>{nextTask.actionLabel}</span>
            </Link>
            {plan && (
              <Link
                to="/plan"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  textDecoration: 'underline',
                  marginTop: '0.25rem',
                }}
              >
                View full weekly schedule →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Plan Progress & Skill Analytics */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        {/* Plan Progress Section */}
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Preparation Plan Progress</span>
            </h3>
            {plan && (
              <Link to="/plan" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Manage Plan →
              </Link>
            )}
          </div>

          {plan ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed Tasks</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {completedTasks} of {totalTasks} ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '999px',
                  background: 'var(--bg-muted)',
                  overflow: 'hidden',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--accent-primary)',
                    width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Next upcoming tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plan.weeklyGoals[0]?.tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: task.isCompleted ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updatePlanTaskStatus(task.id, !task.isCompleted)}
                      title={task.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      style={{ marginTop: '2px', color: task.isCompleted ? '#10b981' : 'var(--border-strong)' }}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                          color: task.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                        }}
                      >
                        {task.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {task.estimatedMinutes} mins · {task.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                You have not generated a preparation plan yet. Answer a few questions about your target role and timeline to receive weekly recommendations.
              </p>
              <Link to="/onboarding" className="btn btn-secondary btn-sm">
                Set up 4-Week Plan
              </Link>
            </div>
          )}
        </div>

        {/* Skill Accuracy & Analytics Section */}
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Skill Performance</span>
            </h3>
            <Link to="/progress" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Full Analytics →
            </Link>
          </div>

          {skillStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {skillStats.slice(0, 4).map((stat) => (
                <div key={stat.skill} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {stat.skill}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {stat.correctCount} / {stat.totalAttempts} ({stat.accuracyPercentage}%)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ color: stat.isReliable ? 'var(--text-secondary)' : 'var(--status-community-text)' }}>
                      {stat.statusLabel} {stat.isReliable ? '· 5+ attempts' : '· Low sample size'}
                    </span>
                    <Link
                      to={`/practice/drills?skill=${encodeURIComponent(stat.skill)}`}
                      style={{ color: 'var(--accent-primary)', fontWeight: 500 }}
                    >
                      Practice drill →
                    </Link>
                  </div>
                </div>
              ))}
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <HelpCircle size={13} />
                <span>Computed exclusively from verified auto-graded questions. Mastery requires ≥10 attempts.</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                No completed assessment attempts yet. Take your first practice assessment to track skill accuracy.
              </p>
              <Link to="/practice" className="btn btn-secondary btn-sm">
                Browse Assessment Catalog
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Attempts & Saved Employers */}
      <div className="grid-2">
        {/* Recent Attempts */}
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Recent Practice Attempts</span>
            </h3>
            <Link to="/progress" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              View History →
            </Link>
          </div>

          {attempts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {attempts.slice(0, 3).map((att) => {
                const assessment = getAssessmentById(att.assessmentId);
                const score = att.results?.autoGradedScore ?? 0;
                const max = att.results?.autoGradedMax ?? 0;
                const percentage = att.results?.verifiedPercentage ?? 0;

                return (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {assessment?.title || 'Practice Assessment'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {att.mode.toUpperCase()} · {Math.round(att.timeSpentSeconds / 60)}m spent ·{' '}
                        {new Date(att.startTime).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        {score} / {max} ({percentage}%)
                      </div>
                      <Link
                        to={`/practice/${att.assessmentId}/results/${att.id}`}
                        style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}
                      >
                        Review Breakdown →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No attempts recorded"
              description="Complete a timed assessment simulation or untimed practice to review detailed question explanations."
              actionText="Start Practice"
              onAction={() => window.location.assign('/practice')}
            />
          )}
        </div>

        {/* Saved Employers */}
        <div className="surface-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} style={{ color: 'var(--accent-primary)' }} />
              <span>Saved Employers</span>
            </h3>
            <Link to="/companies" style={{ fontSize: '0.8125rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              All Employers ({getAllEmployers().length}) →
            </Link>
          </div>

          {bookmarkedEmployers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookmarkedEmployers.map((emp) => (
                <div
                  key={emp.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <Link
                      to={`/companies/${emp.id}`}
                      style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}
                    >
                      {emp.name}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      {emp.category} · {emp.hiringStages.length} verified stages
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <EvidenceBadge category={emp.hiringStages[0]?.evidenceCategory || 'community_reported'} />
                    <Link to={`/companies/${emp.id}`} className="btn btn-secondary btn-sm">
                      View Stages
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No employers bookmarked"
              description="Bookmark companies you are interviewing with to quickly inspect their hiring stages, typical questions, and evidence sources."
              actionText="Browse Employers"
              onAction={() => window.location.assign('/companies')}
            />
          )}
        </div>
      </div>
    </div>
  );
};
