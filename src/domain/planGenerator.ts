import { PreparationPlan, WeeklyGoal, PlanTask, QuestionDifficulty, HiringTrack } from '../types';

export interface PlanGenerationInput {
  targetRole: string;
  hiringTrack: HiringTrack;
  targetEmployerIds: string[];
  skillLevel: QuestionDifficulty;
  focusSkills: string[];
  targetDate?: string;
  weeklyHours: number;
}

export function generatePreparationPlan(input: PlanGenerationInput): PreparationPlan {
  const planId = 'plan_' + Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  // Determine duration in weeks: if targetDate is provided, calculate difference, else default to 4 weeks
  let weeksCount = 4;
  if (input.targetDate) {
    const diffMs = new Date(input.targetDate).getTime() - new Date().getTime();
    const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7));
    if (diffWeeks > 0) {
      weeksCount = Math.min(Math.max(diffWeeks, 2), 12);
    }
  }

  const weeklyGoals: WeeklyGoal[] = [];

  for (let week = 1; week <= weeksCount; week++) {
    const tasks: PlanTask[] = [];

    if (week === 1) {
      tasks.push({
        id: `task-w1-diag`,
        title: 'Complete Core Diagnostic Assessment',
        type: 'assessment',
        targetId: 'assessment-fullstack-core',
        estimatedMinutes: 45,
        rationale: `Establish baseline accuracy across ${input.skillLevel} level algorithms, data structures, and debugging.`,
        isCompleted: false,
        isSkipped: false,
      });

      if (input.targetEmployerIds.length > 0) {
        tasks.push({
          id: `task-w1-research`,
          title: `Research Hiring Stages for Target Employers`,
          type: 'employer_research',
          targetId: input.targetEmployerIds[0],
          estimatedMinutes: 30,
          rationale: `Review verified hiring stages, question formats, and uncertainty notes for your target company.`,
          isCompleted: false,
          isSkipped: false,
        });
      }

      tasks.push({
        id: `task-w1-drill`,
        title: `Foundations Drill: ${input.focusSkills[0] || 'Algorithms'}`,
        type: 'drill',
        targetId: input.focusSkills[0] || 'Algorithms',
        estimatedMinutes: 40,
        rationale: `Selected as one of your priority focus areas for the ${input.hiringTrack} track.`,
        isCompleted: false,
        isSkipped: false,
      });

      weeklyGoals.push({
        weekNumber: 1,
        theme: 'Diagnostic Baseline & Target Employer Alignment',
        tasks,
      });
    } else if (week === 2) {
      tasks.push({
        id: `task-w2-drill`,
        title: `Targeted Drill: ${input.focusSkills[1] || 'Data Structures'}`,
        type: 'drill',
        targetId: input.focusSkills[1] || 'Data Structures',
        estimatedMinutes: 45,
        rationale: `Strengthen core complexity analysis and boundary conditions for technical screens.`,
        isCompleted: false,
        isSkipped: false,
      });

      tasks.push({
        id: `task-w2-prep`,
        title: 'Review System Design Fundamentals',
        type: 'interview_prep',
        targetId: 'system-design',
        estimatedMinutes: 60,
        rationale: 'High frequency in mid-round screens for architecture and tradeoff discussion.',
        isCompleted: false,
        isSkipped: false,
      });

      tasks.push({
        id: `task-w2-assessment`,
        title: 'Timed Simulation: Concurrency & Systems',
        type: 'assessment',
        targetId: 'assessment-systems-concurrency',
        estimatedMinutes: 60,
        rationale: 'Practice pacing under simulated time constraints without hints.',
        isCompleted: false,
        isSkipped: false,
      });

      weeklyGoals.push({
        weekNumber: 2,
        theme: 'Core Systems, Concurrency & Timed Execution',
        tasks,
      });
    } else if (week === 3) {
      tasks.push({
        id: `task-w3-interview`,
        title: 'Behavioral STAR Preparation',
        type: 'interview_prep',
        targetId: 'behavioral-star',
        estimatedMinutes: 45,
        rationale: 'Crucial for cultural alignment and hiring manager evaluation across all tech tracks.',
        isCompleted: false,
        isSkipped: false,
      });

      tasks.push({
        id: `task-w3-sql`,
        title: 'SQL & Data Modeling Challenge',
        type: 'assessment',
        targetId: 'assessment-backend-sql',
        estimatedMinutes: 50,
        rationale: 'Verify relational query construction, indexing trade-offs, and data integrity.',
        isCompleted: false,
        isSkipped: false,
      });

      weeklyGoals.push({
        weekNumber: 3,
        theme: 'Data Reliability & Behavioral Story Framing',
        tasks,
      });
    } else {
      tasks.push({
        id: `task-w${week}-final-sim`,
        title: 'Comprehensive Final Simulation Assessment',
        type: 'assessment',
        targetId: 'assessment-fullstack-core',
        estimatedMinutes: 60,
        rationale: 'Measure score improvement compared to week 1 diagnostic.',
        isCompleted: false,
        isSkipped: false,
      });

      tasks.push({
        id: `task-w${week}-review`,
        title: 'Review Missed Questions Drill',
        type: 'drill',
        targetId: 'all-missed',
        estimatedMinutes: 40,
        rationale: 'Consolidate weak points before your target interview window.',
        isCompleted: false,
        isSkipped: false,
      });

      weeklyGoals.push({
        weekNumber: week,
        theme: `Final Calibration & Weak-Point Remediation (Week ${week})`,
        tasks,
      });
    }
  }

  return {
    id: planId,
    createdAt: now,
    updatedAt: now,
    targetRole: input.targetRole,
    hiringTrack: input.hiringTrack,
    targetEmployerIds: input.targetEmployerIds,
    skillLevel: input.skillLevel,
    focusSkills: input.focusSkills,
    targetDate: input.targetDate,
    weeklyHours: input.weeklyHours,
    weeklyGoals,
  };
}
