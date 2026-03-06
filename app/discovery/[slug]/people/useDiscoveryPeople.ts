'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { getCompanyEmployees } from '@/lib/api/companies';
import type { EmployeeSummary } from '@/lib/schemas';

/** Fetches and manages paginated people for the current discovery company. */
export function useDiscoveryPeople() {
  const { domain } = useDiscoveryDetail();

  const [keyContacts, setKeyContacts] = useState<EmployeeSummary[]>([]);
  const [team, setTeam] = useState<EmployeeSummary[]>([]);
  const [teamTotal, setTeamTotal] = useState(0);
  const [teamPage, setTeamPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const [dmRes, teamRes] = await Promise.all([
          getCompanyEmployees(domain, 1, 100, { is_decision_maker: true }),
          getCompanyEmployees(domain, 1, 20, { is_decision_maker: false }),
        ]);
        if (cancelled) return;
        setKeyContacts(dmRes.items);
        setTeam(teamRes.items);
        setTeamTotal(teamRes.total);
        setTeamPage(1);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load people');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [domain]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = teamPage + 1;
      const res = await getCompanyEmployees(domain, nextPage, 20, { is_decision_maker: false });
      setTeam(prev => [...prev, ...res.items]);
      setTeamPage(nextPage);
    } catch {
      // Silently fail load-more — user can retry
    } finally {
      setLoadingMore(false);
    }
  }, [domain, teamPage, loadingMore]);

  return { keyContacts, team, teamTotal, loading, error, loadingMore, loadMore };
}
