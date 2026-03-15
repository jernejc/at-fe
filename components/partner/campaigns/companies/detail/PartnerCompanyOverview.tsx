'use client';

import { useState } from 'react';
import { AlertCircle, Globe, Mail, Phone } from 'lucide-react';
import { LinkedinIcon } from '@/components/ui/icons/linkedin-icon';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CompanyStatus, type CompanyStatusValue } from '@/components/ui/company-status';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { getCompanyStatusLabel } from '@/lib/utils';
import { usePartnerCompanyOverview } from './usePartnerCompanyOverview';

/** Partner company overview — campaign cells + company details (mirrors discovery overview). */
export function PartnerCompanyOverview() {
  const {
    company,
    campaignName,
    campaignIcon,
    productName,
    fitScore,
    status,
    isNew,
    loading,
    error,
  } = usePartnerCompanyOverview();

  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const [showAllTech, setShowAllTech] = useState(false);

  if (loading) return <OverviewSkeleton />;
  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <AlertCircle className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{error ?? 'Company not found'}</p>
      </div>
    );
  }

  const hq = [company.hq_city, company.hq_state].filter(Boolean).join(', ');
  const linkedinUrl = company.linkedin_id
    ? `https://linkedin.com/company/${company.linkedin_id}`
    : company.social_profiles?.find((p) => p.platform === 'linkedin')?.url ?? null;
  const websiteHref = company.website_url?.startsWith('http')
    ? company.website_url
    : company.website_url ? `https://${company.website_url}` : null;
  const hasRatings = company.rating_overall != null;

  return (
    <div className="space-y-10">
      {/* Campaign-specific cells */}
      <section>
        <Dashboard>
          <CampaignCell
            campaignName={campaignName}
            productName={productName}
            campaignIcon={campaignIcon}
          />
          <FitScoreCell fitScore={fitScore} />
          <StatusCell status={status} isNew={isNew} />
        </Dashboard>
      </section>

      {/* Company Details */}
      <section>
        <h3 className='text-lg font-semibold text-foreground mb-4'>Company info</h3>
        <Dashboard>
          {company.industry && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Industry</DashboardCellTitle>
              <DashboardCellBody size="sm">{company.industry}</DashboardCellBody>
            </DashboardCell>
          )}
          {company.company_type && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Type</DashboardCellTitle>
              <DashboardCellBody size="sm">{company.company_type}</DashboardCellBody>
            </DashboardCell>
          )}
          {(company.employee_count || company.employee_count_range) && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Size</DashboardCellTitle>
              <DashboardCellBody size="sm">
                {company.employee_count ? `${company.employee_count.toLocaleString()} employees` : company.employee_count_range}
              </DashboardCellBody>
            </DashboardCell>
          )}
          {company.revenue && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Revenue</DashboardCellTitle>
              <DashboardCellBody size="sm">{company.revenue}</DashboardCellBody>
            </DashboardCell>
          )}
          {hq && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Headquarters</DashboardCellTitle>
              <DashboardCellBody size="sm">{hq}</DashboardCellBody>
            </DashboardCell>
          )}
          {company.hq_country && company.hq_country !== 'Other' && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Country</DashboardCellTitle>
              <DashboardCellBody size="sm">{company.hq_country}</DashboardCellBody>
            </DashboardCell>
          )}
          {company.founded_year && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Founded</DashboardCellTitle>
              <DashboardCellBody size="sm">{company.founded_year}</DashboardCellBody>
            </DashboardCell>
          )}
          {company.ticker && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Stock</DashboardCellTitle>
              <DashboardCellBody size="sm">{company.ticker}</DashboardCellBody>
            </DashboardCell>
          )}
          {(websiteHref || linkedinUrl) && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Links</DashboardCellTitle>
              <div className="mt-2 space-y-1.5">
                {websiteHref && (
                  <a href={websiteHref} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-sm text-primary hover:underline truncate">
                    <Globe className="size-3.5 shrink-0" />
                    {company.website_url}
                  </a>
                )}
                {linkedinUrl && (
                  <a href={linkedinUrl} target="_blank" rel="noopener" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <LinkedinIcon className="size-3.5 shrink-0" />
                    LinkedIn
                  </a>
                )}
              </div>
            </DashboardCell>
          )}
          {company.emails?.length > 0 && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Email</DashboardCellTitle>
              <div className="mt-2 space-y-1">
                {company.emails.map((email, i) => (
                  <a key={i} href={`mailto:${email}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline truncate">
                    <Mail className="size-3.5 shrink-0" />
                    {email}
                  </a>
                ))}
              </div>
            </DashboardCell>
          )}
          {company.phones?.length > 0 && (
            <DashboardCell size="quarter" height="auto">
              <DashboardCellTitle>Phone</DashboardCellTitle>
              <div className="mt-2 space-y-1">
                {company.phones.map((phone, i) => (
                  <a key={i} href={`tel:${phone}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                    <Phone className="size-3.5 shrink-0" />
                    {phone}
                  </a>
                ))}
              </div>
            </DashboardCell>
          )}
        </Dashboard>
      </section>

      {/* About */}
      {company.description && (
        <section className="max-w-4xl">
          <h3 className="text-base font-medium text-foreground mb-3">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
        </section>
      )}

      {/* Specialties */}
      {company.specialties?.length > 0 && (
        <section>
          <h3 className="text-base font-medium text-foreground mb-3">
            Specialties <span className="text-muted-foreground font-normal">({company.specialties.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {(showAllSpecialties ? company.specialties : company.specialties.slice(0, 20)).map((s, i) => (
              <Badge key={i} variant="grey">{s}</Badge>
            ))}
            {company.specialties.length > 20 && (
              <button
                type="button"
                onClick={() => setShowAllSpecialties((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                {showAllSpecialties ? 'Show less' : `+${company.specialties.length - 20} more`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Tech Stack */}
      {company.technologies?.length > 0 && (
        <section>
          <h3 className="text-base font-medium text-foreground mb-3">
            Tech Stack <span className="text-muted-foreground font-normal">({company.technologies.length})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {(showAllTech ? company.technologies : company.technologies.slice(0, 20)).map((t, i) => (
              <Badge key={i} variant="blue">{t.technology}</Badge>
            ))}
            {company.technologies.length > 20 && (
              <button
                type="button"
                onClick={() => setShowAllTech((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
              >
                {showAllTech ? 'Show less' : `+${company.technologies.length - 20} more`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Employee Ratings */}
      {hasRatings && (
        <section>
          <h3 className="text-base font-medium text-foreground mb-3">
            Employee Ratings
            {company.reviews_count && (
              <span className="text-muted-foreground font-normal"> ({company.reviews_count.toLocaleString()} reviews)</span>
            )}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            <RatingRow label="Overall" value={company.rating_overall} />
            <RatingRow label="Culture" value={company.rating_culture} />
            <RatingRow label="Compensation" value={company.rating_compensation} />
            <RatingRow label="Work-Life" value={company.rating_work_life} />
            <RatingRow label="Career" value={company.rating_career} />
            <RatingRow label="Management" value={company.rating_management} />
          </div>
        </section>
      )}
    </div>
  );
}

/** Half-width cell showing campaign name, product name, and campaign icon. */
function CampaignCell({
  campaignName,
  productName,
  campaignIcon,
}: {
  campaignName: string | null;
  productName: string | null;
  campaignIcon: string | null;
}) {
  return (
    <DashboardCell size="half" height="auto">
      <DashboardCellTitle>Campaign</DashboardCellTitle>
      <DashboardCellBody size="sm">
        <div className='flex gap-4'>
          <div className="flex flex-col items-center justify-center gap-1.5 shrink-0 w-16 h-16 rounded-xl bg-background">
            <CampaignIcon
              name={campaignIcon}
              className="size-9 text-foreground"
            />
          </div>
          <div>
            <div>{campaignName ?? '--'}</div>
            <p className="text-sm text-muted-foreground mt-1">{productName}</p>
          </div>
        </div>
      </DashboardCellBody>
    </DashboardCell>
  );
}

/** Quarter-width cell showing the product fit score. */
function FitScoreCell({ fitScore }: { fitScore: number | null }) {
  return (
    <DashboardCell size="quarter">
      <DashboardCellTitle>Product Fit</DashboardCellTitle>
      <DashboardCellBody className="flex items-center gap-3">
        {fitScore != null ? (
          <>
            <FitScoreIndicator score={fitScore} showValue={false} showChange={false} size={32} />
            <span>{fitScore}%</span>
          </>
        ) : (
          <span>--</span>
        )}
      </DashboardCellBody>
    </DashboardCell>
  );
}

/** Quarter-width cell showing company status with optional "New" badge. */
function StatusCell({
  status,
  isNew,
}: {
  status: CompanyStatusValue;
  isNew: boolean;
}) {
  return (
    <DashboardCell size="quarter">
      <div>
        <DashboardCellTitle>Status</DashboardCellTitle>
        {isNew && (
          <Badge variant="yellow" size="sm" className="mt-1">New</Badge>
        )}
      </div>
      <DashboardCellBody className="flex items-center gap-3">
        <CompanyStatus status={status} size={32} />
        <span>{getCompanyStatusLabel(status)}</span>
      </DashboardCellBody>
    </DashboardCell>
  );
}

function RatingRow({ label, value }: { label: string; value: number | null | undefined }) {
  if (value == null) return null;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      </div>
      <Progress value={value} max={5} className="h-1.5" />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-10">
      {/* Campaign-specific cells skeleton */}
      <section>
        <Dashboard>
          <DashboardCell size="half" height="auto">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="flex gap-4 mt-3">
              <div className="w-16 h-16 rounded-xl bg-muted animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </DashboardCell>
          <DashboardCell size="quarter">
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="flex items-center gap-3 mt-auto">
              <div className="size-8 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-12 rounded bg-muted animate-pulse" />
            </div>
          </DashboardCell>
          <DashboardCell size="quarter">
            <div className="h-4 w-14 rounded bg-muted animate-pulse" />
            <div className="flex items-center gap-3 mt-auto">
              <div className="size-8 rounded-full bg-muted animate-pulse" />
              <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            </div>
          </DashboardCell>
        </Dashboard>
      </section>

      {/* Company info skeleton */}
      <section>
        <div className="h-5 w-28 rounded bg-muted animate-pulse mb-4" />
        <Dashboard>
          {Array.from({ length: 8 }).map((_, i) => (
            <DashboardCell key={i} size="quarter" height="auto">
              <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
              <div className="h-4 w-24 rounded bg-muted animate-pulse mt-2" />
            </DashboardCell>
          ))}
        </Dashboard>
      </section>
    </div>
  );
}
