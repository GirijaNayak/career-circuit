import { describe, it, expect } from 'vitest';
import { searchEmployers, getAllEmployers, getEmployerById } from '../data';

describe('Employer Search & Multi-Filter Query Engine', () => {
  it('returns all employers when query and filters are empty', () => {
    const all = getAllEmployers();
    const result = searchEmployers('', {});
    expect(result.length).toBe(all.length);
  });

  it('matches employers by primary name', () => {
    const result = searchEmployers('Stripe', {});
    expect(result.some((e) => e.name === 'Stripe')).toBe(true);
  });

  it('matches employers by known alias', () => {
    const result = searchEmployers('DatadogHQ', {});
    expect(result.some((e) => e.name === 'Datadog')).toBe(true);
  });

  it('matches employers by tech stack keywords', () => {
    const result = searchEmployers('OCaml', {});
    expect(result.some((e) => e.name === 'Jane Street')).toBe(true);
  });

  it('matches employers by engineering hub location', () => {
    const result = searchEmployers('Lisbon', {});
    expect(result.some((e) => e.name === 'Cloudflare')).toBe(true);
  });

  it('combines industry category and role level filters', () => {
    const result = searchEmployers('', {
      category: 'FinTech',
      roleLevel: 'intern',
    });

    expect(result.length).toBeGreaterThan(0);
    result.forEach((emp) => {
      expect(emp.category).toBe('FinTech');
      expect(emp.roleTracks.some((t) => t.level === 'intern')).toBe(true);
    });
  });

  it('retrieves employers by slug or id', () => {
    const byId = getEmployerById('emp-bloomberg');
    const bySlug = getEmployerById('bloomberg');
    expect(byId).toBeDefined();
    expect(bySlug).toBeDefined();
    expect(byId?.id).toBe(bySlug?.id);
  });
});
