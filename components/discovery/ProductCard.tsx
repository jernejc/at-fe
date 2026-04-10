'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';

interface ProductCardProps {
  /** Product display name (or "None"). */
  label: string;
  /** Normalized fit score (0-100). Omitted for the "None" card. */
  score?: number;
  /** Whether this card is currently selected. */
  isSelected: boolean;
  onClick: () => void;
}

/** Selectable product card for the horizontal dashboard scroller. */
export function ProductCard({ label, score, isSelected, onClick }: ProductCardProps) {
  const isNone = score == null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col justify-between gap-2 rounded-sm border px-3 py-2.5 min-w-40 text-left transition-colors cursor-pointer shrink-0 border-border',
        isSelected
          ? 'bg-gray-200'
          : 'bg-card hover:bg-accent',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            'flex items-center justify-center size-5 rounded-full border-2 shrink-0 transition-colors',
            isSelected
              ? 'bg-foreground border-foreground text-primary-foreground'
              : 'bg-transparent border-muted-foreground/40',
          )}
        >
          {isSelected && <Check className="size-3" strokeWidth={3} />}
        </div>
        {!isNone && (
          <FitScoreIndicator
            score={score}
            size={14}
            showChange={false}
          />
        )}
      </div>
      <span className="text-sm font-medium line-clamp-2">{label}</span>
    </button>
  );
}
