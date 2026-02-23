import { cn } from '@/lib/utils';
import { TrendIndicator } from './trend-indicator';

interface FitScoreIndicatorProps {
  /** Fit score from 0 to 100 */
  score: number;
  /** Score change since last period */
  change?: number;
  /** Disc diameter in pixels (default: 16) */
  size?: number;
  /** Show numeric score value (default: true) */
  showValue?: boolean;
  /** Show change indicator (default: true) */
  showChange?: boolean;
  className?: string;
}

/** Computes disc opacity: 20% at score ≤50, linearly to 100% at score ≥90. */
function getDiscOpacity(score: number): number {
  if (score <= 50) return 0.2;
  if (score >= 90) return 1;
  return 0.2 + ((score - 50) / 40) * 0.8;
}

/** Pie-chart disc + numeric value + optional trend indicator for fit scores. */
export function FitScoreIndicator({
  score,
  change,
  size = 16,
  showValue = true,
  showChange = true,
  className,
}: FitScoreIndicatorProps) {
  const angle = (score / 100) * 360;
  const discOpacity = getDiscOpacity(score);

  const emptyColor = 'var(--border)';
  const background =
    score === 0
      ? emptyColor
      : `conic-gradient(var(--foreground) ${angle}deg, ${emptyColor} ${angle}deg)`;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background,
          opacity: discOpacity,
        }}
      />

      {showValue && (
        <span className="text-sm leading-none font-medium text-foreground">
          {score}
        </span>
      )}

      {showChange && change != null && change !== 0 && (
        <TrendIndicator change={change} />
      )}
    </div>
  );
}
