import { cn } from '@/lib/utils';

interface EngagementIndicatorProps {
  /** Number of engaged accounts */
  engaged: number;
  /** Total number of accounts */
  total: number;
  /** Diameter of the semicircle in pixels (default: 32) */
  size?: number;
  /** Hide the numeric counts (default: false) */
  hideCount?: boolean;
  className?: string;
}

/** Half-circle progress arc showing engaged / total counts. */
export function EngagementIndicator({
  engaged,
  total,
  size = 24,
  hideCount = false,
  className,
}: EngagementIndicatorProps) {
  const strokeWidth = size / 6;
  const radius = (size - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const percentage = total > 0 ? Math.min(engaged / total, 1) : 0;
  const dashOffset = arcLength * (1 - percentage);

  // Semicircle arc from left to right (open at bottom)
  const cy = size / 2;
  const d = `M ${strokeWidth / 2} ${cy} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${cy}`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size / 2 + strokeWidth / 2}
        viewBox={`0 0 ${size} ${size / 2 + strokeWidth / 2}`}
        fill="none"
        className="shrink-0"
      >
        {/* Background arc */}
        <path
          d={d}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* Foreground arc */}
        {percentage > 0 && (
          <path
            d={d}
            stroke="var(--foreground)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
          />
        )}
      </svg>

      {!hideCount && (
        <span className="text-sm leading-none font-medium text-foreground">
          {engaged} / {total}
        </span>
      )}
    </div>
  );
}
