'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCompany, getCompanyExplainability } from '@/lib/api/companies';
import type { CompanyRead, CompanyExplainabilityResponse } from '@/lib/schemas';

interface UseCompanyDetailReturn {
  company: CompanyRead | null;
  explainability: CompanyExplainabilityResponse | null;
  loading: boolean;
}

/** Lightweight company detail hook for the results view (no campaign context). */
export function useCompanyDetail(
  domain: string | null,
): UseCompanyDetailReturn {
  const [company, setCompany] = useState<CompanyRead | null>(null);
  const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = useCallback(() => {
    setCompany(null);
    setExplainability(null);
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
    ])
      .then(([comp, expl]) => {
        if (cancelled) return;
        setCompany(comp);
        setExplainability(expl);
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
  }, [domain, reset]);

  return { company, explainability, loading };
}
