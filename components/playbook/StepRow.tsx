import { cn } from '@/lib/utils';
import type { CadenceStep } from '@/lib/schemas';
import { StickyNote, Reply } from 'lucide-react';
import { ChannelIcon } from './ChannelIcon';

interface StepRowProps {
  step: CadenceStep;
  /** Row click handler. */
  onClick?: () => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Row displaying an outreach cadence step with day offset, channel, contacts, objective, and indicator icons. */
export function StepRow({ step, onClick, isActive, className, ref }: StepRowProps) {
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
      {/* Day offset badge */}
      <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex flex-col items-center justify-center">
        <span className="text-[10px] text-muted-foreground uppercase leading-none">Day</span>
        <span className="text-base font-semibold text-foreground leading-tight">{step.day_offset ?? 0}</span>
      </div>

      {/* Contacts + objective */}
      <div className="flex-1 min-w-0 flex flex-col">
        {step.contacts && step.contacts.length > 0 && (
          <span className="text-base font-medium text-foreground truncate leading-tight">
            {step.contacts.join(', ')}
          </span>
        )}
        {step.objective && (
          <span className="text-xs text-muted-foreground truncate mt-0.5 max-w-4xl">
            {step.objective}
          </span>
        )}
      </div>

      {/* Metrics: channel + notes + follow-up */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <span className="flex items-center gap-2 text-sm capitalize w-28">
          <ChannelIcon channel={step.channel} />
          <span className='truncate'>{step.channel.replace(/_/g, ' ')}</span>
        </span>
        <span className="w-6 flex justify-center">
          {step.notes && <StickyNote className="w-4 h-4" />}
        </span>
        <span className="w-6 flex justify-center">
          {step.follow_up && <Reply className="w-4 h-4" />}
        </span>
      </div>
    </div>
  );
}
