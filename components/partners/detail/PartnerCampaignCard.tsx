'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { ExpandableCard, ExpandableCardHeader, ExpandableCardDetails } from '@/components/ui/expandable-card';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { Separator } from '@/components/ui/separator';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { usePartnerCampaignCompanies } from './usePartnerCampaignCompanies';
import type { CampaignAssignmentSummary } from '@/lib/schemas';

interface PartnerCampaignCardProps {
  campaign: CampaignAssignmentSummary;
  partnerId: number;
}

/** Expandable card for a single campaign showing partner's assigned companies on expand. */
export function PartnerCampaignCard({ campaign, partnerId }: PartnerCampaignCardProps) {
  const [expanded, setExpanded] = useState(false);

  const { companies, loading } = usePartnerCampaignCompanies({
    slug: campaign.campaign_slug,
    partnerId,
    enabled: expanded,
  });

  const handleExpandedChange = useCallback((isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

  return (
    <ExpandableCard expanded={expanded} onExpandedChange={handleExpandedChange}>
      <ExpandableCardHeader>
        <div className="flex items-center gap-3">
          <CampaignIcon name={campaign.campaign_icon} className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-foreground truncate">{campaign.campaign_name}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assigned {format(new Date(campaign.assigned_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
      </ExpandableCardHeader>

      <ExpandableCardDetails>
        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 3 }, (_, i) => (
              <CompanyRowSkeleton key={i} hideStatus visibleMetrics={['fit', 'location', 'size']} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No companies assigned in this campaign.
          </p>
        ) : (
          <div className="flex flex-col">
            {companies.map((company, i) => (
              <div key={company.id}>
                {i > 0 && <Separator />}
                <CompanyRow
                  company={company}
                  hideStatus
                  visibleMetrics={['fit', 'location', 'size']}
                  className="-mx-6"
                />
              </div>
            ))}
          </div>
        )}
      </ExpandableCardDetails>
    </ExpandableCard>
  );
}
