'use client';

import { LayoutDashboard } from 'lucide-react';

/** Company overview page — placeholder until feature is built out. */
export default function CompanyOverviewPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <LayoutDashboard className="size-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">Overview</p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}
