import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CompanyStatusValue } from '@/components/ui/company-status';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a dollar amount in compact notation (e.g., $1.2K, $4.2M)
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
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
 * Format a min–max range using compact notation (e.g. "100-35.3K").
 * Returns a single value if min === max, or null if both are null.
 */
export function formatCompactRange(
  min: number | null | undefined,
  max: number | null | undefined,
): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) {
    if (min === max) return formatCompactNumber(min);
    return `${formatCompactNumber(min)}-${formatCompactNumber(max)}`;
  }
  return formatCompactNumber((min ?? max)!);
}

const NEW_THRESHOLD_DAYS = 7;

/**
 * Check if a date is within the last 7 days (used for "new" opportunity badges in partner portal).
 */
export function isNewOpportunity(company: { assigned_at: string }): boolean {
  const cutoff = Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  return new Date(company.assigned_at).getTime() > cutoff;
}

/**
 * Derive the UI status for a company in a campaign.
 * - `closed_won` / `closed_lost` when explicitly set
 * - `in_progress` when there is progress or the status is already in_progress
 * - `new` when assigned within the last 7 days with no progress
 * - `default` otherwise
 */
export function deriveCompanyStatus(opts: {
  status?: string | null;
  progress?: number;
  assignedAt?: string | null;
}): CompanyStatusValue {
  const { status, progress, assignedAt } = opts;

  if (status === 'closed_won' || status === 'closed_lost') return status;
  if ((progress != null && progress > 0) || status === 'in_progress') return 'in_progress';

  if (assignedAt) {
    const cutoff = Date.now() - NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
    if (new Date(assignedAt).getTime() > cutoff) return 'new';
  }

  return 'default';
}

const STATUS_LABELS: Record<CompanyStatusValue, string> = {
  default: 'Unworked',
  new: 'Unworked',
  in_progress: 'In Progress',
  closed_won: 'Closed Won',
  closed_lost: 'Closed Lost',
};

/** Return a human-readable label for a company lifecycle status. */
export function getCompanyStatusLabel(status: CompanyStatusValue): string {
  return STATUS_LABELS[status] ?? status;
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

export function getProductTextColor(productId: number | null | undefined): string {
  if (productId === null || productId === undefined) return 'text-slate-500';
  // Map gradients to simplified text colors for badges
  const colors = [
    'text-blue-600 dark:text-blue-400',
    'text-sky-600 dark:text-sky-400',
    'text-cyan-600 dark:text-cyan-400',
    'text-teal-600 dark:text-teal-400',
    'text-emerald-600 dark:text-emerald-400',
    'text-green-600 dark:text-green-400',
    'text-lime-600 dark:text-lime-400',
    'text-yellow-600 dark:text-yellow-400',
    'text-amber-600 dark:text-amber-400',
    'text-orange-600 dark:text-orange-400',
    'text-indigo-600 dark:text-indigo-400',
    'text-slate-600 dark:text-slate-400',
  ];
  return colors[(productId || 0) % colors.length];
}

export function getProductBadgeTheme(productId: number | null | undefined) {
  if (productId === null || productId === undefined) return {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700'
  };

  const themes = [
    { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    { bg: 'bg-sky-50 dark:bg-sky-900/20', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' },
    { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    { bg: 'bg-lime-50 dark:bg-lime-900/20', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-800' },
    { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
    { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
    { bg: 'bg-slate-50 dark:bg-slate-900/20', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-800' },
  ];
  return themes[(productId || 0) % themes.length];
}
