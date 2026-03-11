import { cn } from '@/lib/utils';

interface CircularProgressProps {
  /** Progress value from 0 to 100. */
  value: number;
  /** Diameter of the circle in pixels. @default 16 */
  size?: number;
  className?: string;
}

/** Computes foreground opacity: 20% at value ≤50, linearly to 100% at value ≥90. */
function getForegroundOpacity(value: number): number {
  if (value <= 50) return 0.2;
  if (value >= 90) return 1;
  return 0.2 + ((value - 50) / 40) * 0.8;
}

/** Circular SVG progress indicator with proportional stroke and opacity scaling. */
export function CircularProgress({
  value,
  size = 16,
  className,
}: CircularProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const strokeWidth = size * 0.15;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cn('shrink-0', className)}
      aria-label={`Progress: ${Math.round(clamped)}%`}
    >
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--muted)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Foreground arc */}
      {clamped > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="var(--foreground)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          opacity={getForegroundOpacity(clamped)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
    </svg>
  );
}
