import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface StatusIndicatorProps {
  /** Campaign or entity status string */
  status: string;
  /** Dot diameter in pixels @default 8 */
  size?: number;
  className?: string;
}

/** Returns Tailwind classes for the status dot background color. */
export function getStatusDotColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'published') return 'bg-emerald-500';
  if (s === 'draft') return 'bg-slate-400';
  if (s === 'completed') return 'bg-emerald-700 dark:bg-emerald-600';
  if (s === 'archived') return 'bg-amber-500';
  return 'bg-slate-400';
}

/** Small colored dot indicating entity status, with a tooltip label. */
export function StatusIndicator({ status, size = 8, className }: StatusIndicatorProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn('shrink-0 rounded-full', getStatusDotColor(status), className)}
        style={{ width: size, height: size }}
      />
      <TooltipContent side="bottom">
        <span className="capitalize">{status}</span>
      </TooltipContent>
    </Tooltip>
  );
}
