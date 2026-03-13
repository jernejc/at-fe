'use client';

import { BookOpen } from 'lucide-react';

/** Playbook page — placeholder until feature is built out. */
export default function CompanyPlaybookPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <BookOpen className="size-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">Playbook</p>
      <p className="text-sm text-muted-foreground">Coming soon</p>
    </div>
  );
}
