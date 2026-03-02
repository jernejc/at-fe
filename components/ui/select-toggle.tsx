'use client';

import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectToggleProps {
  /** Whether the toggle is checked. */
  checked: boolean;
  /** Whether the toggle is in an indeterminate (partial) state. */
  indeterminate?: boolean;
  /** Called when the toggle is clicked. */
  onChange: () => void;
  className?: string;
}

/** Circular selection toggle with checked, unchecked, and indeterminate states. */
export function SelectToggle({ checked, indeterminate, onChange, className }: SelectToggleProps) {
  const isActive = checked || indeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      onClick={onChange}
      className={cn(
        'flex items-center justify-center size-5 rounded-full border-2 transition-colors shrink-0',
        isActive
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-transparent border-muted-foreground/40 hover:border-muted-foreground/70',
        className,
      )}
    >
      {checked && !indeterminate && <Check className="size-3" strokeWidth={3} />}
      {indeterminate && <Minus className="size-3" strokeWidth={3} />}
    </button>
  );
}
