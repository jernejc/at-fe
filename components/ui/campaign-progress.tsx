import { cn, formatCompactNumber } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
  /** Show a tooltip with segment breakdown on hover. @default false */
  showTooltip?: boolean;
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
  showTooltip = false,
  className,
}: CampaignProgressProps) {
  const { greenPct, stripedPct, blackPct } = calcWidths(
    total,
    inProgress,
    completed,
    taskCompletion,
  );

  const bar = (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completed}
      className={cn('w-full rounded-full', className)}
      style={{ height, backgroundColor: 'var(--border)', padding: 1 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full">
        {greenPct > 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-accent-green transition-all duration-300"
            style={{ width: `${greenPct}%` }}
          />
        )}
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
        {blackPct > 0 && (
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-foreground transition-all duration-300"
            style={{ width: `${blackPct}%` }}
          />
        )}
      </div>
    </div>
  );

  if (!showTooltip) return bar;

  const remaining = Math.max(total - completed - inProgress, 0);
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <Tooltip>
      <TooltipTrigger className="w-full">{bar}</TooltipTrigger>
      <TooltipContent side="top" className="px-3 py-2.5">
        <div className="flex flex-col gap-1.5 text-xs tabular-nums">
          {/* Total */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium">Companies</span>
            <span className="font-medium">{formatCompactNumber(total)}</span>
          </div>

          <div className="h-px bg-current opacity-20" />

          {/* Completed */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-foreground dark:bg-foreground" />
              Completed
            </span>
            <span>{formatCompactNumber(completed)} ({pct(completed)}%)</span>
          </div>

          {/* In progress */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-green" />
              In progress
            </span>
            <span>{formatCompactNumber(inProgress)} ({pct(inProgress)}%)</span>
          </div>

          {/* Task completion (sub-row with striped dot) */}
          <div className="flex items-center justify-between gap-4 pl-3.5 opacity-70">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    -45deg,
                    var(--gray-400),
                    var(--gray-400) 1px,
                    transparent 1px,
                    transparent 3px
                  )`,
                }}
              />
              Tasks done
            </span>
            <span>{Math.round(taskCompletion)}%</span>
          </div>

          {/* Remaining */}
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full border border-current opacity-40" />
              Remaining
            </span>
            <span>{formatCompactNumber(remaining)} ({pct(remaining)}%)</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
