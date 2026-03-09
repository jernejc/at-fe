'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IndustryFilterCardProps {
  industries: { name: string; count: number }[];
  selected: Set<string>;
  onToggle: (industry: string) => void;
}

/** Filter card displaying industry badges with company counts, sorted by popularity. */
export function IndustryFilterCard({ industries, selected, onToggle }: IndustryFilterCardProps) {
  return (
    <div className="rounded-xl bg-background p-6 max-h-51 overflow-y-auto">
      <span className="text-sm text-muted-foreground">Industries</span>
      <div className="flex flex-wrap gap-2 mt-3">
        {industries.map((ind) => (
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
      </div>
    </div>
  );
}
