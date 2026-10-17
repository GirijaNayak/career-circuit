import { describe, it, expect } from 'vitest';
import { evaluateQuestion, calculateAssessmentResults, normalizeShortAnswer } from '../domain/scoring';
import { Question, CandidateAnswer } from '../types';

describe('Domain Scoring Rules & Honest Evaluation', () => {
  it('normalizes short answers by trimming, collapsing spaces, and lowercasing', () => {
    expect(normalizeShortAnswer('  62   hosts  ', false)).toBe('62 hosts');
    expect(normalizeShortAnswer('62', false)).toBe('62');
    expect(normalizeShortAnswer('  CaseSensitive  ', true)).toBe('CaseSensitive');
  });

  it('correctly scores single_choice questions with exact match', () => {
    const question: Question = {
      id: 'q-sc',
      type: 'single_choice',
      title: 'Sample MCQ',
      prompt: 'Pick B',
      skills: ['Algorithms'],
      difficulty: 'beginner',
      evidenceCategory: 'original_practice',
      gradingMethod: 'automatic',
      points: 10,
      correctOptionId: 'opt-b',
      explanation: 'Explanation',
      hints: [],
    };

    const correctAns: CandidateAnswer = {
      questionId: 'q-sc',
      selectedOptionId: 'opt-b',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const wrongAns: CandidateAnswer = {
      questionId: 'q-sc',
      selectedOptionId: 'opt-a',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    expect(evaluateQuestion(question, correctAns).scoreAwarded).toBe(10);
    expect(evaluateQuestion(question, correctAns).isCorrect).toBe(true);

    expect(evaluateQuestion(question, wrongAns).scoreAwarded).toBe(0);
    expect(evaluateQuestion(question, wrongAns).isCorrect).toBe(false);
  });

  it('correctly scores multi_select questions requiring exact subset match', () => {
    const question: Question = {
      id: 'q-ms',
      type: 'multi_select',
      title: 'Sample Multi',
      prompt: 'Pick A and C',
      skills: ['Networks'],
      difficulty: 'intermediate',
      evidenceCategory: 'original_practice',
      gradingMethod: 'automatic',
      points: 15,
      correctOptionIds: ['opt-a', 'opt-c'],
      explanation: 'Explanation',
      hints: [],
    };

    const perfectAns: CandidateAnswer = {
      questionId: 'q-ms',
      selectedOptionIds: ['opt-c', 'opt-a'], // Different order should still pass
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const partialAns: CandidateAnswer = {
      questionId: 'q-ms',
      selectedOptionIds: ['opt-a'], // Missing opt-c
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const extraAns: CandidateAnswer = {
      questionId: 'q-ms',
      selectedOptionIds: ['opt-a', 'opt-b', 'opt-c'], // Extra opt-b
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    expect(evaluateQuestion(question, perfectAns).scoreAwarded).toBe(15);
    expect(evaluateQuestion(question, perfectAns).isCorrect).toBe(true);

    expect(evaluateQuestion(question, partialAns).scoreAwarded).toBe(0);
    expect(evaluateQuestion(question, partialAns).isCorrect).toBe(false);

    expect(evaluateQuestion(question, extraAns).scoreAwarded).toBe(0);
    expect(evaluateQuestion(question, extraAns).isCorrect).toBe(false);
  });

  it('correctly scores short_answer against accepted variants with normalization', () => {
    const question: Question = {
      id: 'q-sa',
      type: 'short_answer',
      title: 'Subnet host count',
      prompt: 'Enter number',
      skills: ['Networks'],
      difficulty: 'beginner',
      evidenceCategory: 'original_practice',
      gradingMethod: 'automatic',
      points: 10,
      acceptedVariants: ['62', '62 hosts'],
      isCaseSensitive: false,
      explanation: '62 usable hosts',
      hints: [],
    };

    const exactAns: CandidateAnswer = {
      questionId: 'q-sa',
      textAnswer: '62',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const paddedAns: CandidateAnswer = {
      questionId: 'q-sa',
      textAnswer: '  62   HOSTS  ',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const wrongAns: CandidateAnswer = {
      questionId: 'q-sa',
      textAnswer: '64',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    expect(evaluateQuestion(question, exactAns).isCorrect).toBe(true);
    expect(evaluateQuestion(question, exactAns).scoreAwarded).toBe(10);

    expect(evaluateQuestion(question, paddedAns).isCorrect).toBe(true);
    expect(evaluateQuestion(question, paddedAns).scoreAwarded).toBe(10);

    expect(evaluateQuestion(question, wrongAns).isCorrect).toBe(false);
    expect(evaluateQuestion(question, wrongAns).scoreAwarded).toBe(0);
  });

  it('never automatically awards full marks for coding questions without a secure evaluator', () => {
    const question: Question = {
      id: 'q-code',
      type: 'coding',
      title: 'Two Sum',
      prompt: 'Write two sum',
      skills: ['Algorithms'],
      difficulty: 'intermediate',
      evidenceCategory: 'original_practice',
      gradingMethod: 'self_review',
      points: 20,
      explanation: 'Explanation',
      hints: [],
    };

    // Candidate entered arbitrary non-empty code
    const answerWithCode: CandidateAnswer = {
      questionId: 'q-code',
      codeAnswer: 'def two_sum(): return [0, 1]',
      markedForReview: false,
      lastModified: new Date().toISOString(),
    };

    const evalResult = evaluateQuestion(question, answerWithCode);
    expect(evalResult.gradingMethod).toBe('self_review');
    // Without self-review score explicitly given by user, default awarded points MUST be 0!
    expect(evalResult.scoreAwarded).toBe(0);
    expect(evalResult.maxScore).toBe(20);
  });

  it('maintains strict separation between auto-graded and self-reviewed points in aggregate results', () => {
    const q1: Question = {
      id: 'q1',
      type: 'single_choice',
      title: 'Q1',
      prompt: 'P1',
      skills: ['Algorithms'],
      difficulty: 'beginner',
      evidenceCategory: 'original_practice',
      gradingMethod: 'automatic',
      points: 10,
      correctOptionId: 'opt-1',
      explanation: 'E1',
      hints: [],
    };

    const q2: Question = {
      id: 'q2',
      type: 'written_response',
      title: 'Q2',
      prompt: 'P2',
      skills: ['System Design'],
      difficulty: 'advanced',
      evidenceCategory: 'original_practice',
      gradingMethod: 'self_review',
      points: 20,
      rubricCriteria: [
        { id: 'r1', label: 'R1', maxPoints: 10, description: 'D1' },
        { id: 'r2', label: 'R2', maxPoints: 10, description: 'D2' },
      ],
      explanation: 'E2',
      hints: [],
    };

    const answers: Record<string, CandidateAnswer> = {
      q1: {
        questionId: 'q1',
        selectedOptionId: 'opt-1', // Correct (10/10)
        markedForReview: false,
        lastModified: new Date().toISOString(),
      },
      q2: {
        questionId: 'q2',
        textAnswer: 'Detailed system analysis',
        selfReviewScores: { r1: 8, r2: 7 }, // 15 / 20 self-reviewed
        markedForReview: false,
        lastModified: new Date().toISOString(),
      },
    };

    const results = calculateAssessmentResults([q1, q2], answers);

    // Auto-graded must strictly be 10 / 10 (100% verified)
    expect(results.autoGradedScore).toBe(10);
    expect(results.autoGradedMax).toBe(10);
    expect(results.verifiedPercentage).toBe(100);

    // Self-reviewed must strictly be 15 / 20
    expect(results.selfReviewScore).toBe(15);
    expect(results.selfReviewMax).toBe(20);

    // Total possible
    expect(results.totalPossibleScore).toBe(30);

    // Skills summary strictly covers verified auto-graded skills
    const algoSkill = results.skillsSummary.find((s) => s.skill === 'Algorithms');
    expect(algoSkill?.correct).toBe(10);
    expect(algoSkill?.total).toBe(10);
  });
});
