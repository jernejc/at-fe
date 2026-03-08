import { cn, normalizeScore } from '@/lib/utils';
import type { ProductRowData } from '@/lib/schemas';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { Badge } from '@/components/ui/badge';

interface ProductRowProps {
  /** Product fit data for the row. */
  product: ProductRowData;
  /** Row click handler. */
  onClick?: (product: ProductRowData) => void;
  /** Whether this row is currently active/selected. */
  isActive?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row for a product fit score with name, drivers, and likelihood. */
export function ProductRow({ product, onClick, isActive, className, ref }: ProductRowProps) {
  const score = Math.round(normalizeScore(product.combined_score));
  const likelihood = Math.round(normalizeScore(product.likelihood_score));

  const handleClick = () => onClick?.(product);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(product);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group flex items-center gap-4 px-6 py-4 transition-colors outline-none',
        onClick && 'cursor-pointer hover:bg-card hover:shadow-[0_0_0_1px_var(--border)] hover:rounded-xl',
        isActive && 'bg-card shadow-[0_0_0_1px_var(--border)] rounded-xl',
        className,
      )}
      onClick={onClick ? handleClick : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {/* Fit score disc + value */}
      <FitScoreIndicator score={score} size={16} showChange={false} className="w-12 shrink-0" />

      {/* Product name + top drivers */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {product.product_name}
        </span>
        {product.top_drivers && product.top_drivers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.top_drivers.slice(0, 3).map((driver, i) => (
              <Badge key={i} variant="grey" size="sm" className="capitalize">
                {driver.replace(/_/g, ' ')}
              </Badge>
            ))}
            {product.top_drivers.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{product.top_drivers.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Likelihood metric (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 shrink-0 w-24">
        <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground/60 rounded-full"
            style={{ width: `${likelihood}%` }}
          />
        </div>
        <span className="w-7 text-right font-mono text-[11px] text-foreground">
          {likelihood}%
        </span>
      </div>
    </div>
  );
}

/** Loading skeleton for ProductRow. */
export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-12 h-4 bg-muted rounded animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="w-36 h-4 bg-muted rounded animate-pulse" />
        <div className="w-48 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:block w-36 h-4 bg-muted rounded animate-pulse shrink-0" />
    </div>
  );
}
