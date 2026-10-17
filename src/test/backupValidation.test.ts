import { describe, it, expect, beforeEach } from 'vitest';
import { validateBackupFile, CURRENT_SCHEMA_VERSION } from '../storage/backupSchema';
import {
  exportUserData,
  importUserData,
  getBookmarkedEmployerIds,
  resetLocalData,
  toggleEmployerBookmark,
} from '../storage/localStorageService';

describe('Backup Validation & Import Atomicity', () => {
  beforeEach(() => {
    resetLocalData();
  });

  it('validates a fresh export from exportUserData successfully', () => {
    toggleEmployerBookmark('emp-stripe');
    const exported = exportUserData();
    const jsonStr = JSON.stringify(exported);

    const validation = validateBackupFile(jsonStr);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(validation.data.bookmarkedEmployerIds).toContain('emp-stripe');
    }
  });

  it('rejects corrupt or malformed JSON strings without throwing', () => {
    const corruptStr = '{ "schemaVersion": 1, "preferences": ';
    const validation = validateBackupFile(corruptStr);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error).toContain('JSON parsing error');
    }
  });

  it('rejects backups with missing schemaVersion', () => {
    const missingVersion = JSON.stringify({
      appVersion: '1.0.0',
      preferences: { theme: 'system', highContrast: false, reducedMotion: false, fontSize: 'standard' },
    });

    const validation = validateBackupFile(missingVersion);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error).toContain('schemaVersion');
    }
  });

  it('safely rejects future unknown schema versions', () => {
    const futureVersion = JSON.stringify({
      schemaVersion: 9999,
      appVersion: '99.0.0',
      exportedAt: new Date().toISOString(),
      preferences: { theme: 'system', highContrast: false, reducedMotion: false, fontSize: 'standard' },
    });

    const validation = validateBackupFile(futureVersion);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error).toContain('Incompatible backup format');
    }
  });

  it('rejects backups with invalid field types and pinpoints error path', () => {
    const invalidData = JSON.stringify({
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      preferences: {
        theme: 'invalid-theme-value', // Invalid enum
        highContrast: false,
        reducedMotion: false,
        fontSize: 'standard',
      },
    });

    const validation = validateBackupFile(invalidData);
    expect(validation.success).toBe(false);
    if (!validation.success) {
      expect(validation.error).toContain('preferences.theme');
    }
  });

  it('merges data without overwriting existing bookmarks in merge mode', () => {
    toggleEmployerBookmark('emp-stripe');
    expect(getBookmarkedEmployerIds()).toEqual(['emp-stripe']);

    const backupPayload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      preferences: {
        theme: 'system' as const,
        highContrast: false,
        reducedMotion: false,
        fontSize: 'standard' as const,
      },
      bookmarkedEmployerIds: ['emp-datadog'],
      comparedEmployerIds: [],
      preparationPlan: null,
      assessmentAttempts: [],
      interviewProgress: {},
      drillStats: {},
    };

    const imported = importUserData(backupPayload, 'merge');
    expect(imported).toBe(true);

    const mergedBookmarks = getBookmarkedEmployerIds();
    expect(mergedBookmarks).toContain('emp-stripe');
    expect(mergedBookmarks).toContain('emp-datadog');
  });

  it('replaces all local data in replace mode', () => {
    toggleEmployerBookmark('emp-stripe');
    expect(getBookmarkedEmployerIds()).toEqual(['emp-stripe']);

    const backupPayload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appVersion: '1.0.0',
      preferences: {
        theme: 'dark' as const,
        highContrast: true,
        reducedMotion: true,
        fontSize: 'large' as const,
      },
      bookmarkedEmployerIds: ['emp-cloudflare'],
      comparedEmployerIds: [],
      preparationPlan: null,
      assessmentAttempts: [],
      interviewProgress: {},
      drillStats: {},
    };

    const imported = importUserData(backupPayload, 'replace');
    expect(imported).toBe(true);

    const finalBookmarks = getBookmarkedEmployerIds();
    expect(finalBookmarks).toEqual(['emp-cloudflare']);
  });
});
