import {
  UserPreferences,
  PreparationPlan,
  AssessmentAttempt,
  InterviewModuleProgress,
  UserDataBackup,
} from '../types';
import { CURRENT_SCHEMA_VERSION, UserDataBackupValidated } from './backupSchema';

const STORAGE_KEYS = {
  PREFERENCES: 'careercircuit_prefs',
  BOOKMARKS: 'careercircuit_bookmarks',
  COMPARE: 'careercircuit_compare',
  PLAN: 'careercircuit_plan',
  ACTIVE_ATTEMPT: 'careercircuit_active_attempt',
  ATTEMPTS: 'careercircuit_attempts',
  INTERVIEW_PROGRESS: 'careercircuit_interview_progress',
  DRILL_STATS: 'careercircuit_drill_stats',
  SCHEMA_VERSION: 'careercircuit_schema_version',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  highContrast: false,
  reducedMotion: false,
  fontSize: 'standard',
};

// Simple event dispatcher for cross-component reactive updates
const listeners = new Set<() => void>();

export function subscribeToStorage(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifySubscribers() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Storage subscriber error:', e);
    }
  });
}

// Resilient helper to read from localStorage with fallback
function safeGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Failed to parse storage item '${key}', returning fallback:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifySubscribers();
    return true;
  } catch (err) {
    console.error(`Failed to write to storage item '${key}':`, err);
    return false;
  }
}

// User Preferences
export function getPreferences(): UserPreferences {
  return safeGet<UserPreferences>(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  safeSet(STORAGE_KEYS.PREFERENCES, updated);
  applyPreferencesToDOM(updated);
  return updated;
}

export function applyPreferencesToDOM(prefs: UserPreferences) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (!html) return;

  // Apply theme
  if (prefs.theme === 'system') {
    const prefersDark =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    html.setAttribute('data-theme', prefs.theme);
  }

  // Accessibility flags
  html.setAttribute('data-high-contrast', prefs.highContrast ? 'true' : 'false');
  html.setAttribute('data-reduced-motion', prefs.reducedMotion ? 'true' : 'false');
  html.setAttribute('data-font-size', prefs.fontSize);
}

// Bookmarked Employers
export function getBookmarkedEmployerIds(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.BOOKMARKS, []);
}

export function toggleEmployerBookmark(employerId: string): boolean {
  const current = getBookmarkedEmployerIds();
  const exists = current.includes(employerId);
  const updated = exists ? current.filter((id) => id !== employerId) : [...current, employerId];
  safeSet(STORAGE_KEYS.BOOKMARKS, updated);
  return !exists;
}

// Compared Employers (limit to 4)
export function getComparedEmployerIds(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.COMPARE, []);
}

export function toggleEmployerComparison(employerId: string): { added: boolean; list: string[] } {
  const current = getComparedEmployerIds();
  if (current.includes(employerId)) {
    const updated = current.filter((id) => id !== employerId);
    safeSet(STORAGE_KEYS.COMPARE, updated);
    return { added: false, list: updated };
  } else {
    if (current.length >= 4) {
      return { added: false, list: current }; // Max 4
    }
    const updated = [...current, employerId];
    safeSet(STORAGE_KEYS.COMPARE, updated);
    return { added: true, list: updated };
  }
}

export function clearComparison(): void {
  safeSet(STORAGE_KEYS.COMPARE, []);
}

// Preparation Plan
export function getPreparationPlan(): PreparationPlan | null {
  return safeGet<PreparationPlan | null>(STORAGE_KEYS.PLAN, null);
}

export function savePreparationPlan(plan: PreparationPlan | null): void {
  safeSet(STORAGE_KEYS.PLAN, plan);
}

export function updatePlanTaskStatus(taskId: string, isCompleted: boolean): boolean {
  const plan = getPreparationPlan();
  if (!plan) return false;

  let found = false;
  const updatedGoals = plan.weeklyGoals.map((week) => ({
    ...week,
    tasks: week.tasks.map((task) => {
      if (task.id === taskId) {
        found = true;
        return { ...task, isCompleted };
      }
      return task;
    }),
  }));

  if (found) {
    savePreparationPlan({
      ...plan,
      updatedAt: new Date().toISOString(),
      weeklyGoals: updatedGoals,
    });
  }
  return found;
}

// Active Assessment Session (for recovery on reload)
export function getActiveAssessmentAttempt(): AssessmentAttempt | null {
  return safeGet<AssessmentAttempt | null>(STORAGE_KEYS.ACTIVE_ATTEMPT, null);
}

export function saveActiveAssessmentAttempt(attempt: AssessmentAttempt | null): void {
  safeSet(STORAGE_KEYS.ACTIVE_ATTEMPT, attempt);
}

// Completed Assessment Attempts
export function getAssessmentAttempts(): AssessmentAttempt[] {
  return safeGet<AssessmentAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
}

