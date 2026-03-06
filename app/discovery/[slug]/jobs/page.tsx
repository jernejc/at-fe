'use client';

import { useDiscoveryJobs } from './useDiscoveryJobs';
import { DiscoveryJobsList } from '@/components/discovery/DiscoveryJobsList';

export default function DiscoveryJobsPage() {
  const jobsData = useDiscoveryJobs();
  return <DiscoveryJobsList {...jobsData} />;
}
