import { cn } from '@/lib/utils';
import { OctagonX } from 'lucide-react';

interface ObjectionRowProps {
  objection: string;
  response?: string;
  /** Row click handler. */
  onClick?: () => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Row displaying an objection title with an icon and truncated response. */
export function ObjectionRow({ objection, response, onClick, isActive, className, ref }: ObjectionRowProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
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
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        <OctagonX className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">{objection}</span>
        {response && (
          <span className="text-xs text-muted-foreground truncate mt-0.5 max-w-4xl">{response}</span>
        )}
      </div>
    </div>
  );
}
