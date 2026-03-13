import { cn, getCompanyStatusLabel } from '@/lib/utils';

/** Valid lifecycle statuses for a company within a campaign. */
export type CompanyStatusValue =
  | 'default'
  | 'new'
  | 'in_progress'
  | 'closed_won'
  | 'closed_lost';

interface CompanyStatusProps {
  /** Current lifecycle status of the company. */
  status: CompanyStatusValue;
  /** Progress percentage (0-100). Only used when status is 'in_progress'. */
  progress?: number;
  /** Diameter of the indicator in pixels. @default 20 */
  size?: number;
  className?: string;
}

const STROKE_WIDTH = 5;
const RADIUS = 7.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Circle indicator showing a company's lifecycle status within a campaign. */
export function CompanyStatus({
  status,
  progress = 0,
  size = 20,
  className,
}: CompanyStatusProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const dashOffset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={cn('shrink-0', className)}
      aria-label={`Company status: ${getCompanyStatusLabel(status)}`}
    >
      {status === 'default' && (
        <circle
          cx={10}
          cy={10}
          r={RADIUS}
          stroke="var(--gray-300)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
      )}

      {status === 'new' && (
        <circle
          cx={10}
          cy={10}
          r={RADIUS}
          stroke="var(--accent-yellow)"
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
      )}

      {status === 'in_progress' && (
        <g transform="rotate(-90 10 10)">
          <circle
            cx={10}
            cy={10}
            r={RADIUS}
            stroke="var(--accent-green)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {clamped > 0 && (
            <circle
              cx={10}
              cy={10}
              r={RADIUS}
              stroke="var(--accent-green-dark)"
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
            />
          )}
        </g>
      )}

      {status === 'closed_won' && (
        <>
          <circle cx={10} cy={10} r={10} fill="var(--accent-green-dark)" />
          <path
            d="M6.5 10.5 L9 13 L14 7"
            stroke="var(--background)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}

      {status === 'closed_lost' && (
        <>
          <circle cx={10} cy={10} r={10} fill="var(--accent-dark-red)" />
          <path
            d="M7 7 L13 13 M13 7 L7 13"
            stroke="var(--background)"
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
