'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { getCompany, getCampaignCompany } from '@/lib/api';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import { getCompanyExplainability } from '@/lib/api/companies';
import { useCampaignDetail } from './CampaignDetailProvider';
import type { CompanyRead, CampaignCompanyRead, FitScore, CompanyExplainabilityResponse } from '@/lib/schemas';

interface CampaignCompanyDetailContextValue {
  /** Full company details. */
  company: CompanyRead | null;
  /** Campaign membership data for this company. */
  membership: CampaignCompanyRead | null;
  /** Whether company + membership are still loading. */
  loading: boolean;
  /** Error from the initial company + membership fetch. */
  error: string | null;
  /** Product fit breakdown (lazy-loaded). */
  breakdown: FitScore | null;
  /** Company explainability data (lazy-loaded). */
  explainability: CompanyExplainabilityResponse | null;
  /** Whether product fit data is loading. */
  productFitLoading: boolean;
  /** Error from the product fit fetch. */
  productFitError: string | null;
  /** Fetch product fit data if not already loaded. No-ops on subsequent calls. */
  ensureProductFit: () => void;
}

const CampaignCompanyDetailContext = createContext<CampaignCompanyDetailContextValue | null>(null);

interface CampaignCompanyDetailProviderProps {
  slug: string;
  domain: string;
  children: ReactNode;
}

/** Caches company + campaign membership eagerly and product fit data lazily across tab switches. */
export function CampaignCompanyDetailProvider({ slug, domain, children }: CampaignCompanyDetailProviderProps) {
  const { campaign, loading: campaignLoading } = useCampaignDetail();

  // Eager state: company + membership
  const [company, setCompany] = useState<CompanyRead | null>(null);
  const [membership, setMembership] = useState<CampaignCompanyRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lazy state: product fit
  const [breakdown, setBreakdown] = useState<FitScore | null>(null);
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
  const [productFitLoading, setProductFitLoading] = useState(false);
  const [productFitError, setProductFitError] = useState<string | null>(null);
  const productFitFetched = useRef(false);

  // Fetch company + membership on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchCore() {
      setLoading(true);
      setError(null);
      try {
        const [companyData, membershipData] = await Promise.all([
          getCompany(domain),
          getCampaignCompany(slug, domain),
        ]);
        if (cancelled) return;
        setCompany(companyData.company);
        setMembership(membershipData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load company');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCore();
    return () => { cancelled = true; };
  }, [slug, domain]);

  // Lazy fetch for product fit data — called by product-fit tab on first visit
  const ensureProductFit = useCallback(() => {
    if (productFitFetched.current || campaignLoading) return;

    const productId = campaign?.target_product_id;
    if (!productId) {
      setProductFitLoading(false);
      setProductFitError('No target product configured for this campaign.');
      productFitFetched.current = true;
      return;
    }

    productFitFetched.current = true;
    let cancelled = false;

    async function fetchProductFit() {
      setProductFitLoading(true);
      setProductFitError(null);

      const [breakdownResult, explainabilityResult] = await Promise.allSettled([
        getFitBreakdown(domain, productId!),
        getCompanyExplainability(domain),
      ]);

      if (cancelled) return;

      if (breakdownResult.status === 'fulfilled') {
        setBreakdown(breakdownResult.value);
      }
      if (explainabilityResult.status === 'fulfilled') {
        setExplainability(explainabilityResult.value);
      }
      if (breakdownResult.status === 'rejected' && explainabilityResult.status === 'rejected') {
        setProductFitError('Failed to load product fit data.');
      }

      setProductFitLoading(false);
    }

    fetchProductFit();
    return () => { cancelled = true; };
  }, [domain, campaign?.target_product_id, campaignLoading]);

  return (
    <CampaignCompanyDetailContext.Provider
      value={{
        company,
        membership,
        loading,
        error,
        breakdown,
        explainability,
        productFitLoading,
        productFitError,
        ensureProductFit,
      }}
    >
      {children}
    </CampaignCompanyDetailContext.Provider>
  );
}

/** Access cached company + product fit data from the nearest CampaignCompanyDetailProvider. */
export function useCampaignCompanyDetail() {
  const context = useContext(CampaignCompanyDetailContext);
  if (!context) {
    throw new Error('useCampaignCompanyDetail must be used within a CampaignCompanyDetailProvider');
  }
  return context;
}
