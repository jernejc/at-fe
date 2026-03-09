'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const DEFAULT_VISIBLE = 20;

interface IndustryFilterCardProps {
  industries: { name: string; count: number }[];
  selected: Set<string>;
  onToggle: (industry: string) => void;
  className?: string;
}

/** Filter card displaying industry badges with company counts, sorted by popularity. */
export function IndustryFilterCard({ industries, selected, onToggle, className }: IndustryFilterCardProps) {
  const [showAll, setShowAll] = useState(false);
  const hasMore = industries.length > DEFAULT_VISIBLE;
  const visible = showAll ? industries : industries.slice(0, DEFAULT_VISIBLE);

  return (
    <div className={cn('rounded-xl bg-background p-6 overflow-y-auto', className)}>
      <span className="text-sm text-muted-foreground">Industries</span>
      <div className="flex flex-wrap gap-2 mt-3">
        {visible.map((ind) => (
          <Badge
            key={ind.name}
            variant={selected.has(ind.name) ? 'default' : 'grey'}
            className={cn('cursor-pointer transition-colors', !selected.has(ind.name) && 'opacity-50')}
            onClick={() => onToggle(ind.name)}
          >
            {ind.name}
            <span className="ml-1 opacity-60">{ind.count}</span>
          </Badge>
        ))}
        {industries.length === 0 && (
          <span className="text-xs text-muted-foreground">No industry data available</span>
        )}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAll ? 'Show less' : `Show all (${industries.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
