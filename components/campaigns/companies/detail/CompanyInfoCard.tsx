'use client';

import type { ComponentType, SVGProps } from 'react';
import { GlobeIcon, LinkIcon } from 'lucide-react';
import {
  ExpandableCard,
  ExpandableCardHeader,
  ExpandableCardDetails,
  useExpandableCard,
} from '@/components/ui/expandable-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CompanyRead } from '@/lib/schemas';
import { Separator } from '@/components/ui/separator';

type LinkIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface CompanyInfoCardProps {
  company: CompanyRead;
}

/** Displays company description, logo, and expandable details grid with specialties. */
export function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const hasLinks =
    !!company.website_url || (company.social_profiles?.length ?? 0) > 0;

  const hasExpandedContent =
    hasLinks ||
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
          {/* Links */}
          {hasLinks && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Links</p>
                <div className="flex flex-wrap gap-2">
                  {company.website_url && (
                    <LinkButton
                      href={company.website_url}
                      label="Website"
                      icon={GlobeIcon}
                    />
                  )}
                  {company.social_profiles?.map((p) => (
                    <LinkButton key={p.url} href={p.url} label={p.platform} />
                  ))}
                </div>
              </div>
            </>
          )}

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
              <DetailCell label="Employees" value={company.employee_count} />
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

function LinkButton({
  href,
  label,
  icon: Icon = LinkIcon,
}: {
  href: string;
  label: string;
  icon?: LinkIconComponent;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
      <Button variant="outline" size="sm" className="capitalize">
        <Icon />
        {label}
      </Button>
    </a>
  );
}
