'use client';

import { useState, useEffect, useRef } from 'react';
import { getPartnerAssignedCompanies } from '@/lib/api';
import { isNewOpportunity } from '@/lib/utils';
import type { CampaignSummary, PartnerCompanyAssignmentWithCompany, CompanyRowData } from '@/lib/schemas';

/** A new opportunity item combining the assignment with its parent campaign info. */
export interface NewOpportunityItem {
  assignment: PartnerCompanyAssignmentWithCompany;
  campaignSlug: string;
  campaignName: string;
}

/** Convert a partner company assignment to CompanyRowData with status 'new'. */
export function mapAssignmentToCompanyRow(item: NewOpportunityItem): CompanyRowData {
  const { assignment } = item;
  return {
    id: assignment.company_id,
    name: assignment.company.name,
    domain: assignment.company.domain,
    logo_url: assignment.company.logo_url,
    logo_base64: assignment.company.logo_base64,
    status: 'new',
    hq_country: assignment.company.hq_country,
    employee_count: assignment.company.employee_count,
    assigned_at: assignment.assigned_at,
  };
}

/** Fetches new opportunity assignments across all campaigns for the given partner. */
export function useNewOpportunities(campaigns: CampaignSummary[], partnerId: number | undefined): {
  newOpportunities: NewOpportunityItem[];
  newOpportunitiesLoading: boolean;
} {
  const [items, setItems] = useState<NewOpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Stable key so the effect only re-runs when campaign IDs actually change,
  // not on every array reference change from setCampaigns().
  const campaignKey = campaigns.map((c) => c.id).join(',');
  const campaignsRef = useRef(campaigns);
  useEffect(() => { campaignsRef.current = campaigns; });

  useEffect(() => {
    const currentCampaigns = campaignsRef.current;
    if (!partnerId || currentCampaigns.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state on empty input
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      currentCampaigns.map(async (campaign) => {
        try {
          const companies = await getPartnerAssignedCompanies(campaign.slug, partnerId);
          return companies
            .filter(isNewOpportunity)
            .map<NewOpportunityItem>((assignment) => ({
              assignment,
              campaignSlug: campaign.slug,
              campaignName: campaign.name,
            }));
        } catch (e) {
          console.error(`Failed to fetch companies for ${campaign.slug}:`, e);
          return [];
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setItems(results.flat());
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [campaignKey, partnerId]);

  return { newOpportunities: items, newOpportunitiesLoading: loading };
}
