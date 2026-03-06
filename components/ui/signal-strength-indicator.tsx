import { cn } from '@/lib/utils';

interface SignalStrengthIndicatorProps {
  /** Signal strength value from 0 to 10 */
  value: number;
  /** Triangle width in pixels (default: 16) */
  size?: number;
  /** Show "value / 10" text (default: true) */
  showValue?: boolean;
  className?: string;
}

/** Computes triangle opacity: 20% at score ≤50, linearly to 100% at score ≥90. */
function getTriangleOpacity(value: number): number {
  const score = value * 10;
  if (score <= 50) return 0.2;
  if (score >= 90) return 1;
  return 0.2 + ((score - 50) / 40) * 0.8;
}

/** Triangle signal-strength indicator with proportional fill and "value / 10" label. */
export function SignalStrengthIndicator({
  value,
  size = 16,
  showValue = true,
  className,
}: SignalStrengthIndicatorProps) {
  const w = size;
  const h = size;
  const r = Math.max(0, Math.min(value / 10, 1));
  const opacity = getTriangleOpacity(value);

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="shrink-0"
      >
        {/* Background triangle */}
        <polygon
          points={`0,${h} ${w},${h} ${w},0`}
          fill="var(--border)"
        />

        {/* Foreground fill triangle */}
        {r > 0 && (
          <polygon
            points={`0,${h} ${w * r},${h} ${w * r},${h * (1 - r)}`}
            fill="var(--foreground)"
            opacity={opacity}
          />
        )}
      </svg>

      {showValue && (
        <span className="leading-none font-medium text-foreground">
          {value} / 10
        </span>
      )}
    </div>
  );
}
