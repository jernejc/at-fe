import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Users, Eye, Zap } from 'lucide-react';
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

/**
 * Minimal signal shape that SignalRow can display.
 * Satisfied by SignalInterest, SignalEvent, and SignalContribution.
 */
export type SignalRowData = {
  category: string;
  display_name?: string | null;
  strength: number;
  evidence_summary?: string | null;
  source_types?: string[];
  contributor_count?: number;
  component_count?: number;
  /** Signal type discriminator for displaying a type badge. */
  signalType?: 'interest' | 'event';
};

interface SignalRowProps {
  /** Signal data (interest, event, or contribution). */
  signal: SignalRowData;
  /** Row click handler. */
  onClick?: () => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  /** Custom right-side metrics. When provided, replaces the default metrics block. */
  metrics?: ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row representation of a signal with strength indicator, source badges, and metrics. */
export function SignalRow({ signal, onClick, isActive, metrics, className, ref }: SignalRowProps) {
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

      {/* Name + source badges + evidence */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {signal.display_name || signal.category}
        </span>
        {visibleSourceTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {visibleSourceTypes.slice(0, 3).map((st) => (
              <Badge key={st} variant={getBadgeVariant(st)} size="sm">
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
        {signal.evidence_summary && (
          <span className="text-xs text-muted-foreground line-clamp-2 max-w-xl mt-0.5">
            {signal.evidence_summary}
          </span>
        )}
      </div>

      {/* Metrics (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-4 shrink-0">
        {metrics ?? (
          <>
            {signal.signalType && (
              <span className="flex items-center gap-2 text-sm w-26">
                {signal.signalType === 'interest' ? (
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="capitalize">{signal.signalType}</span>
              </span>
            )}
            <span className="flex items-center gap-2 text-sm w-15">
              {signal.contributor_count != null && (
                <>
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{signal.contributor_count}</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-2 text-sm w-12">
              {signal.component_count != null && signal.component_count > 0 && (
                <>
                  <Activity className="w-3.5 h-3.5 shrink-0" />
                  <span>{signal.component_count}</span>
                </>
              )}
            </span>
          </>
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
