import { describe, it, expect, beforeEach } from 'vitest';
import { generatePreparationPlan } from '../domain/planGenerator';
import {
  savePreparationPlan,
  getPreparationPlan,
  updatePlanTaskStatus,
  resetLocalData,
} from '../storage/localStorageService';

describe('Preparation Plan Generation & Editing', () => {
  beforeEach(() => {
    resetLocalData();
  });

  it('generates a 4-week structured plan when no target date is supplied', () => {
    const plan = generatePreparationPlan({
      targetRole: 'Backend Engineer',
      hiringTrack: 'campus',
      targetEmployerIds: ['emp-stripe'],
      skillLevel: 'intermediate',
      focusSkills: ['Algorithms', 'SQL'],
      weeklyHours: 10,
    });

    expect(plan.weeklyGoals.length).toBe(4);
    expect(plan.targetRole).toBe('Backend Engineer');
    expect(plan.hiringTrack).toBe('campus');

    // Every task must contain an explainable rationale
    plan.weeklyGoals.forEach((week) => {
      expect(week.tasks.length).toBeGreaterThan(0);
      week.tasks.forEach((task) => {
        expect(task.rationale).toBeDefined();
        expect(task.rationale.length).toBeGreaterThan(10);
        expect(task.isCompleted).toBe(false);
      });
    });
  });

  it('adjusts duration dynamically when a target date is provided', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45); // ~6.5 weeks

    const plan = generatePreparationPlan({
      targetRole: 'Systems Engineer',
      hiringTrack: 'internship',
      targetEmployerIds: ['emp-datadog'],
      skillLevel: 'advanced',
      focusSkills: ['Concurrency', 'Networks'],
      targetDate: futureDate.toISOString(),
      weeklyHours: 15,
    });

    expect(plan.weeklyGoals.length).toBe(7);
  });

  it('updates task completion status cleanly in stored plan', () => {
    const plan = generatePreparationPlan({
      targetRole: 'Full Stack Engineer',
      hiringTrack: 'off_campus',
      targetEmployerIds: ['emp-atlassian'],
      skillLevel: 'intermediate',
      focusSkills: ['JavaScript', 'System Design'],
      weeklyHours: 8,
    });

    savePreparationPlan(plan);
    const firstTaskId = plan.weeklyGoals[0].tasks[0].id;

    const updated = updatePlanTaskStatus(firstTaskId, true);
    expect(updated).toBe(true);

    const reloaded = getPreparationPlan();
    expect(reloaded?.weeklyGoals[0].tasks[0].isCompleted).toBe(true);
  });
});
