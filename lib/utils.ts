import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format large numbers in compact notation (e.g., 1.2K, 3.5M)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Format a date string as a relative time (e.g., "2d ago", "3w ago")
 */
export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * Normalize a score to 0-100 range (handles both 0-1 and 0-100 inputs)
 */
export function normalizeScore(score: number): number {
  return score <= 1 ? score * 100 : score;
}

export function normalizeScoreNullable(score: number | null | undefined): number {
  if (score == null) return 0;
  return score <= 1 ? score * 100 : score;
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text);
}

/**
 * Generate a random campaign name
 */
export function generateRandomCampaignName(): string {
  const adjectives = ['Strategic', 'Dynamic', 'Growth', 'Targeted', 'Premium', 'Elite', 'Core', 'Prime'];
  const nouns = ['Outreach', 'Initiative', 'Campaign', 'Push', 'Drive', 'Expansion', 'Sprint'];
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun} ${suffix}`;
}
