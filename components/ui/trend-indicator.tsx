import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  /** Numeric change value (positive or negative) */
  change: number;
  className?: string;
}

/** Displays a numeric change with a trending up/down icon. */
export function TrendIndicator({ change, className }: TrendIndicatorProps) {
  if (change === 0) return null;

  const isPositive = change > 0;
  const label = isPositive ? `+${change}` : `${change}`;
  const iconSize = 14;

  return (
    <div
      className={cn(
        'flex flex-col items-center text-muted-foreground',
        className
      )}
    >
      {isPositive ? (
        <>
          <TrendingUp size={iconSize} />
          <span className="text-[11px] leading-tight font-medium">{label}</span>
        </>
      ) : (
        <>
          <span className="text-[11px] leading-tight font-medium">{label}</span>
          <TrendingDown size={iconSize} />
        </>
      )}
    </div>
  );
}
