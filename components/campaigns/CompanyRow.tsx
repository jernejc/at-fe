'use client';

import { cn, formatCurrency, formatCompactNumber, normalizeScoreNullable } from '@/lib/utils';
import type { CompanyRowData } from '@/lib/schemas';
import { CircleOff, MapPin, Users } from 'lucide-react';
import { CompanyStatus, type CompanyStatusValue } from '@/components/ui/company-status';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SelectToggle } from '@/components/ui/select-toggle';

interface CompanyRowProps {
  /** Company data for the row. */
  company: CompanyRowData;
  /** Row click handler. */
  onClick?: (company: CompanyRowData) => void;
  /** Whether this row is currently selected/active. */
  isActive?: boolean;
  /** Whether the row shows a selection toggle (edit mode). */
  selectable?: boolean;
  /** Whether the row is currently selected in bulk selection. */
  selected?: boolean;
  /** Called when the selection toggle is clicked. Receives the mouse event for shift-key detection. */
  onSelect?: (e: React.MouseEvent) => void;
  /** Compact mode: shows only fit score, location, and employee count without fixed widths. */
  compact?: boolean;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}

/** Horizontal row representation of a company with status, score, and metrics. */
export function CompanyRow({ company, onClick, isActive, selectable, selected, onSelect, compact, className, ref }: CompanyRowProps) {
  const fitScore = company.fit_score != null
    ? Math.round(normalizeScoreNullable(company.fit_score))
    : null;

  const logoSrc = company.logo_base64
    ? `data:image/png;base64,${company.logo_base64}`
    : company.logo_url ?? undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (selectable && onSelect) {
      onSelect(e);
    } else {
      onClick?.(company);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (selectable && onSelect) {
        onSelect(e as unknown as React.MouseEvent);
      } else {
        onClick?.(company);
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

      {/* Status indicator */}
      <CompanyStatus
        status={company.status as CompanyStatusValue}
        progress={company.progress}
      />

      {/* Company logo */}
      <Avatar size="sm" className="rounded-lg after:rounded-lg">
        {logoSrc && <AvatarImage src={logoSrc} alt={company.name} className="rounded-lg" />}
        <AvatarFallback className="rounded-lg text-xs">
          {company.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name + domain */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-base font-medium text-foreground truncate leading-tight">
          {company.name}
        </span>
        <span className="text-xs text-muted-foreground truncate mt-0.5">
          {company.domain}
        </span>
      </div>

      {/* Metrics (hidden on mobile) */}
      {compact ? (
        <div className="hidden md:flex items-center gap-5 shrink-0">
          {fitScore != null && (
            <FitScoreIndicator
              score={fitScore}
              change={company.fit_score_change ?? undefined}
              size={16}
            />
          )}

          {company.hq_country && (
            <span className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[100px]">{company.hq_country}</span>
            </span>
          )}

          {company.employee_count != null && (
            <span className="flex items-center gap-2 text-sm">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{formatCompactNumber(company.employee_count)}</span>
            </span>
          )}
        </div>
      ) : (
        <div className="hidden md:flex items-center gap-7 shrink-0">
          {/* Fit Score + trend */}
          {fitScore != null && (
            <FitScoreIndicator
              score={fitScore}
              change={company.fit_score_change ?? undefined}
              size={16}
              className='w-18'
            />
          )}

          {/* Location */}
          {company.hq_country && (
            <span className="flex items-center gap-2 text-sm w-30">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-[120px]">{company.hq_country}</span>
            </span>
          )}

          {/* Employee count */}
          {company.employee_count != null && (
            <span className="flex items-center gap-2 text-sm w-16">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{formatCompactNumber(company.employee_count)}</span>
            </span>
          )}

          {/* Revenue */}
          <span className="text-sm tabular-nums w-20">
            {company.revenue != null ? formatCurrency(company.revenue) : '\u2013'}
          </span>

          {/* Assigned partner */}
          <div className="flex items-center gap-2 shrink-0 w-30">
            {company.partner_name && (
              <>
                <Avatar className="w-6 h-6">
                  {company.partner_logo_url && (
                    <AvatarImage src={company.partner_logo_url} alt={company.partner_name} />
                  )}
                  <AvatarFallback className="text-[10px]">
                    {company.partner_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground truncate max-w-[100px]">
                  {company.partner_name}
                </span>
              </>
            ) || (
                <>
                  <CircleOff className='size-4 text-muted-foreground mx-1' />
                  <span className="text-sm text-foreground truncate max-w-[100px]">
                    Unassigned
                  </span>
                </>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Loading skeleton for CompanyRow. */
export function CompanyRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
      <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="w-36 h-4 bg-muted rounded animate-pulse" />
        <div className="w-24 h-3 bg-muted rounded animate-pulse" />
      </div>
      <div className="hidden md:flex items-center gap-7 shrink-0">
        <div className="w-18 h-4 bg-muted rounded animate-pulse" />
        <div className="w-30 h-4 bg-muted rounded animate-pulse" />
        <div className="w-16 h-4 bg-muted rounded animate-pulse" />
        <div className="w-20 h-4 bg-muted rounded animate-pulse" />
        <div className="w-30 h-4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}
