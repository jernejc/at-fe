'use client';

import { cn } from '@/lib/utils';
import type { EmployeeSummary } from '@/lib/schemas';
import { Key, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SelectToggle } from '@/components/ui/select-toggle';

interface PersonRowProps {
  /** Person data for the row. */
  person: EmployeeSummary;
  /** Row click handler. */
  onClick?: (person: EmployeeSummary) => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  /** Whether the row shows a selection toggle (edit mode). */
  selectable?: boolean;
  /** Whether the row is currently selected in bulk selection. */
  selected?: boolean;
  /** Called when the selection toggle is clicked. Receives the mouse event for shift-key detection. */
  onSelect?: (e: React.MouseEvent) => void;
  /** Show a key contact indicator icon before the avatar. */
  keyContact?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row representation of a person with avatar, name, title, and metrics. */
export function PersonRow({ person, onClick, isActive, selectable, selected, onSelect, keyContact, className, ref }: PersonRowProps) {
  const location = [person.city, person.country].filter(Boolean).join(', ');

  const handleClick = (e: React.MouseEvent) => {
    if (selectable && onSelect) {
      onSelect(e);
    } else {
      onClick?.(person);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectable && onSelect) {
        onSelect(e as unknown as React.MouseEvent);
      } else {
        onClick?.(person);
      }
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        'group flex items-center gap-4 px-6 py-4 transition-colors outline-none',
        (onClick || selectable) && 'cursor-pointer hover:bg-card hover:shadow-[0_0_0_1px_var(--border)] hover:rounded-xl',
        (isActive || selected) && 'bg-card shadow-[0_0_0_1px_var(--border)] rounded-xl',
        className,
      )}
      onClick={handleClick}
      tabIndex={(onClick || selectable) ? 0 : undefined}
      onKeyDown={(onClick || selectable) ? handleKeyDown : undefined}
    >
      {/* Selection toggle (edit mode) */}
      {selectable && (
        <SelectToggle
          checked={!!selected}
          onChange={() => {/* handled by row click */ }}
        />
      )}

      {/* Key contact indicator */}
      {keyContact && (
        <Key className="w-4 h-4 text-amber-500 shrink-0" />
      )}

      {/* Person avatar */}
      <Avatar size="sm">
        {person.avatar_url && <AvatarImage src={person.avatar_url} alt={person.full_name} />}
        <AvatarFallback className="text-xs">
          {person.full_name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name + title */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {person.full_name}
        </span>
        {person.current_title && (
          <span className="text-xs text-muted-foreground truncate mt-0.5">
            {person.current_title}
          </span>
        )}
      </div>

      {/* Metrics (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-7 shrink-0">
        {/* Department */}
        {person.department && (
          <span className="text-sm text-muted-foreground truncate w-28">
            {person.department}
          </span>
        )}

        {/* Location */}
        {location && (
          <span className="flex items-center gap-2 text-sm w-30">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </span>
        )}

        {/* LinkedIn */}
        {person.profile_url ? (
          <a
            href={person.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        ) : (
          <div className="w-4 h-4" />
        )}
      </div>
    </div>
  );
}

/** Loading skeleton for PersonRow. */
export function PersonRowSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 px-6 py-4", className)}>
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-32 h-4 bg-muted rounded animate-pulse" />
        <div className="w-24 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <div className="w-28 h-4 bg-muted rounded animate-pulse" />
        <div className="w-30 h-4 bg-muted rounded animate-pulse" />
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
