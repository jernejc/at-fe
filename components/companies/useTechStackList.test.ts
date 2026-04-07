import { describe, it, expect } from 'vitest';
import { getRecencyBucket, getWeightClass } from './useTechStackList';

const NOW = new Date('2026-04-07T00:00:00Z');

describe('getRecencyBucket', () => {
  it('returns 0 for dates within the last year', () => {
    expect(getRecencyBucket('2025-08-01', NOW)).toBe(0);
  });

  it('returns 1 for dates 1–2 years old', () => {
    expect(getRecencyBucket('2024-06-01', NOW)).toBe(1);
  });

  it('returns 2 for dates 2–3 years old', () => {
    expect(getRecencyBucket('2023-06-01', NOW)).toBe(2);
  });

  it('returns 3 for dates older than 3 years', () => {
    expect(getRecencyBucket('2020-01-01', NOW)).toBe(3);
  });

  it('returns 4 for null', () => {
    expect(getRecencyBucket(null, NOW)).toBe(4);
  });

  it('returns 4 for invalid date', () => {
    expect(getRecencyBucket('not-a-date', NOW)).toBe(4);
  });
});

describe('getWeightClass', () => {
  it('maps buckets to font weight classes', () => {
    expect(getWeightClass(0)).toBe('font-bold');
    expect(getWeightClass(1)).toBe('font-medium');
    expect(getWeightClass(2)).toBe('font-light');
    expect(getWeightClass(3)).toBe('font-thin');
    expect(getWeightClass(4)).toBe('font-thin');
  });
});
