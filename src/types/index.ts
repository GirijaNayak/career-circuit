export type EvidenceCategory = 
  | 'official_source' 
  | 'community_reported' 
  | 'original_practice' 
  | 'unknown';

export type RoleLevel = 'intern' | 'new_grad' | 'junior' | 'mid';

export type HiringTrack = 'internship' | 'campus' | 'off_campus' | 'experienced';

export type HiringStageType = 
  | 'resume_screen'
  | 'online_assessment'
  | 'technical_screen'
  | 'onsite_coding'
  | 'onsite_system_design'
  | 'behavioral'
  | 'hiring_manager';

export interface SourceCitation {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedDate?: string;
  accessDate: string;
  lastReviewedDate: string;
  evidenceCategory: EvidenceCategory;
  claimSupported: string;
  uncertaintyNotes?: string;
}

export interface HiringStage {
  id: string;
  order: number;
  name: string;
  type: HiringStageType;
  durationMins?: number;
  format: string;
  evidenceCategory: EvidenceCategory;
  sourceIds: string[];
  knownVariations?: string;
  focusAreas: string[];
}

export interface RoleTrack {
  track: string;
  level: string;
  description: string;
  typicalTechStack: string[];
}

export interface Employer {
  id: string;
  name: string;
  aliases: string[];
  slug: string;
  category: 'FinTech' | 'Infrastructure & Cloud' | 'Enterprise SaaS' | 'Quantitative Trading' | 'Developer Tools' | 'Cybersecurity';
  overview: string;
  locations: string[];
  engineeringHubs: string[];
  roleTracks: RoleTrack[];
  hiringStages: HiringStage[];
  sources: SourceCitation[];
  lastReviewedDate: string;
  evidenceConfidence: 'high' | 'medium' | 'low';
  uncertaintyNotes: string[];
  practiceAssessmentIds: string[];
}

export type QuestionType =
  | 'single_choice'
  | 'multi_select'
  | 'short_answer'
  | 'sql'
  | 'coding'
  | 'complexity_analysis'
  | 'debugging'
  | 'output_prediction'
  | 'written_response';

export type QuestionDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type GradingMethod = 'automatic' | 'self_review' | 'ungraded';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  description?: string;
}

export interface SqlFixture {
  schemaSql: string;
  seedSql: string;
  expectedResultJson: string; // JSON table string
}

export interface RubricCriterion {
  id: string;
  label: string;
  maxPoints: number;
  description: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  prompt: string;
  skills: string[];
  difficulty: QuestionDifficulty;
  evidenceCategory: EvidenceCategory; // Typically 'original_practice'
  gradingMethod: GradingMethod;
  points: number;
  options?: QuestionOption[];
  correctOptionId?: string;
  correctOptionIds?: string[];
  acceptedVariants?: string[]; // for normalized short answers
  isCaseSensitive?: boolean;
  codeStarter?: string;
  language?: string;
  codeSolution?: string;
  testCases?: TestCase[];
  sqlFixture?: SqlFixture;
  rubricCriteria?: RubricCriterion[];
  explanation: string;
  hints: string[];
  commonPitfalls?: string[];
}

export interface Assessment {
  id: string;
  title: string;
  slug: string;
  description: string;
  skills: string[];
  difficulty: QuestionDifficulty;
  estimatedDurationMins: number;
  associatedEmployerIds: string[];
  evidenceCategory: EvidenceCategory;
  questionIds: string[];
  timedSupported: boolean;
  untimedSupported: boolean;
  disclaimer: string;
}

export interface CandidateAnswer {
  questionId: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  textAnswer?: string;
  codeAnswer?: string;
  sqlAnswer?: string;
  selfReviewScores?: Record<string, number>;
  selfReviewNotes?: string;
  markedForReview: boolean;
  lastModified: string;
}

export interface QuestionEvaluationResult {
  questionId: string;
  gradingMethod: GradingMethod;
  isCorrect: boolean | null;
  scoreAwarded: number;
  maxScore: number;
  feedback: string;
  testResults?: {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    error?: string;
  }[];
  rubricEvaluations?: {
    rubricId: string;
    awarded: number;
    max: number;
  }[];
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  mode: 'timed' | 'untimed';
  startTime: string;
  endTime?: string;
  timeSpentSeconds: number;
  status: 'in_progress' | 'submitted';
  answers: Record<string, CandidateAnswer>;
  results?: {
    autoGradedScore: number;
    autoGradedMax: number;
    selfReviewScore: number;
    selfReviewMax: number;
    totalPossibleScore: number;
    verifiedPercentage: number;
    questionEvaluations: Record<string, QuestionEvaluationResult>;
    skillsSummary: {
      skill: string;
      correct: number;
      total: number;
      percentage: number;
    }[];
  };
}

export interface PlanTask {
  id: string;
  title: string;
  type: 'assessment' | 'drill' | 'interview_prep' | 'employer_research' | 'custom';
  targetId?: string;
  estimatedMinutes: number;
  rationale: string;
  isCompleted: boolean;
  isSkipped: boolean;
}

export interface WeeklyGoal {
  weekNumber: number;
  theme: string;
  tasks: PlanTask[];
}

export interface PreparationPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  targetRole: string;
  hiringTrack: HiringTrack;
  targetEmployerIds: string[];
  skillLevel: QuestionDifficulty;
  focusSkills: string[];
  targetDate?: string;
  weeklyHours: number;
  weeklyGoals: WeeklyGoal[];
}

export interface InterviewPrompt {
  id: string;
  title: string;
  scenario: string;
  challenge: string;
  rubric: { criterion: string; weight: string; description: string }[];
  sampleSolutionOutline: string;
}

export interface InterviewModule {
  key: string;
  title: string;
  category: string;
  learningObjective: string;
  estimatedMinutes: number;
  recommendedSkills: string[];
  prompts: InterviewPrompt[];
  recommendedFollowUpDrillSkill: string;
}

export interface InterviewModuleProgress {
  moduleKey: string;
  promptNotes: Record<string, string>;
  completedPromptIds: string[];
  status: 'not_started' | 'in_progress' | 'completed';
  lastUpdated: string;
}

export interface UserPreferences {
  theme: 'system' | 'light' | 'dark';
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'standard' | 'large';
  remoteEvaluatorUrl?: string;
  remoteSyncUrl?: string;
}

export interface UserDataBackup {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  preferences: UserPreferences;
  bookmarkedEmployerIds: string[];
  comparedEmployerIds: string[];
  preparationPlan: PreparationPlan | null;
  assessmentAttempts: AssessmentAttempt[];
  interviewProgress: Record<string, InterviewModuleProgress>;
  drillStats: Record<string, { attempts: number; correct: number }>;
}
