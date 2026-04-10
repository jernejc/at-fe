'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { CampaignExportDropdown } from '@/components/campaigns/CampaignExportDropdown';

interface CampaignDetailHeaderProps {
  campaignName: string | null;
  campaignIcon: string | null;
  campaignStatus: string | null;
  productName: string | null;
  loading?: boolean;
  /** Campaign slug — needed for the export dropdown. */
  slug?: string | null;
  /** Which export targets to show in the export dropdown. Defaults to ['companies']. */
  exportActions?: ('companies' | 'contacts')[];
  /** Whether to render the Import button (partner pages only). */
  showImport?: boolean;
}

/** Campaign detail page header with back button, icon, name, product label, and actions. */
export function CampaignDetailHeader({
  campaignName,
  campaignIcon,
  campaignStatus,
  productName,
  loading = false,
  slug,
  exportActions = ['companies', 'contacts'],
  showImport = false,
}: CampaignDetailHeaderProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  if (loading) {
    return <CampaignDetailHeaderSkeleton />;
  }

  return (
    <div className="bg-background">
      <div className="max-w-[1600px] mx-auto px-10 pt-7 pb-4">
        <div className="flex items-center justify-between -ml-10">
          <div className="flex items-center min-w-0 flex-1">
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
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-semibold tracking-tight text-foreground">
                {campaignName ?? 'Untitled Campaign'}
              </h1>
            </div>
          </div>

          {/* Right-aligned actions */}
          {slug && (
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {showImport && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => importInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1.5" />
                    Import
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    className="hidden"
                    onChange={() => { }}
                  />
                </>
              )}
              <CampaignExportDropdown slug={slug} actions={exportActions} variant="secondary" />
            </div>
          )}
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
