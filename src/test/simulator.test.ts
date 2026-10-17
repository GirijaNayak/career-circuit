import { describe, it, expect, beforeEach } from 'vitest';
import {
  getActiveAssessmentAttempt,
  saveActiveAssessmentAttempt,
  getAssessmentAttempts,
  recordAssessmentAttempt,
  resetLocalData,
} from '../storage/localStorageService';
import { AssessmentAttempt } from '../types';

describe('Assessment Session State & Persistence', () => {
  beforeEach(() => {
    resetLocalData();
  });

  it('restores active in-progress assessment attempt on page refresh', () => {
    expect(getActiveAssessmentAttempt()).toBeNull();

    const activeAttempt: AssessmentAttempt = {
      id: 'att-session-123',
      assessmentId: 'assessment-fullstack-core',
      mode: 'timed',
      startTime: new Date().toISOString(),
      timeSpentSeconds: 150,
      status: 'in_progress',
      answers: {
        'q-mcq-hashmap': {
          questionId: 'q-mcq-hashmap',
          selectedOptionId: 'opt-2',
          markedForReview: true,
          lastModified: new Date().toISOString(),
        },
      },
    };

    saveActiveAssessmentAttempt(activeAttempt);

    // Simulate page reload
    const restored = getActiveAssessmentAttempt();
    expect(restored).not.toBeNull();
    expect(restored?.id).toBe('att-session-123');
    expect(restored?.answers['q-mcq-hashmap'].selectedOptionId).toBe('opt-2');
    expect(restored?.answers['q-mcq-hashmap'].markedForReview).toBe(true);
  });

  it('finalizes submitted assessment and clears active session', () => {
    const activeAttempt: AssessmentAttempt = {
      id: 'att-session-456',
      assessmentId: 'assessment-systems-concurrency',
      mode: 'untimed',
      startTime: new Date().toISOString(),
      timeSpentSeconds: 600,
      status: 'in_progress',
      answers: {},
    };

    saveActiveAssessmentAttempt(activeAttempt);
    expect(getActiveAssessmentAttempt()?.id).toBe('att-session-456');

    // Finalize submission
    const submittedAttempt: AssessmentAttempt = {
      ...activeAttempt,
      status: 'submitted',
      endTime: new Date().toISOString(),
      results: {
        autoGradedScore: 10,
        autoGradedMax: 10,
        selfReviewScore: 0,
        selfReviewMax: 0,
        totalPossibleScore: 10,
        verifiedPercentage: 100,
        questionEvaluations: {},
        skillsSummary: [],
      },
    };

    recordAssessmentAttempt(submittedAttempt);

    // Active session should now be cleared
    expect(getActiveAssessmentAttempt()).toBeNull();

    // Attempt must be safely archived in attempt history
    const allAttempts = getAssessmentAttempts();
    expect(allAttempts.some((a) => a.id === 'att-session-456')).toBe(true);
    expect(allAttempts[0].status).toBe('submitted');
  });
});
