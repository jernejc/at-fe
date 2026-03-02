import { describe, it, expect } from 'vitest';
import {
  deriveCompanyStatus,
  isNewOpportunity,
  formatRelativeDate,
  formatCurrency,
  formatCompactNumber,
  normalizeScore,
  normalizeScoreNullable,
} from './utils';

describe('deriveCompanyStatus', () => {
  it('returns closed_won when status is closed_won', () => {
    expect(deriveCompanyStatus({ status: 'closed_won' })).toBe('closed_won');
  });

  it('returns closed_lost when status is closed_lost', () => {
    expect(deriveCompanyStatus({ status: 'closed_lost' })).toBe('closed_lost');
  });

  it('returns in_progress when progress is greater than 0', () => {
    expect(deriveCompanyStatus({ progress: 50 })).toBe('in_progress');
  });

  it('returns in_progress when status is in_progress regardless of progress', () => {
    expect(deriveCompanyStatus({ status: 'in_progress', progress: 0 })).toBe('in_progress');
  });

  it('returns new when assignedAt is within the last 7 days', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(deriveCompanyStatus({ assignedAt: twoDaysAgo })).toBe('new');
  });

  it('returns default when assignedAt is older than 7 days', () => {
    expect(deriveCompanyStatus({ assignedAt: '2020-01-01T00:00:00Z' })).toBe('default');
  });

  it('returns default when no options provided', () => {
    expect(deriveCompanyStatus({})).toBe('default');
  });

  it('returns default when assignedAt is null', () => {
    expect(deriveCompanyStatus({ assignedAt: null })).toBe('default');
  });

  it('prioritises closed status over progress', () => {
    expect(deriveCompanyStatus({ status: 'closed_won', progress: 50 })).toBe('closed_won');
  });

  it('prioritises in_progress over new assignment', () => {
    const recent = new Date(Date.now() - 1000).toISOString();
    expect(deriveCompanyStatus({ progress: 10, assignedAt: recent })).toBe('in_progress');
  });
});

describe('isNewOpportunity', () => {
  it('returns true for a date within the last 7 days', () => {
    const recent = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(isNewOpportunity({ assigned_at: recent })).toBe(true);
  });

  it('returns false for a date older than 7 days', () => {
    expect(isNewOpportunity({ assigned_at: '2020-01-01T00:00:00Z' })).toBe(false);
  });

  it('returns true for a date exactly now', () => {
    expect(isNewOpportunity({ assigned_at: new Date().toISOString() })).toBe(true);
  });
});

describe('formatRelativeDate', () => {
  it('returns "Today" for current date', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Today');
  });

  it('returns "Yesterday" for 1 day ago', () => {
    const yesterday = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(yesterday.toISOString())).toBe('Yesterday');
  });

  it('returns "Xd ago" for 2-6 days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(threeDaysAgo.toISOString())).toBe('3d ago');
  });

  it('returns "Xw ago" for 7-29 days ago', () => {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(fourteenDaysAgo.toISOString())).toBe('2w ago');
  });

  it('returns "Mon DD" for 30-364 days ago', () => {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(sixtyDaysAgo.toISOString());
    // Should be like "Jan 2" — month abbreviation + day
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  it('returns "Mon YYYY" for dates over a year ago', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    const result = formatRelativeDate(twoYearsAgo.toISOString());
    // Should be like "Jan 2024"
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
  });
});

describe('formatCurrency', () => {
  it('formats millions', () => {
    expect(formatCurrency(5_200_000)).toBe('$5.2M');
  });

  it('formats thousands', () => {
    expect(formatCurrency(15_000)).toBe('$15.0K');
  });

  it('formats small values', () => {
    expect(formatCurrency(500)).toBe('$500');
  });
});

describe('formatCompactNumber', () => {
  it('formats millions', () => {
    expect(formatCompactNumber(2_500_000)).toBe('2.5M');
  });

  it('formats thousands', () => {
    expect(formatCompactNumber(8_000)).toBe('8.0K');
  });

  it('formats small numbers as-is', () => {
    expect(formatCompactNumber(42)).toBe('42');
  });
});

describe('normalizeScore', () => {
  it('multiplies by 100 when value is between 0 and 1', () => {
    expect(normalizeScore(0.85)).toBe(85);
  });

  it('returns as-is when value is greater than 1', () => {
    expect(normalizeScore(75)).toBe(75);
  });

  it('treats exactly 1 as a 0-1 score', () => {
    expect(normalizeScore(1)).toBe(100);
  });

  it('handles 0', () => {
    expect(normalizeScore(0)).toBe(0);
  });
});

describe('normalizeScoreNullable', () => {
  it('returns 0 for null', () => {
    expect(normalizeScoreNullable(null)).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(normalizeScoreNullable(undefined)).toBe(0);
  });

  it('normalises valid scores', () => {
    expect(normalizeScoreNullable(0.5)).toBe(50);
  });

  it('passes through scores above 1', () => {
    expect(normalizeScoreNullable(90)).toBe(90);
  });
});
