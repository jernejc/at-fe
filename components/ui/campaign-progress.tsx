import { cn } from '@/lib/utils';

interface CampaignProgressProps {
  /** Total number of companies (100% width). */
  total: number;
  /** Companies currently in progress. */
  inProgress: number;
  /** Companies that have been fully completed. */
  completed: number;
  /** 0–100 percentage of task completion for in-progress companies. */
  taskCompletion: number;
  /** Height of the outer pill in pixels. @default 12 */
  height?: number;
  className?: string;
}

interface BarWidths {
  greenPct: number;
  stripedPct: number;
  blackPct: number;
}

/** @internal Pure width calculation extracted for testability. */
export function calcWidths(
  total: number,
  inProgress: number,
  completed: number,
  taskCompletion: number,
): BarWidths {
  if (total <= 0) return { greenPct: 0, stripedPct: 0, blackPct: 0 };

  const safeCompleted = Math.min(Math.max(completed, 0), total);
  const safeInProgress = Math.min(Math.max(inProgress, 0), total - safeCompleted);
  const safeTask = Math.min(Math.max(taskCompletion, 0), 100);

  const greenPct = Math.min(((safeInProgress + safeCompleted) / total) * 100, 100);
  const stripedPct = Math.min(
    ((safeCompleted + safeInProgress * (safeTask / 100)) / total) * 100,
    100,
  );
  const blackPct = Math.min((safeCompleted / total) * 100, 100);

  return { greenPct, stripedPct, blackPct };
}

/** Horizontal pill-shaped multi-layer progress bar for campaign company status. */
export function CampaignProgress({
  total,
  inProgress,
  completed,
  taskCompletion,
  height = 12,
  className,
}: CampaignProgressProps) {
  const { greenPct, stripedPct, blackPct } = calcWidths(
    total,
    inProgress,
    completed,
    taskCompletion,
  );

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      className={cn('w-full rounded-full', className)}
      style={{ height, backgroundColor: 'var(--border)', padding: 1 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full">
        {/* Green bar: in-progress + completed */}
        {greenPct > 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-accent-green transition-all duration-300"
            style={{ width: `${greenPct}%` }}
          />
        )}

        {/* Striped bar: task completion of in-progress + completed */}
        {stripedPct > 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
            style={{
              width: `${stripedPct}%`,
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                var(--accent-green-dark),
                var(--accent-green-dark) 1px,
                var(--accent-green) 1px,
                var(--accent-green) 4px
              )`,
            }}
          />
        )}

        {/* Black bar: completed */}
        {blackPct > 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${blackPct}%` }}
          />
        )}
      </div>
    </div>
  );
}
