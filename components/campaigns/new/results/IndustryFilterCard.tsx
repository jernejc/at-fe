'use client';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface IndustryFilterCardProps {
  industries: string[];
  selected: Set<string>;
  onToggle: (industry: string) => void;
}

/** Filter card displaying industry badges that toggle on/off. */
export function IndustryFilterCard({ industries, selected, onToggle }: IndustryFilterCardProps) {
  return (
    <div className="rounded-xl bg-background p-6">
      <span className="text-sm text-muted-foreground">Industries</span>
      <div className="flex flex-wrap gap-2 mt-3">
        {industries.map((ind) => (
          <Badge
            key={ind}
            variant={selected.has(ind) ? 'default' : 'grey'}
            className={cn('cursor-pointer transition-colors', !selected.has(ind) && 'opacity-50')}
            onClick={() => onToggle(ind)}
          >
            {ind}
          </Badge>
        ))}
        {industries.length === 0 && (
          <span className="text-xs text-muted-foreground">No industry data available</span>
        )}
      </div>
    </div>
  );
}
