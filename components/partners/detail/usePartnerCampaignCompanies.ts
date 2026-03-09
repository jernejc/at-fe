'use client';

import { useState, useEffect, useRef } from 'react';
import { getPartnerAssignedCompanies } from '@/lib/api/partners';
import { deriveCompanyStatus } from '@/lib/utils';
import type { CompanyRowData, PartnerCompanyAssignmentWithCompany } from '@/lib/schemas';

/** Maps a partner-company assignment to CompanyRowData for use in CompanyRow. */
function toCompanyRowData(a: PartnerCompanyAssignmentWithCompany): CompanyRowData {
  const c = a.company;
  return {
    id: a.company_id,
    name: c.name,
    domain: c.domain,
    logo_url: c.logo_url,
    logo_base64: c.logo_base64,
    status: deriveCompanyStatus({ status: a.status, assignedAt: a.assigned_at }),
    fit_score: c.rating_overall,
    hq_country: c.hq_country,
    employee_count: c.employee_count,
    assigned_at: a.assigned_at,
  };
}

interface UsePartnerCampaignCompaniesOptions {
  slug: string;
  partnerId: number;
  /** Only fetch when enabled (on card expand). */
  enabled: boolean;
}

/** Lazily fetches companies assigned to a partner in a specific campaign. */
export function usePartnerCampaignCompanies({ slug, partnerId, enabled }: UsePartnerCampaignCompaniesOptions) {
  const [companies, setCompanies] = useState<CompanyRowData[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedRef = useRef(false);
  const prevSlugRef = useRef(slug);
  const prevPartnerIdRef = useRef(partnerId);

  // Reset fetch state when inputs change so re-expanding fetches fresh data
  if (prevSlugRef.current !== slug || prevPartnerIdRef.current !== partnerId) {
    fetchedRef.current = false;
    prevSlugRef.current = slug;
    prevPartnerIdRef.current = partnerId;
  }

  useEffect(() => {
    if (!enabled || fetchedRef.current || !slug || !partnerId) return;

    let cancelled = false;
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const data = await getPartnerAssignedCompanies(slug, partnerId);
        if (!cancelled) {
          setCompanies(data.map(toCompanyRowData));
          fetchedRef.current = true;
        }
      } catch {
        if (!cancelled) setCompanies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCompanies();
    return () => { cancelled = true; };
  }, [slug, partnerId, enabled]);

  return { companies, loading };
}
