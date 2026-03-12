'use client';

import { cn, formatCompactNumber } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CampaignProgress } from '@/components/ui/campaign-progress';
import { SelectToggle } from '@/components/ui/select-toggle';
import { Users } from 'lucide-react';
import type { PartnerAssignmentSummary, PartnerSummary } from '@/lib/schemas';

/** UI-friendly shape for partner rows. */
export interface PartnerRowData {
  id: number;
  partnerId: number;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  type: string;
  industries: string[];
  capacity: number | null;
  status: string;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  taskCompletionPct: number;
}

/** Maps a PartnerAssignmentSummary from the API to a PartnerRowData for the UI. */
export function toPartnerRowData(p: PartnerAssignmentSummary): PartnerRowData {
  return {
    id: p.id,
    partnerId: p.partner_id,
    name: p.partner_name,
    slug: p.partner_slug,
    description: p.partner_description,
    logoUrl: p.partner_logo_url,
    type: p.partner_type,
    industries: p.partner_industries,
    capacity: p.partner_capacity,
    status: p.partner_status,
    assignedCount: p.assigned_company_count ?? 0,
    inProgressCount: p.in_progress_count ?? 0,
    completedCount: p.completed_count ?? 0,
    taskCompletionPct: p.task_completion_pct ?? 0,
  };
}

/** Maps a PartnerSummary (or PartnerRead) to a PartnerRowData for the UI. */
export function toPartnerRowDataFromSummary(p: PartnerSummary): PartnerRowData {
  return {
    id: p.id,
    partnerId: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    logoUrl: p.logo_url,
    type: p.type ?? '',
    industries: p.industries,
    capacity: p.capacity,
    status: p.status,
    assignedCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    taskCompletionPct: 0,
  };
}

interface PartnerRowProps {
  /** Partner data for the row. */
  partner: PartnerRowData;
  /** Row click handler. */
  onClick?: (partner: PartnerRowData) => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  /** Whether the row shows a selection toggle (edit mode). */
  selectable?: boolean;
  /** Whether the row is currently selected in bulk selection. */
  selected?: boolean;
  /** Called when the selection toggle is clicked. Receives the mouse event for shift-key detection. */
  onSelect?: (e: React.MouseEvent) => void;
  /** Optional content to render on the right side, replacing the default metrics. */
  rightContent?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row representation of a campaign partner. */
export function PartnerRow({ partner, onClick, isActive, selectable, selected, onSelect, rightContent, className, ref }: PartnerRowProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (selectable && onSelect) {
      onSelect(e);
    } else {
      onClick?.(partner);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectable && onSelect) {
        onSelect(e as unknown as React.MouseEvent);
      } else {
        onClick?.(partner);
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
          onChange={() => {/* handled by row click */}}
        />
      )}

      {/* Partner logo */}
      <Avatar size="sm" className="rounded-lg after:rounded-lg">
        {partner.logoUrl && <AvatarImage src={partner.logoUrl} alt={partner.name} className="rounded-lg" />}
        <AvatarFallback className="rounded-lg text-xs">
          {partner.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name + industries + description */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {partner.name}
        </span>
        {partner.industries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {partner.industries.map((industry) => (
              <Badge key={industry} variant="grey" className="text-[11px] px-1.5 py-0 h-5 font-normal">
                {industry}
              </Badge>
            ))}
          </div>
        )}
        {partner.description && (
          <p className="text-xs text-muted-foreground mt-1 max-w-xl line-clamp-2 leading-relaxed">
            {partner.description}
          </p>
        )}
      </div>

      {/* Right content slot — falls back to default campaign metrics */}
      {rightContent ?? (
        <div className="hidden md:flex items-center gap-7 shrink-0">
          {/* Campaign progress */}
          <div className="w-24">
            <CampaignProgress
              total={partner.assignedCount}
              inProgress={partner.inProgressCount}
              completed={partner.completedCount}
              taskCompletion={partner.taskCompletionPct}
              height={10}
              showTooltip
            />
          </div>

          {/* Capacity */}
          <span className="flex items-center gap-2 text-sm w-22">
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="tabular-nums">
              {formatCompactNumber(partner.assignedCount)}
              {partner.capacity != null ? ` / ${formatCompactNumber(partner.capacity)}` : ''}
            </span>
          </span>

          {/* Type badge */}
          <span className='w-24 truncate text-sm capitalize'>
            {partner.type}
          </span>
        </div>
      )}
    </div>
  );
}

/** Loading skeleton for PartnerRow. */
export function PartnerRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-36 h-4 bg-muted rounded animate-pulse" />
        <div className="w-48 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <div className="w-24 h-6 bg-muted rounded-full animate-pulse" />
        <div className="w-20 h-4 bg-muted rounded animate-pulse" />
        <div className="w-32 h-3 bg-muted rounded-full animate-pulse" />
      </div>
    </div>
  );
}
