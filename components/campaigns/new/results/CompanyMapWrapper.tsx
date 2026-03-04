import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

/** Lazy-loaded map component — Leaflet requires the browser DOM. */
export const CompanyMapWrapper = dynamic(
  () => import('./CompanyMap').then((mod) => mod.CompanyMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-xl" />,
  },
);
