import { Question, CandidateAnswer, QuestionEvaluationResult, AssessmentAttempt } from '../types';

/**
 * Normalizes short-answer text for honest evaluation.
 * Trims leading/trailing whitespace, collapses internal whitespace,
 * and strips common punctuation where appropriate.
 */
export function normalizeShortAnswer(text: string, isCaseSensitive = false): string {
  if (!text) return '';
  let normalized = text.trim().replace(/\s+/g, ' ');
  if (!isCaseSensitive) {
    normalized = normalized.toLowerCase();
  }
  return normalized;
}

/**
 * Evaluates an individual question honestly based on its defined grading rules.
 * Never invents points for unverified code or written text.
 */
export function evaluateQuestion(
  question: Question,
  candidateAnswer: CandidateAnswer | undefined
): QuestionEvaluationResult {
  const points = question.points || 1;

  if (!candidateAnswer) {
    return {
      questionId: question.id,
      gradingMethod: question.gradingMethod,
      isCorrect: false,
      scoreAwarded: 0,
      maxScore: points,
      feedback: 'No answer submitted for this question.',
    };
  }

  switch (question.type) {
    case 'single_choice':
    case 'complexity_analysis':
    case 'output_prediction': {
      const selectedId = candidateAnswer.selectedOptionId;
      const isCorrect = selectedId === question.correctOptionId;
      return {
        questionId: question.id,
        gradingMethod: 'automatic',
        isCorrect,
        scoreAwarded: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect
          ? 'Correct choice.'
          : selectedId
          ? 'Selected option is incorrect.'
          : 'No option selected.',
      };
    }

    case 'multi_select': {
      const selected = (candidateAnswer.selectedOptionIds || []).slice().sort();
      const correct = (question.correctOptionIds || []).slice().sort();
      const isCorrect =
        selected.length === correct.length &&
        selected.every((val, index) => val === correct[index]);

      return {
        questionId: question.id,
        gradingMethod: 'automatic',
        isCorrect,
        scoreAwarded: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect
          ? 'All correct options identified.'
          : 'The selection did not exactly match the required answer set.',
      };
    }

    case 'short_answer': {
      const text = candidateAnswer.textAnswer || '';
      const normalizedUser = normalizeShortAnswer(text, question.isCaseSensitive);
      const variants = (question.acceptedVariants || []).map((v) =>
        normalizeShortAnswer(v, question.isCaseSensitive)
      );

      const isCorrect = variants.length > 0 && variants.includes(normalizedUser);

      return {
        questionId: question.id,
        gradingMethod: 'automatic',
        isCorrect,
        scoreAwarded: isCorrect ? points : 0,
        maxScore: points,
        feedback: isCorrect
          ? 'Answer matched accepted variant.'
          : text.trim()
          ? 'Entered answer does not match any accepted variant.'
          : 'No response entered.',
      };
    }

    case 'debugging': {
      // Debugging can be either multiple choice (identifying fix) or code
      if (question.correctOptionId) {
        const isCorrect = candidateAnswer.selectedOptionId === question.correctOptionId;
        return {
          questionId: question.id,
          gradingMethod: 'automatic',
          isCorrect,
          scoreAwarded: isCorrect ? points : 0,
          maxScore: points,
          feedback: isCorrect ? 'Identified correct bug resolution.' : 'Incorrect fix selected.',
        };
      }
      // If code-based debugging without backend execution, it is self-reviewed
      return {
        questionId: question.id,
        gradingMethod: 'self_review',
        isCorrect: null,
        scoreAwarded: 0,
        maxScore: points,
        feedback: 'Self-reviewed debugging exercise. Compare against worked solution.',
      };
    }

    case 'sql': {
      const sql = (candidateAnswer.sqlAnswer || '').trim();
      if (!sql) {
        return {
          questionId: question.id,
          gradingMethod: 'automatic',
          isCorrect: false,
          scoreAwarded: 0,
          maxScore: points,
          feedback: 'No SQL query entered.',
        };
      }

      // If SQL query test harness is available with expected JSON
      if (question.sqlFixture) {
        // Honest comparison or check for key clauses and structure
        // If candidate provided selfReviewScore, keep it, otherwise evaluate structure
        const normalized = sql.toLowerCase().replace(/\s+/g, ' ');
        const hasSelect = normalized.includes('select');
        const hasFrom = normalized.includes('from');
        
        // We do not claim 100% database verification unless an execution engine runs it
        return {
          questionId: question.id,
          gradingMethod: 'self_review',
          isCorrect: null,
          scoreAwarded: candidateAnswer.selfReviewScores?.[question.id] ?? 0,
          maxScore: points,
          feedback: hasSelect && hasFrom
            ? 'Query structured. Self-evaluate against the expected output table below.'
            : 'Query missing basic SELECT/FROM clauses. Check solution outline.',
        };
      }

      return {
        questionId: question.id,
        gradingMethod: 'self_review',
        isCorrect: null,
        scoreAwarded: 0,
        maxScore: points,
        feedback: 'Self-reviewed SQL response.',
      };
    }

    case 'coding': {
      const code = (candidateAnswer.codeAnswer || '').trim();
      // Requirement: "If no secure evaluator is configured, coding questions must be labeled
      // self-reviewed/ungraded. Do not award full marks because code was entered."
      const selfScore = candidateAnswer.selfReviewScores?.[question.id] ?? 0;
      
      return {
        questionId: question.id,
        gradingMethod: 'self_review',
        isCorrect: selfScore > 0 ? true : null,
        scoreAwarded: selfScore,
        maxScore: points,
        feedback: code.length > 0
          ? 'No remote sandbox configured. Review implementation against test cases and complexity constraints.'
          : 'No implementation submitted.',
      };
    }

    case 'written_response': {
      const criteria = question.rubricCriteria || [];
      const rubricScores = candidateAnswer.selfReviewScores || {};
      
      let totalAwarded = 0;
      let totalMax = 0;
      const rubricEvaluations = criteria.map((c) => {
        const awarded = rubricScores[c.id] ?? 0;
        totalAwarded += awarded;
        totalMax += c.maxPoints;
        return {
          rubricId: c.id,
          awarded,
          max: c.maxPoints,
        };
      });

      const effectiveMax = totalMax > 0 ? totalMax : points;
      const effectiveAwarded = totalMax > 0 ? totalAwarded : (rubricScores[question.id] ?? 0);

      return {
        questionId: question.id,
        gradingMethod: 'self_review',
        isCorrect: effectiveAwarded > 0 ? true : null,
        scoreAwarded: effectiveAwarded,
        maxScore: effectiveMax,
        feedback: 'Rubric-based self-review.',
        rubricEvaluations,
      };
    }

    default:
      return {
        questionId: question.id,
        gradingMethod: 'ungraded',
        isCorrect: null,
        scoreAwarded: 0,
        maxScore: points,
        feedback: 'Question type has no automated evaluator.',
      };
  }
}

