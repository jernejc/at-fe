'use client';

import { cn } from '@/lib/utils';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { WSCompanyResult } from '@/lib/schemas';

interface CompanyRowProps {
  company: WSCompanyResult;
  isSelected: boolean;
  onSelect: (domain: string) => void;
}

/** Single row in the company results list showing product fit score, logo, name, domain, and match badge. */
export function CompanyRow({ company, isSelected, onSelect }: CompanyRowProps) {
  const fitScore = Math.round(company.product_fit_score * 100);
  const matchScore = Math.round(company.match_score * 100);
  const matchVariant = matchScore > 75 ? 'green' : matchScore >= 50 ? 'blue' : 'orange';
  const matchLabel = matchScore > 75 ? 'Strong match' : matchScore >= 50 ? 'Good match' : 'Weak match';
  const logoSrc = company.logo_base64
    ? `data:image/png;base64,${company.logo_base64}`
    : undefined;

  return (
    <button
      type="button"
      onClick={() => onSelect(company.domain)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-muted/50 border-b border-border',
        isSelected && 'bg-primary/5',
      )}
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
        <div className="text-xs text-muted-foreground truncate">{company.domain}</div>
      </div>

      <Badge variant={matchVariant} size="sm" className="shrink-0">
        {matchLabel}
      </Badge>
    </button>
  );
}
