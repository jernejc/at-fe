import { cn } from '@/lib/utils';
import { OctagonX } from 'lucide-react';

interface ObjectionRowProps {
  objection: string;
  response?: string;
  className?: string;
}

/** Static row displaying an objection title with an icon and truncated response. */
export function ObjectionRow({ objection, response, className }: ObjectionRowProps) {
  return (
    <div className={cn('flex items-center gap-4 px-6 py-4', className)}>
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
