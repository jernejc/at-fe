'use client';

import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
  useExpandableCard,
} from '@/components/ui/expandable-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CompanyRead } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';

interface CompanyInfoCardProps {
  company: CompanyRead;
}

/** Displays company description, logo, and expandable details grid with specialties. */
export function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const hasExpandedContent =
    (company.specialties?.length ?? 0) > 0 ||
    company.industry ||
    company.company_type ||
    company.employee_count_range;

  const logoSrc = company.logo_base64
    ? `data:image/png;base64,${company.logo_base64}`
    : company.logo_url ?? undefined;

  return (
    <ExpandableCard>
      <ExpandableCardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Company info</h3>
          <Avatar size="sm" className="rounded-lg after:rounded-lg">
            {logoSrc && <AvatarImage src={logoSrc} alt={company.name} className="rounded-lg" />}
            <AvatarFallback className="rounded-lg text-xs">
              {company.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {company.description && (
          <CompanyDescription description={company.description} />
        )}
      </ExpandableCardHeader>

      {hasExpandedContent && (
        <ExpandableCardDetails className="pt-5 space-y-5">
          {/* Specialties */}
          {company.specialties && company.specialties.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {company.specialties.map((s, i) => (
                    <Badge key={i} variant="blue" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Details table */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Details
            </p>
            <div className="grid grid-cols-2 border border-border rounded-lg overflow-hidden">
              <DetailCell label="Industry" value={company.industry} />
              <DetailCell label="Type" value={company.company_type} />
              <DetailCell label="Size" value={company.employee_count_range} />
              <DetailCell label="Revenue" value={company.revenue} />
              <DetailCell label="Headquarters" value={formatLocation(company)} />
              <DetailCell label="Country" value={company.hq_country} />
              <DetailCell label="Founded" value={company.founded_year} />
              <DetailCell label="Stock" value={company.ticker} />
            </div>
          </div>
        </ExpandableCardDetails>
      )}
    </ExpandableCard>
  );
}

function CompanyDescription({ description }: { description: string }) {
  const { expanded } = useExpandableCard();
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">About</p>
      <p className={cn('leading-relaxed', !expanded && 'line-clamp-4')}>
        {description}
      </p>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="border-b border-r border-border px-3 py-2 last:border-r-0 even:border-r-0 nth-last-[-n+2]:border-b-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value || '\u2014'}</p>
    </div>
  );
}

function formatLocation(company: CompanyRead): string {
  const parts = [company.hq_city, company.hq_state, company.hq_country].filter(Boolean);
  return parts.join(', ') || '\u2014';
}
