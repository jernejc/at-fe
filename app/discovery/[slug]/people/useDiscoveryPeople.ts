'use client';

import { useEffect } from 'react';
import { useDiscoveryDetail } from '@/components/providers/DiscoveryDetailProvider';
import { useEmployeeSelection } from '@/hooks/useEmployeeSelection';

/** Provides people data (key contacts + team) from cached provider data. */
export function useDiscoveryPeople() {
  const {
    keyContacts, team, teamTotal, peopleLoading, peopleError,
    ensurePeople, loadMoreTeam, teamLoadingMore,
  } = useDiscoveryDetail();

  const employeeSelection = useEmployeeSelection();

  useEffect(() => {
    ensurePeople();
  }, [ensurePeople]);

  return {
    keyContacts, team, teamTotal,
    loading: peopleLoading, error: peopleError,
    loadingMore: teamLoadingMore, loadMore: loadMoreTeam,
    ...employeeSelection,
  };
}
