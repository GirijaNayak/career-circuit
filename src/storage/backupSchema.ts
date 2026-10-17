import { z } from 'zod';

export const CURRENT_SCHEMA_VERSION = 1;

export const UserPreferencesSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  highContrast: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
  fontSize: z.enum(['standard', 'large']).default('standard'),
  remoteEvaluatorUrl: z.string().optional(),
  remoteSyncUrl: z.string().optional(),
});

export const PlanTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['assessment', 'drill', 'interview_prep', 'employer_research', 'custom']),
  targetId: z.string().optional(),
  estimatedMinutes: z.number().nonnegative(),
  rationale: z.string(),
  isCompleted: z.boolean(),
  isSkipped: z.boolean(),
});

export const WeeklyGoalSchema = z.object({
  weekNumber: z.number().int().positive(),
  theme: z.string(),
  tasks: z.array(PlanTaskSchema),
});

export const PreparationPlanSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  targetRole: z.string(),
  hiringTrack: z.enum(['internship', 'campus', 'off_campus', 'experienced']),
  targetEmployerIds: z.array(z.string()),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  focusSkills: z.array(z.string()),
  targetDate: z.string().optional(),
  weeklyHours: z.number().nonnegative(),
  weeklyGoals: z.array(WeeklyGoalSchema),
});

export const CandidateAnswerSchema = z.object({
  questionId: z.string(),
  selectedOptionId: z.string().optional(),
  selectedOptionIds: z.array(z.string()).optional(),
  textAnswer: z.string().optional(),
  codeAnswer: z.string().optional(),
  sqlAnswer: z.string().optional(),
  selfReviewScores: z.record(z.string(), z.number()).optional(),
  selfReviewNotes: z.string().optional(),
  markedForReview: z.boolean(),
  lastModified: z.string(),
});

export const QuestionEvaluationResultSchema = z.object({
  questionId: z.string(),
  gradingMethod: z.enum(['automatic', 'self_review', 'ungraded']),
  isCorrect: z.boolean().nullable(),
  scoreAwarded: z.number(),
  maxScore: z.number(),
  feedback: z.string(),
  testResults: z.array(z.object({
    testCaseId: z.string(),
    passed: z.boolean(),
    actualOutput: z.string(),
    expectedOutput: z.string(),
    error: z.string().optional(),
  })).optional(),
  rubricEvaluations: z.array(z.object({
    rubricId: z.string(),
    awarded: z.number(),
    max: z.number(),
  })).optional(),
});

export const AssessmentAttemptSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  mode: z.enum(['timed', 'untimed']),
  startTime: z.string(),
  endTime: z.string().optional(),
  timeSpentSeconds: z.number().nonnegative(),
  status: z.enum(['in_progress', 'submitted']),
  answers: z.record(z.string(), CandidateAnswerSchema),
  results: z.object({
    autoGradedScore: z.number(),
    autoGradedMax: z.number(),
    selfReviewScore: z.number(),
    selfReviewMax: z.number(),
    totalPossibleScore: z.number(),
    verifiedPercentage: z.number(),
    questionEvaluations: z.record(z.string(), QuestionEvaluationResultSchema),
    skillsSummary: z.array(z.object({
      skill: z.string(),
      correct: z.number(),
      total: z.number(),
      percentage: z.number(),
    })),
  }).optional(),
});

export const InterviewModuleProgressSchema = z.object({
  moduleKey: z.string(),
  promptNotes: z.record(z.string(), z.string()),
  completedPromptIds: z.array(z.string()),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  lastUpdated: z.string(),
});

export const UserDataBackupSchema = z.object({
  schemaVersion: z.number().int().min(1),
  exportedAt: z.string(),
  appVersion: z.string(),
  preferences: UserPreferencesSchema,
  bookmarkedEmployerIds: z.array(z.string()).default([]),
  comparedEmployerIds: z.array(z.string()).default([]),
  preparationPlan: PreparationPlanSchema.nullable().default(null),
  assessmentAttempts: z.array(AssessmentAttemptSchema).default([]),
  interviewProgress: z.record(z.string(), InterviewModuleProgressSchema).default({}),
  drillStats: z.record(z.string(), z.object({
    attempts: z.number(),
    correct: z.number(),
  })).default({}),
});

export type UserDataBackupValidated = z.infer<typeof UserDataBackupSchema>;

export interface ValidationSuccess {
  success: true;
  data: UserDataBackupValidated;
}

export interface ValidationFailure {
  success: false;
  error: string;
}

export function validateBackupFile(rawJsonString: string): ValidationSuccess | ValidationFailure {
  try {
    const parsed = JSON.parse(rawJsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Backup file must contain a valid JSON object.' };
    }

    if (typeof parsed.schemaVersion !== 'number') {
      return { success: false, error: 'Backup is missing required schemaVersion property.' };
    }

    if (parsed.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return {
        success: false,
        error: `Incompatible backup format: File has schemaVersion ${parsed.schemaVersion}, but current application supports up to version ${CURRENT_SCHEMA_VERSION}. Please update CareerCircuit.`,
      };
    }

    const result = UserDataBackupSchema.safeParse(parsed);
    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue.path.join('.') || 'root';
      return {
        success: false,
        error: `Validation failed at field '${path}': ${issue.message}`,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (err) {
    return {
      success: false,
      error: `JSON parsing error: ${err instanceof Error ? err.message : 'Unknown parsing error'}`,
    };
  }
}
