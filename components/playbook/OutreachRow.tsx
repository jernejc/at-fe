import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { PlaybookContactResponse } from '@/lib/schemas';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OutreachStepCell } from './OutreachStepCell';

interface OutreachRowProps {
  contact: PlaybookContactResponse;
  /** Total number of days to render columns for. */
  maxDay: number;
  /** Row click handler to open contact detail. */
  onClick: (contact: PlaybookContactResponse) => void;
  /** Whether this row is currently selected/active. */
  isActive: boolean;
  ref?: React.Ref<HTMLDivElement>;
}

/** Single outreach row: sticky contact info on the left, day-by-day step cells on the right. */
export function OutreachRow({ contact, maxDay, onClick, isActive, ref }: OutreachRowProps) {
  const stepsByDay = useMemo(() => {
    const map = new Map<number, (typeof contact.sequence)[number]>();
    for (const s of contact.sequence ?? []) {
      map.set(s.day_offset, s);
    }
    return map;
  }, [contact.sequence]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(contact);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group flex items-center transition-colors outline-none',
        'cursor-pointer hover:bg-card hover:shadow-[0_0_0_1px_var(--border)] hover:rounded-xl',
        isActive && 'bg-card shadow-[0_0_0_1px_var(--border)] rounded-xl',
      )}
      onClick={() => onClick(contact)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Sticky contact info */}
      <div className="w-55 shrink-0 flex items-center gap-3 px-6 py-3 sticky left-0 z-1 bg-background group-hover:bg-card rounded-l-xl">
        <Avatar size="sm">
          <AvatarFallback className="text-xs">
            {contact.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-sm font-medium text-foreground truncate leading-tight">
            {contact.name}
          </span>
          {contact.title && (
            <span className="text-xs text-muted-foreground truncate mt-0.5">
              {contact.title}
            </span>
          )}
        </div>
      </div>

      {/* Day cells */}
      <div className="flex items-center">
        {Array.from({ length: maxDay + 1 }, (_, i) => {
          const day = i;
          const step = stepsByDay.get(day);
          return step ? (
            <OutreachStepCell key={day} step={step} />
          ) : (
            <div key={day} className="w-20 m-2 shrink-0" />
          );
        })}
      </div>
    </div>
  );
}
