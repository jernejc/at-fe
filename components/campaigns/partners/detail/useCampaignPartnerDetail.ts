'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPartnerAssignedCompanies,
  bulkAssignCompaniesToPartner,
  unassignCompanyFromPartner,
} from '@/lib/api/partners';
import { toast } from 'sonner';
import { deriveCompanyStatus } from '@/lib/utils';
import type { CompanyRowData } from '@/lib/schemas';
import type { PartnerCompanyAssignmentWithCompany } from '@/lib/schemas';

/** Maps a partner-company assignment to CompanyRowData for reuse in CompanyRow. */
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

interface UseCampaignPartnerDetailOptions {
  slug: string;
  partnerId: number;
  isOpen: boolean;
}

interface UseCampaignPartnerDetailReturn {
  /** Companies assigned to this partner, mapped for CompanyRow. */
  companies: CompanyRowData[];
  loading: boolean;
  /** Whether a reassign operation is in progress. */
  reassigning: boolean;
  /** Reassign selected companies to a different partner. */
  reassignCompanies: (companyIds: number[], newPartnerId: number) => Promise<void>;
  /** Re-fetch the assigned companies. */
  refetch: () => void;
}

/** Fetches companies assigned to a partner and provides reassignment. */
export function useCampaignPartnerDetail({
  slug,
  partnerId,
  isOpen,
}: UseCampaignPartnerDetailOptions): UseCampaignPartnerDetailReturn {
  const [companies, setCompanies] = useState<CompanyRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);
  const [fetchVersion, setFetchVersion] = useState(0);
  const refetch = useCallback(() => setFetchVersion((v) => v + 1), []);

  useEffect(() => {
    if (!isOpen || !slug || !partnerId) {
      setCompanies([]);
      return;
    }

    let cancelled = false;
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const data = await getPartnerAssignedCompanies(slug, partnerId);
        if (!cancelled) setCompanies(data.map(toCompanyRowData));
      } catch {
        if (!cancelled) setCompanies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCompanies();
    return () => { cancelled = true; };
  }, [slug, partnerId, isOpen, fetchVersion]);

  const reassignCompanies = useCallback(async (companyIds: number[], newPartnerId: number) => {
    if (companyIds.length === 0) return;
    setReassigning(true);
    try {
      // Unassign from current partner
      await Promise.allSettled(
        companyIds.map((cid) => unassignCompanyFromPartner(slug, partnerId, cid)),
      );
      // Assign to new partner
      await bulkAssignCompaniesToPartner(slug, newPartnerId, companyIds);
      toast.success(`Reassigned ${companyIds.length} ${companyIds.length === 1 ? 'company' : 'companies'}`);
      refetch();
    } catch (error) {
      console.error('Reassign failed:', error);
      toast.error('Failed to reassign companies');
    } finally {
      setReassigning(false);
    }
  }, [slug, partnerId, refetch]);

  return { companies, loading, reassigning, reassignCompanies, refetch };
}
