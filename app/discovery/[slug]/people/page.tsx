'use client';

import { useDiscoveryPeople } from './useDiscoveryPeople';
import { DiscoveryPeopleList } from '@/components/discovery/DiscoveryPeopleList';

export default function DiscoveryPeoplePage() {
  const peopleData = useDiscoveryPeople();
  return <DiscoveryPeopleList {...peopleData} />;
}
