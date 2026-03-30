'use client';

import { Users, X, Plus } from 'lucide-react';
import { cn, formatCurrency, formatCompactNumber } from '@/lib/utils';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { WSCompanyResult } from '@/lib/schemas';

interface CompanyRowProps {
  company: WSCompanyResult;
  isSelected: boolean;
  onSelect: (domain: string) => void;
  isExcluded: boolean;
  onToggleExclude: (domain: string) => void;
}

/** Single row in the company results list showing product fit score, logo, name, domain, and match badge. */
export function CompanyRow({ company, isSelected, onSelect, isExcluded, onToggleExclude }: CompanyRowProps) {
  const fitScore = Math.round(company.product_fit_score * 100);
  const matchScore = Math.round(company.match_score * 100);
  const matchVariant = matchScore > 75 ? 'green' : matchScore >= 50 ? 'blue' : 'orange';
  const matchLabel = matchScore > 75 ? 'Strong match' : matchScore >= 50 ? 'Good match' : 'Weak match';
  const logoSrc = company.logo_base64
    ? `data:image/png;base64,${company.logo_base64}`
    : undefined;

  return (
    <div
      className={cn(
        'group w-full flex items-center text-left transition-colors',
        'hover:bg-muted/50 border-b border-border',
        isSelected && 'bg-primary/5',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(company.domain)}
        className={cn('flex-1 min-w-0 flex items-center gap-3 px-4 py-3 text-left', isExcluded && 'opacity-50')}
      >
        <FitScoreIndicator score={fitScore} size={14} showChange={false} showValue />

        <Avatar className="size-8 rounded-md shrink-0">
          {logoSrc && <AvatarImage src={logoSrc} alt={company.name} />}
          <AvatarFallback className="text-xs rounded-md">
            {company.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground truncate">{company.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            <span className="shrink-0 inline-flex items-center gap-0.5">
              <Users className="size-3" />
              {company.employee_count != null ? formatCompactNumber(company.employee_count) : '-'}
            </span>
            <span className="shrink-0">
              {company.revenue_amount != null ? formatCurrency(company.revenue_amount) : '-'}
            </span>
            <span className="truncate">{company.domain}</span>
          </div>
        </div>

        <Badge variant={matchVariant} size="sm" className="shrink-0">
          {matchLabel}
        </Badge>
      </button>

      <button
        type="button"
        onClick={() => onToggleExclude(company.domain)}
        className={cn(
          'shrink-0 w-8 h-8 mr-2 flex items-center justify-center rounded-md transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'invisible group-hover:visible',
          isExcluded && 'visible',
        )}
        aria-label={isExcluded ? 'Re-add company' : 'Exclude company'}
      >
        {isExcluded ? <Plus className="size-4" /> : <X className="size-4" />}
      </button>
    </div>
  );
}
