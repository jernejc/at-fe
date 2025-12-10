'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AccountList, AccountDetail } from '@/components/accounts';
import { getStats, PRODUCT_GROUPS } from '@/lib/api';
import type { StatsResponse, CompanySummary } from '@/lib/schemas';
import { useEffect } from 'react';

export default function Dashboard() {
  const [selectedCompany, setSelectedCompany] = useState<CompanySummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleAccountClick = (company: CompanySummary) => {
    setSelectedCompany(company);
    setDetailOpen(true);
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      {/* Main Content - Full Height */}
      <main className="h-full">
        <AccountList
          productGroup="all"
          onAccountClick={handleAccountClick}
        />
      </main>

      {/* Account Detail Dialog */}
      {selectedCompany && (
        <AccountDetail
          domain={selectedCompany.domain}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </div>
  );
}
