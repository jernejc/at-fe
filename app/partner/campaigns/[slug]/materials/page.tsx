'use client';

import { FileText } from 'lucide-react';

export default function PartnerCampaignMaterialsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <FileText className="size-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">No campaign level materials</p>
    </div>
  );
}
