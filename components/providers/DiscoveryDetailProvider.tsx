'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getCompany } from '@/lib/api/companies';
import type { CompanyDetailResponse } from '@/lib/schemas';

interface DiscoveryDetailContextValue {
  /** Company domain used as the route slug. */
  domain: string;
  /** Full company detail response, or null while loading. */
  data: CompanyDetailResponse | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch company data. */
  refetch: () => void;
}

const DiscoveryDetailContext = createContext<DiscoveryDetailContextValue | null>(null);

interface DiscoveryDetailProviderProps {
  domain: string;
  children: ReactNode;
}

/** Fetches company details once and shares with all discovery detail tab pages via context. */
export function DiscoveryDetailProvider({ domain, children }: DiscoveryDetailProviderProps) {
  const [data, setData] = useState<CompanyDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCompany(domain);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company');
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DiscoveryDetailContext.Provider value={{ domain, data, loading, error, refetch: fetchData }}>
      {children}
    </DiscoveryDetailContext.Provider>
  );
}

/** Access company detail data from the nearest DiscoveryDetailProvider. */
export function useDiscoveryDetail() {
  const context = useContext(DiscoveryDetailContext);
  if (!context) {
    throw new Error('useDiscoveryDetail must be used within a DiscoveryDetailProvider');
  }
  return context;
}
