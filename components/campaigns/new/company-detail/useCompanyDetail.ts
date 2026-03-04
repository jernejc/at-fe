'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCompany, getCompanyExplainability } from '@/lib/api/companies';
import { getFitBreakdown } from '@/lib/api/fit-scores';
import type { CompanyRead, CompanyExplainabilityResponse, FitScore } from '@/lib/schemas';

interface UseCompanyDetailReturn {
  company: CompanyRead | null;
  explainability: CompanyExplainabilityResponse | null;
  fitBreakdown: FitScore | null;
  loading: boolean;
}

/** Lightweight company detail hook for the results view (no campaign context). */
export function useCompanyDetail(
  domain: string | null,
  productId: number | null,
): UseCompanyDetailReturn {
  const [company, setCompany] = useState<CompanyRead | null>(null);
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
  const [fitBreakdown, setFitBreakdown] = useState<FitScore | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setCompany(null);
    setExplainability(null);
    setFitBreakdown(null);
  }, []);

  useEffect(() => {
    if (!domain) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      reset();
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      getCompany(domain).then((r) => r.company),
      getCompanyExplainability(domain).catch(() => null),
      productId ? getFitBreakdown(domain, productId).catch(() => null) : Promise.resolve(null),
    ])
      .then(([comp, expl, fit]) => {
        if (cancelled) return;
        setCompany(comp);
        setExplainability(expl);
        setFitBreakdown(fit);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load company detail:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [domain, productId, reset]);

  return { company, explainability, fitBreakdown, loading };
}
