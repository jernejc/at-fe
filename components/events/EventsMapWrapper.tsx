import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

export const EventsMapWrapper = dynamic(
  () => import('./EventsMap').then((mod) => mod.EventsMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);