export function recordAssessmentAttempt(attempt: AssessmentAttempt): void {
  const current = getAssessmentAttempts();
  // Filter out any existing copy of this attempt ID and prepend new attempt
  const updated = [attempt, ...current.filter((a) => a.id !== attempt.id)];
  safeSet(STORAGE_KEYS.ATTEMPTS, updated);
  // Clear active attempt if it matches
  const active = getActiveAssessmentAttempt();
  if (active && active.id === attempt.id) {
    saveActiveAssessmentAttempt(null);
  }
}

// Interview Module Progress
export function getInterviewProgress(): Record<string, InterviewModuleProgress> {
  return safeGet<Record<string, InterviewModuleProgress>>(STORAGE_KEYS.INTERVIEW_PROGRESS, {});
}

export function saveInterviewModuleProgress(progress: InterviewModuleProgress): void {
  const current = getInterviewProgress();
  safeSet(STORAGE_KEYS.INTERVIEW_PROGRESS, {
    ...current,
    [progress.moduleKey]: progress,
  });
}

// Drill Statistics
export function getDrillStats(): Record<string, { attempts: number; correct: number }> {
  return safeGet<Record<string, { attempts: number; correct: number }>>(STORAGE_KEYS.DRILL_STATS, {});
}

export function recordDrillAttempt(skill: string, isCorrect: boolean): void {
  const current = getDrillStats();
  const stat = current[skill] || { attempts: 0, correct: 0 };
  safeSet(STORAGE_KEYS.DRILL_STATS, {
    ...current,
    [skill]: {
      attempts: stat.attempts + 1,
      correct: stat.correct + (isCorrect ? 1 : 0),
    },
  });
}

// Export Backup
export function exportUserData(): UserDataBackup {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    preferences: getPreferences(),
    bookmarkedEmployerIds: getBookmarkedEmployerIds(),
    comparedEmployerIds: getComparedEmployerIds(),
    preparationPlan: getPreparationPlan(),
    assessmentAttempts: getAssessmentAttempts(),
    interviewProgress: getInterviewProgress(),
    drillStats: getDrillStats(),
  };
}

// Import Backup with Atomic Operation
export function importUserData(
  backup: UserDataBackupValidated,
  mode: 'replace' | 'merge'
): boolean {
  try {
    if (mode === 'replace') {
      safeSet(STORAGE_KEYS.PREFERENCES, backup.preferences);
      safeSet(STORAGE_KEYS.BOOKMARKS, backup.bookmarkedEmployerIds);
      safeSet(STORAGE_KEYS.COMPARE, backup.comparedEmployerIds);
      safeSet(STORAGE_KEYS.PLAN, backup.preparationPlan);
      safeSet(STORAGE_KEYS.ATTEMPTS, backup.assessmentAttempts);
      safeSet(STORAGE_KEYS.INTERVIEW_PROGRESS, backup.interviewProgress);
      safeSet(STORAGE_KEYS.DRILL_STATS, backup.drillStats);
      applyPreferencesToDOM(backup.preferences);
    } else {
      // Merge mode
      // Bookmarks: union
      const existingBookmarks = new Set(getBookmarkedEmployerIds());
      backup.bookmarkedEmployerIds.forEach((id) => existingBookmarks.add(id));
      safeSet(STORAGE_KEYS.BOOKMARKS, Array.from(existingBookmarks));

      // Attempts: combine by ID (incoming overrides or appends)
      const existingAttempts = getAssessmentAttempts();
      const attemptsMap = new Map<string, AssessmentAttempt>();
      existingAttempts.forEach((a) => attemptsMap.set(a.id, a));
      backup.assessmentAttempts.forEach((a) => attemptsMap.set(a.id, a));
      safeSet(STORAGE_KEYS.ATTEMPTS, Array.from(attemptsMap.values()));

      // Plan: use backup plan if present and newer or existing is null
      if (backup.preparationPlan) {
        safeSet(STORAGE_KEYS.PLAN, backup.preparationPlan);
      }

      // Interview Progress: merge keys
      const existingInterview = getInterviewProgress();
      safeSet(STORAGE_KEYS.INTERVIEW_PROGRESS, {
        ...existingInterview,
        ...backup.interviewProgress,
      });

      // Drill stats: sum counts
      const existingDrills = getDrillStats();
      const mergedDrills = { ...existingDrills };
      for (const [skill, val] of Object.entries(backup.drillStats)) {
        if (!mergedDrills[skill]) {
          mergedDrills[skill] = { ...val };
        } else {
          mergedDrills[skill] = {
            attempts: mergedDrills[skill].attempts + val.attempts,
            correct: mergedDrills[skill].correct + val.correct,
          };
        }
      }
      safeSet(STORAGE_KEYS.DRILL_STATS, mergedDrills);
    }

    notifySubscribers();
    return true;
  } catch (err) {
    console.error('Failed to import user data:', err);
    return false;
  }
}

// Reset Local Data
export function resetLocalData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Restore default preferences
    safeSet(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
    applyPreferencesToDOM(DEFAULT_PREFERENCES);
    notifySubscribers();
  } catch (err) {
    console.error('Error resetting local data:', err);
  }
}
