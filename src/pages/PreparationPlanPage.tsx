import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  SkipForward,
  RotateCcw,
  BookOpen,
  Zap,
  Building2,
  Layers,
} from 'lucide-react';
import {
  getPreparationPlan,
  savePreparationPlan,
  updatePlanTaskStatus,
  subscribeToStorage,
} from '../storage/localStorageService';
import { PreparationPlan, PlanTask } from '../types';

export const PreparationPlanPage: React.FC = () => {
  const [plan, setPlan] = useState<PreparationPlan | null>(getPreparationPlan());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [targetWeekNumber, setTargetWeekNumber] = useState(1);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState<PlanTask['type']>('custom');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskRationale, setNewTaskRationale] = useState('');

  useEffect(() => {
    return subscribeToStorage(() => {
      setPlan(getPreparationPlan());
    });
  }, []);

  if (!plan) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <Calendar size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          No Active Preparation Plan
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem', maxWidth: '480px', margin: '0.5rem auto 1.5rem' }}>
          Build a personalized weekly preparation plan aligned with your target hiring track and target interview date.
        </p>
        <Link to="/onboarding" className="btn btn-primary">
          <Sparkles size={16} />
          <span>Create 4-Week Plan</span>
        </Link>
      </div>
    );
  }

  const handleToggleTask = (taskId: string, isCompleted: boolean) => {
    updatePlanTaskStatus(taskId, isCompleted);
  };

  const handleSkipTask = (taskId: string) => {
    const updatedGoals = plan.weeklyGoals.map((week) => ({
      ...week,
      tasks: week.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, isSkipped: !task.isSkipped };
        }
        return task;
      }),
    }));

    savePreparationPlan({
      ...plan,
      updatedAt: new Date().toISOString(),
      weeklyGoals: updatedGoals,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedGoals = plan.weeklyGoals.map((week) => ({
      ...week,
      tasks: week.tasks.filter((t) => t.id !== taskId),
    }));

    savePreparationPlan({
      ...plan,
      updatedAt: new Date().toISOString(),
      weeklyGoals: updatedGoals,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: PlanTask = {
      id: 'custom-' + Math.random().toString(36).substring(2, 8),
      title: newTaskTitle.trim(),
      type: newTaskType,
      estimatedMinutes: newTaskMinutes,
      rationale: newTaskRationale.trim() || 'Candidate custom study goal.',
      isCompleted: false,
      isSkipped: false,
    };

    const updatedGoals = plan.weeklyGoals.map((week) => {
      if (week.weekNumber === targetWeekNumber) {
        return {
          ...week,
          tasks: [...week.tasks, newTask],
        };
      }
      return week;
    });

    savePreparationPlan({
      ...plan,
      updatedAt: new Date().toISOString(),
      weeklyGoals: updatedGoals,
    });

    setNewTaskTitle('');
    setNewTaskRationale('');
    setIsAddTaskModalOpen(false);
  };

  // Progress counts
  let totalTasks = 0;
  let completedTasks = 0;
  plan.weeklyGoals.forEach((w) => {
    w.tasks.forEach((t) => {
      totalTasks++;
      if (t.isCompleted) completedTasks++;
    });
  });

  return (
    <div className="page-container" style={{ maxWidth: '920px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              Editable Preparation Plan
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {plan.targetRole} Roadmap
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            {plan.hiringTrack.toUpperCase()} Track · {plan.weeklyHours} hrs/week target
            {plan.targetDate ? ` · Target Interview: ${new Date(plan.targetDate).toLocaleDateString()}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/onboarding" className="btn btn-secondary btn-sm">
            <RotateCcw size={14} />
            <span>Regenerate Roadmap</span>
          </Link>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="surface-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Overall Roadmap Progress</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
            {completedTasks} of {totalTasks} tasks completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'var(--bg-muted)', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              background: 'var(--accent-primary)',
              width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Weekly Schedule Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {plan.weeklyGoals.map((week) => (
          <div key={week.weekNumber} className="surface-card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Week {week.weekNumber}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {week.theme}
                </h2>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setTargetWeekNumber(week.weekNumber);
                  setIsAddTaskModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Add Task to Week {week.weekNumber}</span>
              </button>
            </div>

            {/* Task list for this week */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {week.tasks.map((task) => {
                let taskLink = '/practice';
                if (task.type === 'assessment') {
                  taskLink = `/practice/${task.targetId || 'assessment-fullstack-core'}/briefing`;
                } else if (task.type === 'drill') {
                  taskLink = `/practice/drills?skill=${encodeURIComponent(task.targetId || 'Algorithms')}`;
                } else if (task.type === 'interview_prep') {
                  taskLink = `/interview-prep/${task.targetId || 'algorithms-ds'}`;
                } else if (task.type === 'employer_research') {
                  taskLink = `/companies/${task.targetId || ''}`;
                }

                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: task.isCompleted ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      opacity: task.isSkipped ? 0.6 : 1,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id, !task.isCompleted)}
                      title={task.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      style={{ marginTop: '2px', color: task.isCompleted ? '#10b981' : 'var(--border-strong)', cursor: 'pointer' }}
                    >
                      <CheckCircle2 size={20} />
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link
                          to={taskLink}
                          style={{
                            fontWeight: 600,
                            fontSize: '0.9375rem',
                            color: task.isCompleted ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            textDecoration: task.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </Link>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-tertiary)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {task.type}
                        </span>
                        {task.isSkipped && (
                          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                            Skipped
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {task.estimatedMinutes} mins · <strong>Rationale:</strong> {task.rationale}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleSkipTask(task.id)}
                        title={task.isSkipped ? 'Unskip task' : 'Skip task'}
                        aria-label="Skip task"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <SkipForward size={14} />
                      </button>

                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleDeleteTask(task.id)}
                        title="Remove task"
                        aria-label="Remove task"
                        style={{ width: '28px', height: '28px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Task Modal */}
      {isAddTaskModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Add custom preparation task">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                Add Task to Week {targetWeekNumber}
              </h3>
              <button type="button" className="btn-icon" onClick={() => setIsAddTaskModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Read Neetcode Dynamic Programming Guide"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Task Type</label>
                    <select
                      className="form-select"
                      value={newTaskType}
                      onChange={(e) => setNewTaskType(e.target.value as PlanTask['type'])}
                    >
                      <option value="custom">Custom Goal</option>
                      <option value="drill">Skill Drill</option>
                      <option value="assessment">Assessment</option>
                      <option value="interview_prep">Interview Prep</option>
                      <option value="employer_research">Employer Research</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Estimated Minutes</label>
                    <input
                      type="number"
                      className="form-input"
                      min="5"
                      max="300"
                      value={newTaskMinutes}
                      onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Why are you adding this task?</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Reinforce memoization before live interview."
                    value={newTaskRationale}
                    onChange={(e) => setNewTaskRationale(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
