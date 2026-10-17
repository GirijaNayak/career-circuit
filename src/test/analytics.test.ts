import { describe, it, expect } from 'vitest';
import { calculateSkillAnalytics } from '../domain/analytics';
import { AssessmentAttempt } from '../types';

describe('Skill Analytics & Statistical Confidence Rules', () => {
  it('returns empty array when there are no submitted attempts', () => {
    const attempts: AssessmentAttempt[] = [
      {
        id: 'att-1',
        assessmentId: 'a1',
        mode: 'timed',
        startTime: new Date().toISOString(),
        timeSpentSeconds: 120,
        status: 'in_progress', // Not submitted
        answers: {},
      },
    ];

    expect(calculateSkillAnalytics(attempts)).toEqual([]);
  });

  it('marks skills with fewer than 5 attempts as Insufficient Data to prevent false mastery', () => {
    const attempts: AssessmentAttempt[] = [
      {
        id: 'att-1',
        assessmentId: 'a1',
        mode: 'timed',
        startTime: new Date().toISOString(),
        timeSpentSeconds: 600,
        status: 'submitted',
        answers: {},
        results: {
          autoGradedScore: 1,
          autoGradedMax: 1,
          selfReviewScore: 0,
          selfReviewMax: 0,
          totalPossibleScore: 1,
          verifiedPercentage: 100,
          questionEvaluations: {},
          skillsSummary: [
            {
              skill: 'Concurrency',
              correct: 1,
              total: 1, // Only 1 attempt! 100% accuracy, but tiny sample size
              percentage: 100,
            },
          ],
        },
      },
    ];

    const analytics = calculateSkillAnalytics(attempts);
    expect(analytics.length).toBe(1);
    expect(analytics[0].skill).toBe('Concurrency');
    expect(analytics[0].accuracyPercentage).toBe(100);
    // Crucial requirement: never label a skill mastered from a tiny sample
    expect(analytics[0].statusLabel).toBe('Insufficient Data');
    expect(analytics[0].isReliable).toBe(false);
  });

  it('marks skills with >= 10 attempts and >= 80% as Proficient', () => {
    const attempts: AssessmentAttempt[] = [
      {
        id: 'att-1',
        assessmentId: 'a1',
        mode: 'timed',
        startTime: new Date().toISOString(),
        timeSpentSeconds: 1200,
        status: 'submitted',
        answers: {},
        results: {
          autoGradedScore: 9,
          autoGradedMax: 10,
          selfReviewScore: 0,
          selfReviewMax: 0,
          totalPossibleScore: 10,
          verifiedPercentage: 90,
          questionEvaluations: {},
          skillsSummary: [
            {
              skill: 'SQL',
              correct: 9,
              total: 10,
              percentage: 90,
            },
          ],
        },
      },
    ];

    const analytics = calculateSkillAnalytics(attempts);
    expect(analytics.length).toBe(1);
    expect(analytics[0].skill).toBe('SQL');
    expect(analytics[0].accuracyPercentage).toBe(90);
    expect(analytics[0].statusLabel).toBe('Proficient');
    expect(analytics[0].isReliable).toBe(true);
  });
});
