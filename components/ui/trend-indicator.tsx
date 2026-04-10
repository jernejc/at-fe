import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  /** Numeric change value (positive or negative) */
  change: number;
  /** Layout direction: column (default) or row */
  direction?: 'col' | 'row';
  className?: string;
}

/** Displays a numeric change with a trending up/down icon. */
export function TrendIndicator({ change, direction = 'col', className }: TrendIndicatorProps) {
  if (change === 0) return null;

  const isPositive = change > 0;
  const label = isPositive ? `+${change}` : `${change}`;
  const iconSize = 14;
  const isRow = direction === 'row';

  return (
    <div
      className={cn(
        'flex items-center text-muted-foreground',
        isRow ? 'flex-row gap-1' : 'flex-col',
        className,
      )}
    >
      {isPositive ? (
        <>
          <TrendingUp size={iconSize} />
          <span className="text-[11px] leading-tight font-medium">{label}</span>
        </>
      ) : (
        <>
          {!isRow && <span className="text-[11px] leading-tight font-medium">{label}</span>}
          <TrendingDown size={iconSize} />
          {isRow && <span className="text-[11px] leading-tight font-medium">{label}</span>}
        </>
      )}
    </div>
  );
}
