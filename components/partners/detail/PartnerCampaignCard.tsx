'use client';

import { useState, useCallback } from 'react';
import { ExpandableCard, ExpandableCardHeader, ExpandableCardDetails } from '@/components/ui/expandable-card';
import { Badge } from '@/components/ui/badge';
import { CompanyRow, CompanyRowSkeleton } from '@/components/campaigns/CompanyRow';
import { Separator } from '@/components/ui/separator';
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
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-foreground truncate">{campaign.campaign_name}</h4>
          {campaign.role_in_campaign && (
            <Badge variant="grey" className="text-xs shrink-0 capitalize">
              {campaign.role_in_campaign}
            </Badge>
          )}
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
