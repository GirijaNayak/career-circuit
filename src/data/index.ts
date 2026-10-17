import { SEED_EMPLOYERS } from './seedEmployers';
import { SEED_QUESTIONS } from './seedQuestions';
import { SEED_ASSESSMENTS } from './seedAssessments';
import { SEED_INTERVIEW_MODULES } from './seedInterviewModules';
import { Employer, Question, Assessment, InterviewModule } from '../types';

export { SEED_EMPLOYERS, SEED_QUESTIONS, SEED_ASSESSMENTS, SEED_INTERVIEW_MODULES };

// Employer queries
export function getAllEmployers(): Employer[] {
  return SEED_EMPLOYERS;
}

export function getEmployerById(id: string): Employer | undefined {
  return SEED_EMPLOYERS.find((e) => e.id === id || e.slug === id);
}

export function searchEmployers(
  query: string,
  filters: {
    category?: string;
    roleLevel?: string;
    location?: string;
    evidenceCategory?: string;
  }
): Employer[] {
  let list = [...SEED_EMPLOYERS];

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    list = list.filter((emp) => {
      const matchName = emp.name.toLowerCase().includes(q);
      const matchAlias = emp.aliases.some((a) => a.toLowerCase().includes(q));
      const matchOverview = emp.overview.toLowerCase().includes(q);
      const matchHubs = emp.engineeringHubs.some((h) => h.toLowerCase().includes(q));
      const matchTech = emp.roleTracks.some((t) =>
        t.typicalTechStack.some((tech) => tech.toLowerCase().includes(q))
      );
      return matchName || matchAlias || matchOverview || matchHubs || matchTech;
    });
  }

  if (filters.category && filters.category !== 'all') {
    list = list.filter((emp) => emp.category === filters.category);
  }

  if (filters.roleLevel && filters.roleLevel !== 'all') {
    list = list.filter((emp) =>
      emp.roleTracks.some((t) => t.level === filters.roleLevel)
    );
  }

  if (filters.location && filters.location !== 'all') {
    list = list.filter((emp) =>
      emp.locations.some((loc) => loc.toLowerCase().includes(filters.location!.toLowerCase()))
    );
  }

  if (filters.evidenceCategory && filters.evidenceCategory !== 'all') {
    list = list.filter((emp) =>
      emp.hiringStages.some((stage) => stage.evidenceCategory === filters.evidenceCategory)
    );
  }

  return list;
}

// Question queries
export function getAllQuestions(): Question[] {
  return SEED_QUESTIONS;
}

export function getQuestionById(id: string): Question | undefined {
  return SEED_QUESTIONS.find((q) => q.id === id);
}

export function getQuestionsForAssessment(assessmentId: string): Question[] {
  const assessment = getAssessmentById(assessmentId);
  if (!assessment) return [];
  return assessment.questionIds
    .map((qid) => getQuestionById(qid))
    .filter((q): q is Question => Boolean(q));
}

// Assessment queries
export function getAllAssessments(): Assessment[] {
  return SEED_ASSESSMENTS;
}

export function getAssessmentById(id: string): Assessment | undefined {
  return SEED_ASSESSMENTS.find((a) => a.id === id || a.slug === id);
}

// Interview Modules queries
export function getAllInterviewModules(): InterviewModule[] {
  return SEED_INTERVIEW_MODULES;
}

export function getInterviewModuleByKey(key: string): InterviewModule | undefined {
  return SEED_INTERVIEW_MODULES.find((m) => m.key === key);
}
