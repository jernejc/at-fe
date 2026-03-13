'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignIcon } from '@/lib/config/campaign-icons';

interface CompanyDetailHeaderProps {
  /** Campaign slug for navigation links. */
  slug: string;
  /** Campaign icon name from the campaign-icons registry. */
  campaignIcon: string | null;
  /** Company display name. */
  companyName: string | null;
  /** Resolved company logo URL (handles base64 vs URL). */
  companyLogoUrl: string | null;
  /** Show skeleton while loading. */
  loading?: boolean;
}

/** Company detail header with campaign breadcrumb icon, company logo, and name. */
export function CompanyDetailHeader({
  slug,
  campaignIcon,
  companyName,
  companyLogoUrl,
  loading = false,
}: CompanyDetailHeaderProps) {
  if (loading) {
    return <CompanyDetailHeaderSkeleton />;
  }

  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center -ml-10">
          {/* Back to campaigns */}
          <Link href={`/partner/campaigns`} className="shrink-0 mx-1">
            <Button variant="ghost" size="icon-sm" aria-label="Back to campaign">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>

          {/* Campaign icon breadcrumb */}
          <Link
            href={`/partner/campaigns/${slug}/companies`}
            className="flex items-center justify-center shrink-0 w-16 h-16 rounded-xl bg-card hover:bg-muted transition-colors"
            aria-label="Go to campaign"
          >
            <CampaignIcon name={campaignIcon} className="size-7 text-foreground" />
          </Link>

          {/* Breadcrumb separator */}
          <ChevronLeft className="size-4 text-muted-foreground shrink-0 mx-1" />

          {/* Company logo */}
          <div className="flex items-center justify-center shrink-0 w-16 h-16 rounded-xl bg-card border border-border mr-4 overflow-hidden">
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt={companyName ?? ''}
                className="w-full h-full object-contain p-1.5"
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">
                {(companyName ?? '??').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            <span className="text-sm uppercase text-muted-foreground">
              Company
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-semibold tracking-tight text-foreground truncate">
              {companyName ?? 'Unknown Company'}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton placeholder while company data loads. */
function CompanyDetailHeaderSkeleton() {
  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center -ml-10">
          <Link href={`/partner/campaigns`} className="shrink-0 mx-1">
            <Button variant="ghost" size="icon-sm" aria-label="Back to campaign">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>
          <div className="w-16 h-16 rounded-xl bg-muted animate-pulse shrink-0" />
          <ChevronLeft className="size-4 text-muted-foreground shrink-0 mx-1" />
          <div className="w-16 h-16 rounded-xl bg-muted animate-pulse shrink-0 mr-4" />
          <div className="min-w-0 flex-1">
            <div className="w-20 h-4 bg-muted rounded animate-pulse" />
            <div className="w-64 h-9 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
