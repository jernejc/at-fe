'use client';

import { useState, useEffect } from 'react';
import { getCompany } from '@/lib/api';

interface UseCompanyDetailHeaderReturn {
  companyName: string | null;
  companyLogoUrl: string | null;
  loading: boolean;
  error: string | null;
}

/** Fetches minimal company data (name + logo) for the company detail header. */
export function useCompanyDetailHeader(domain: string): UseCompanyDetailHeaderReturn {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCompany() {
      setLoading(true);
      setError(null);
      try {
        const data = await getCompany(domain);
        if (cancelled) return;

        const company = data.company;
        setCompanyName(company.name);

        const logo = company.logo_base64
          ? company.logo_base64.startsWith('data:')
            ? company.logo_base64
            : `data:image/png;base64,${company.logo_base64}`
          : company.logo_url;
        setCompanyLogoUrl(logo);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load company');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCompany();
    return () => { cancelled = true; };
  }, [domain]);

  return { companyName, companyLogoUrl, loading, error };
}
