/** Skeleton placeholder for the navigation bar while the auth session loads. */
export function NavSkeleton() {
  return (
    <nav
      aria-hidden="true"
      className="bg-background h-24 shrink-0 z-20 sticky top-0 border-b-[0.5px] border-border-d"
    >
      {/* Row 1: Logo area + action area */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-muted rounded animate-pulse" />
          <div className="w-[110px] h-5 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        </div>
      </div>

      {/* Row 2: Tab bar area */}
      <div className="px-5">
        <div className="flex items-end" style={{ gap: 30 }}>
          <div className="w-[72px] h-4 bg-muted rounded animate-pulse mb-2.5" />
          <div className="w-[56px] h-4 bg-muted rounded animate-pulse mb-2.5" />
          <div className="w-[68px] h-4 bg-muted rounded animate-pulse mb-2.5" />
        </div>
      </div>
    </nav>
  );
}
