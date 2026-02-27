import { Skeleton } from '@/components/ui/skeleton';

/** Loading skeleton for the campaign company detail sidebar. */
export function CampaignCompanyDetailSkeleton() {
  return (
    <div className="space-y-3">
      {/* Assignment card skeleton */}
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>

      {/* Fit card skeleton */}
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="size-10 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Company info skeleton */}
      <div className="bg-card rounded-xl ring-1 ring-foreground/10 px-6 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="size-8 rounded-full" />
        </div>
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
