import type { SignalInterest, SignalEvent } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Activity, Users } from 'lucide-react';
import { SignalStrengthIndicator } from '@/components/ui/signal-strength-indicator';
import { Badge } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/components/ui/badge';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

const sourceTypeBadgeVariant: Record<string, BadgeVariant> = {
  employee: 'blue',
  post: 'purple',
  technographics: 'green',
  job: 'orange',
  news: 'red',
};

function getBadgeVariant(sourceType: string): BadgeVariant {
  return sourceTypeBadgeVariant[sourceType.toLowerCase()] || 'grey';
}

function formatSourceType(sourceType: string) {
  return sourceType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface SignalRowProps {
  /** Signal data (interest or event). */
  signal: SignalInterest | SignalEvent;
  /** Row click handler. */
  onClick?: () => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row representation of a signal with strength indicator, source badges, and metrics. */
export function SignalRow({ signal, onClick, isActive, className, ref }: SignalRowProps) {
  const visibleSourceTypes = (signal.source_types ?? []).filter((st) => {
    const n = st.toLowerCase();
    return n !== 'apollo_industry' && n !== 'apollo_growth' && n !== 'apollo_revenue';
  });

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-4 px-6 py-4 transition-colors outline-none',
        (onClick) && 'cursor-pointer hover:bg-card hover:shadow-[0_0_0_1px_var(--border)] hover:rounded-xl',
        isActive && 'bg-card shadow-[0_0_0_1px_var(--border)] rounded-xl',
        className,
      )}
    >
      {/* Signal strength triangle */}
      <SignalStrengthIndicator value={signal.strength} className='flex-col text-xs' />

      {/* Name + evidence */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {signal.display_name || signal.category}
        </span>
        {signal.evidence_summary && (
          <span className="text-xs text-muted-foreground line-clamp-2 max-w-xl mt-0.5">
            {signal.evidence_summary}
          </span>
        )}
      </div>

      {/* Metrics (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        {/* Source type badges */}
        {visibleSourceTypes.length > 0 && (
          <div className="flex items-center justify-end gap-1">
            {visibleSourceTypes.slice(0, 3).map((st, i) => (
              <Badge key={i} variant={getBadgeVariant(st)} size="sm">
                {formatSourceType(st)}
              </Badge>
            ))}
            {visibleSourceTypes.length > 3 && (
              <span className="text-[10px] text-muted-foreground px-1">
                +{visibleSourceTypes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Contributor count */}
        <span className="flex items-center gap-2 text-sm w-12">
          <Users className="w-3.5 h-3.5 shrink-0" />
          <span>{signal.contributor_count}</span>
        </span>

        {/* Component count */}
        {signal.component_count > 0 && (
          <span className="flex items-center gap-2 text-sm w-12">
            <Activity className="w-3.5 h-3.5 shrink-0" />
            <span>{signal.component_count}</span>
          </span>
        )}
      </div>
    </div>
  );
}

/** Loading skeleton for SignalRow. */
export function SignalRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 -mx-5">
      <div className="w-4 h-4 bg-muted rounded animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-36 h-4 bg-muted rounded animate-pulse" />
        <div className="w-56 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <div className="w-40 h-4 bg-muted rounded animate-pulse" />
        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