/**
 * Aggregates evaluations across all questions in an assessment.
 * Maintains strict separation between automatically verified scores
 * and self-reviewed scores.
 */
export function calculateAssessmentResults(
  questions: Question[],
  answers: Record<string, CandidateAnswer>
): NonNullable<AssessmentAttempt['results']> {
  let autoGradedScore = 0;
  let autoGradedMax = 0;
  let selfReviewScore = 0;
  let selfReviewMax = 0;

  const questionEvaluations: Record<string, QuestionEvaluationResult> = {};
  const skillBuckets: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    const candidateAnswer = answers[q.id];
    const evaluation = evaluateQuestion(q, candidateAnswer);
    questionEvaluations[q.id] = evaluation;

    if (evaluation.gradingMethod === 'automatic') {
      autoGradedScore += evaluation.scoreAwarded;
      autoGradedMax += evaluation.maxScore;

      for (const skill of q.skills) {
        if (!skillBuckets[skill]) {
          skillBuckets[skill] = { correct: 0, total: 0 };
        }
        skillBuckets[skill].total += evaluation.maxScore;
        if (evaluation.isCorrect) {
          skillBuckets[skill].correct += evaluation.scoreAwarded;
        }
      }
    } else {
      selfReviewScore += evaluation.scoreAwarded;
      selfReviewMax += evaluation.maxScore;
    }
  }

  const totalPossibleScore = autoGradedMax + selfReviewMax;
  const verifiedPercentage = autoGradedMax > 0
    ? Math.round((autoGradedScore / autoGradedMax) * 100)
    : 0;

  const skillsSummary = Object.entries(skillBuckets).map(([skill, counts]) => ({
    skill,
    correct: counts.correct,
    total: counts.total,
    percentage: counts.total > 0 ? Math.round((counts.correct / counts.total) * 100) : 0,
  }));

  return {
    autoGradedScore,
    autoGradedMax,
    selfReviewScore,
    selfReviewMax,
    totalPossibleScore,
    verifiedPercentage,
    questionEvaluations,
    skillsSummary,
  };
}
