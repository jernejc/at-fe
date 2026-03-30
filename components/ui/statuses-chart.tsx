import { cn } from '@/lib/utils';

interface StatusesChartProps {
  /** Number of companies with 'new' status. */
  newCount: number;
  /** Number of companies with 'default'/unworked status. */
  unworkedCount: number;
  /** Number of companies with 'in_progress' status. */
  inProgressCount: number;
  /** Number of companies with 'closed_won' status. */
  wonCount: number;
  /** Number of companies with 'closed_lost' status. */
  lostCount: number;
  /** 0-100 task completion percentage for in-progress bar striped overlay. @default 0 */
  inProgressCompletion?: number;
  className?: string;
}

const MAX_BAR_HEIGHT = 80;
const MIN_BAR_HEIGHT = 4;

/** @internal Pure height calculation extracted for testability. */
export function calcBarHeight(count: number, maxCount: number): number {
  if (maxCount <= 0 || count <= 0) return 0;
  return Math.max(Math.round((count / maxCount) * MAX_BAR_HEIGHT), MIN_BAR_HEIGHT);
}

const STATUS_CONFIG = [
  { key: 'new', label: 'new', color: '--accent-yellow' },
  { key: 'backlog', label: 'unworked', color: '--gray-300' },
  { key: 'inProgress', label: 'engaged', color: '--accent-green' },
  { key: 'won', label: 'won', color: '--accent-green-dark' },
  { key: 'lost', label: 'lost', color: '--accent-dark-red' },
] as const;

/** Single bar column: count label, colored bar, status label. */
function StatusBar({
  count,
  height,
  color,
  label,
  overlay,
}: {
  count: number;
  height: number;
  color: string;
  label: string;
  overlay?: { completion: number };
}) {
  return (
    <div className="flex w-0 flex-1 flex-col items-center gap-1">
      <span className="text-xs font-semibold font-display tabular-nums text-foreground">
        {count}
      </span>
      <div className="relative w-full min-w-4 overflow-hidden rounded-t-sm rounded-b-xs" style={{ height }}>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `var(${color})` }}
        />
        {overlay && overlay.completion > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${Math.min(Math.max(overlay.completion, 0), 100)}%`,
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
      </div>
      <span className="w-full text-center text-[10px] text-muted-foreground truncate">{label}</span>
    </div>
  );
}

/** Compact vertical bar chart showing company status distribution within a campaign. */
export function StatusesChart({
  newCount,
  unworkedCount,
  inProgressCount,
  wonCount,
  lostCount,
  inProgressCompletion = 0,
  className,
}: StatusesChartProps) {
  const counts = [newCount, unworkedCount, inProgressCount, wonCount, lostCount];
  const maxCount = Math.max(...counts);
  const heights = counts.map((c) => calcBarHeight(c, maxCount));

  return (
    <div className={cn('flex w-full items-end gap-2', className)}>
      {/* Left pair: new + unworked */}
      <div className="flex w-0 flex-2 items-end gap-0.5">
        <StatusBar count={newCount} height={heights[0]} color={STATUS_CONFIG[0].color} label={STATUS_CONFIG[0].label} />
        <StatusBar count={unworkedCount} height={heights[1]} color={STATUS_CONFIG[1].color} label={STATUS_CONFIG[1].label} />
      </div>
      {/* Center: engaged */}
      <div className="flex w-0 flex-1 items-end">
        <StatusBar
          count={inProgressCount}
          height={heights[2]}
          color={STATUS_CONFIG[2].color}
          label={STATUS_CONFIG[2].label}
          overlay={{ completion: inProgressCompletion }}
        />
      </div>
      {/* Right pair: won + lost */}
      <div className="flex w-0 flex-2 items-end gap-0.5">
        <StatusBar count={wonCount} height={heights[3]} color={STATUS_CONFIG[3].color} label={STATUS_CONFIG[3].label} />
        <StatusBar count={lostCount} height={heights[4]} color={STATUS_CONFIG[4].color} label={STATUS_CONFIG[4].label} />
      </div>
    </div>
  );
}
