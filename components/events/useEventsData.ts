import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCampaigns, getCampaignCompanies } from '@/lib/api';
import { resolveCoordinates } from '@/lib/geo';
import { GEMINI_ENTERPRISE_COMPANIES } from '@/data/gemini-enterprise-companies';
import type { CampaignSummary, MembershipRead, PaginatedResponse } from '@/lib/schemas';
import type { EventCompanyMarker } from './EventsMap';

const DEFAULT_CAMPAIGN_SLUG = 'top-400-gemini-enterprise';

const defaultMarkers: EventCompanyMarker[] = GEMINI_ENTERPRISE_COMPANIES.map((c) => ({
  domain: c.domain,
  name: c.name,
  position: { lat: c.lat, lng: c.lng },
  contactName: c.contactName,
  contactTitle: c.contactTitle,
  contactLinkedIn: c.contactLinkedIn,
}));

export function useEventsData() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(DEFAULT_CAMPAIGN_SLUG);

  const [campaignMarkers, setCampaignMarkers] = useState<EventCompanyMarker[] | null>(null);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [totalCompanies, setTotalCompanies] = useState(GEMINI_ENTERPRISE_COMPANIES.length);
  const [loadedCompanies, setLoadedCompanies] = useState(GEMINI_ENTERPRISE_COMPANIES.length);

  useEffect(() => {
    let cancelled = false;
    setCampaignsLoading(true);

    getCampaigns({ page_size: 100, sort_by: 'updated_at', sort_order: 'desc' })
      .then((res) => {
        if (!cancelled) setCampaigns(res.items);
      })
      .catch((err) => console.error('Failed to load campaigns:', err))
      .finally(() => { if (!cancelled) setCampaignsLoading(false); });

    return () => { cancelled = true; };
  }, []);

  const loadCompanies = useCallback(async (slug: string) => {
    setCompaniesLoading(true);
    setCampaignMarkers(null);
    setTotalCompanies(0);
    setLoadedCompanies(0);

    try {
      const allCompanies: MembershipRead[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const res: PaginatedResponse<MembershipRead> = await getCampaignCompanies(slug, {
          page,
          page_size: 200,
        });
        allCompanies.push(...res.items);
        setTotalCompanies(res.total);
        setLoadedCompanies(allCompanies.length);
        hasNext = res.has_next;
        page++;
      }

      const markers: EventCompanyMarker[] = [];
      for (const c of allCompanies) {
        const position = resolveCoordinates(null, c.hq_country);
        if (position) {
          markers.push({
            domain: c.domain,
            name: c.company_name ?? c.domain,
            position,
          });
        }
      }
      setCampaignMarkers(markers);
    } catch (err) {
      console.error('Failed to load campaign companies:', err);
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const selectCampaign = useCallback((slug: string | null) => {
    setSelectedSlug(slug);
    if (slug && slug !== DEFAULT_CAMPAIGN_SLUG) {
      loadCompanies(slug);
    } else {
      setCampaignMarkers(null);
      setTotalCompanies(GEMINI_ENTERPRISE_COMPANIES.length);
      setLoadedCompanies(GEMINI_ENTERPRISE_COMPANIES.length);
    }
  }, [loadCompanies]);

  const isDefault = selectedSlug === DEFAULT_CAMPAIGN_SLUG;
  const companyMarkers = isDefault ? defaultMarkers : (campaignMarkers ?? []);

  const selectedCampaign = useMemo(() => {
    if (isDefault) {
      return { name: 'Top 400 Gemini Enterprise', slug: DEFAULT_CAMPAIGN_SLUG } as CampaignSummary;
    }
    return campaigns.find((c) => c.slug === selectedSlug) ?? null;
  }, [campaigns, selectedSlug, isDefault]);

  return {
    campaigns,
    campaignsLoading,
    selectedSlug,
    selectedCampaign,
    selectCampaign,
    companyMarkers,
    companiesLoading,
    totalCompanies,
    loadedCompanies,
  };
}
