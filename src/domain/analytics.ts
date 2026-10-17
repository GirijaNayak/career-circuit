import { AssessmentAttempt } from '../types';

export interface SkillAnalyticsItem {
  skill: string;
  totalAttempts: number;
  correctCount: number;
  accuracyPercentage: number;
  statusLabel: 'Needs Practice' | 'Developing' | 'Proficient' | 'Insufficient Data';
  isReliable: boolean; // Needs at least 5 attempts to be considered moderately reliable
  statusDescription: string;
}

/**
 * Calculates honest skill accuracy metrics strictly from verified automatic grading results.
 * Explicitly surfaces sample size to prevent misleading mastery claims.
 */
export function calculateSkillAnalytics(attempts: AssessmentAttempt[]): SkillAnalyticsItem[] {
  const map: Record<string, { total: number; correct: number }> = {};

  const submittedAttempts = attempts.filter((a) => a.status === 'submitted' && a.results);

  for (const attempt of submittedAttempts) {
    if (!attempt.results?.skillsSummary) continue;
    for (const item of attempt.results.skillsSummary) {
      if (!map[item.skill]) {
        map[item.skill] = { total: 0, correct: 0 };
      }
      map[item.skill].total += item.total;
      map[item.skill].correct += item.correct;
    }
  }

  const results: SkillAnalyticsItem[] = Object.entries(map).map(([skill, stat]) => {
    const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
    const isReliable = stat.total >= 5;

    let statusLabel: SkillAnalyticsItem['statusLabel'] = 'Insufficient Data';
    let statusDescription = `Only ${stat.total} attempt${stat.total === 1 ? '' : 's'}. Need at least 5 attempts before statistical confidence.`;

    if (stat.total >= 5) {
      if (accuracy >= 80 && stat.total >= 10) {
        statusLabel = 'Proficient';
        statusDescription = 'High accuracy across 10+ verified evaluation questions.';
      } else if (accuracy >= 65) {
        statusLabel = 'Developing';
        statusDescription = 'Consistent fundamentals, but review recurring edge-case pitfalls.';
      } else {
        statusLabel = 'Needs Practice';
        statusDescription = 'Below target threshold. Recommended for targeted drills.';
      }
    }

    return {
      skill,
      totalAttempts: stat.total,
      correctCount: stat.correct,
      accuracyPercentage: accuracy,
      statusLabel,
      isReliable,
      statusDescription,
    };
  });

  // Sort by lowest accuracy first so candidates immediately spot weak areas
  return results.sort((a, b) => a.accuracyPercentage - b.accuracyPercentage);
}
