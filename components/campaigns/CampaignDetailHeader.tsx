'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { StatusIndicator } from '@/components/ui/status-indicator';

interface CampaignDetailHeaderProps {
  campaignName: string | null;
  campaignIcon: string | null;
  campaignStatus: string | null;
  productName: string | null;
  loading?: boolean;
}

/** Campaign detail page header with back button, icon, name, and product label. */
export function CampaignDetailHeader({
  campaignName,
  campaignIcon,
  campaignStatus,
  productName,
  loading = false,
}: CampaignDetailHeaderProps) {
  if (loading) {
    return <CampaignDetailHeaderSkeleton />;
  }

  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center -ml-10">
          {/* Back button */}
          <Link href="/campaigns" className="shrink-0 mx-1">
            <Button variant="ghost" size="icon-sm" aria-label="Back to campaigns">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>

          {/* Campaign icon + status dot */}
          <div className="flex flex-col items-center justify-center mr-4 gap-1.5 shrink-0 w-16 h-16 rounded-xl bg-card">
            <CampaignIcon
              name={campaignIcon}
              className="size-9 text-foreground"
            />
            <StatusIndicator
              status={campaignStatus ?? 'draft'}
              size={8}
            />
          </div>

          {/* Text content */}
          <div className="min-w-0 flex-1">
            {/* Label row: CAMPAIGN + product name */}
            <div className="flex items-center gap-4">
              <span className="text-sm uppercase text-muted-foreground">
                Campaign
              </span>
              {productName && (
                <span className="text-sm text-muted-foreground truncate">
                  {productName}
                </span>
              )}
            </div>

            {/* Campaign name */}
            <h1 className="text-4xl font-display leading-12 font-medium tracking-tight text-foreground truncate">
              {campaignName ?? 'Untitled Campaign'}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton placeholder while campaign data loads. */
function CampaignDetailHeaderSkeleton() {
  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center -ml-10 mb-1">
          {/* Back button */}
          <Link href="/campaigns" className="shrink-0 mx-1">
            <Button variant="ghost" size="icon-sm" aria-label="Back to campaigns">
              <ChevronLeft className="size-5" />
            </Button>
          </Link>

          {/* Icon + status dot placeholder */}
          <div className="flex flex-col items-center justify-center mr-4 gap-1.5 shrink-0 w-16 h-16 rounded-xl bg-muted animate-pulse" />

          {/* Text content placeholder */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-20 h-4 bg-muted rounded animate-pulse" />
              <div className="w-36 h-4 bg-muted rounded animate-pulse" />
            </div>
            <div className="w-96 h-10 bg-muted rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
