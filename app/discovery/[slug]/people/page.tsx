'use client';

import { useMemo } from 'react';
import { useDiscoveryPeople } from './useDiscoveryPeople';
import { DiscoveryPeopleList } from '@/components/discovery/DiscoveryPeopleList';
import { DetailSidePanel } from '@/components/ui/detail-side-panel/DetailSidePanel';
import { EmployeeProfileDetail } from '@/components/discovery/EmployeeProfileDetail';
import { useListKeyboardNav } from '@/hooks/useListKeyboardNav';

export default function DiscoveryPeoplePage() {
  const {
    keyContacts, team, teamTotal, loading, error, loadingMore, loadMore,
    selectedEmployeeId, employee, employeeLoading, selectEmployee, clearSelection,
  } = useDiscoveryPeople();

  const allPeople = useMemo(
    () => [...keyContacts, ...team],
    [keyContacts, team],
  );

  const selectedPerson = useMemo(
    () => allPeople.find((p) => p.id === selectedEmployeeId) ?? null,
    [allPeople, selectedEmployeeId],
  );

  const { getItemRef } = useListKeyboardNav({
    items: allPeople,
    selectedItem: selectedPerson,
    getKey: (p) => p.id,
    onSelect: (p) => selectEmployee(p.id),
    enabled: !!selectedPerson,
  });

  return (
    <DetailSidePanel
      open={!!selectedEmployeeId}
      onClose={clearSelection}
      detail={<EmployeeProfileDetail employee={employee} isLoading={employeeLoading} />}
    >
      <DiscoveryPeopleList
        keyContacts={keyContacts}
        team={team}
        teamTotal={teamTotal}
        loading={loading}
        error={error}
        loadingMore={loadingMore}
        loadMore={loadMore}
        selectedEmployeeId={selectedEmployeeId}
        onPersonClick={(person) => selectEmployee(person.id)}
        getItemRef={getItemRef}
      />
    </DetailSidePanel>
  );
}
