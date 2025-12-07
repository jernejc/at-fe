'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AccountList, AccountDetail } from '@/components/accounts';
import { getStats, StatsResponse, CompanySummary, PRODUCT_GROUPS } from '@/lib/api';
import { useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [activeProductGroup, setActiveProductGroup] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<CompanySummary | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  const handleAccountClick = (company: CompanySummary) => {
    setSelectedCompany(company);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-5 5-4-4-3 3" />
                </svg>
              </div>
              <span className="font-bold text-lg">AccountScope</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              J
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto">
        {/* Page Header */}
        <div className="px-6 py-8">
          <div className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 mt-2" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Account Intelligence Dashboard</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Real-time account intelligence and buying signals for your target companies.
                No more cold outreach - reach out when they&apos;re ready to buy.
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Companies:</span>
                <span className="font-semibold">{stats.total_companies.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Employees:</span>
                <span className="font-semibold">{stats.total_employees.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Job Postings:</span>
                <span className="font-semibold">{stats.total_job_postings.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Avg Rating:</span>
                <span className="font-semibold">{stats.avg_rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Group Tabs */}
        <div className="px-6 border-b border-border">
          <Tabs value={activeProductGroup} onValueChange={setActiveProductGroup}>
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3 text-base"
              >
                All Accounts
              </TabsTrigger>
              {PRODUCT_GROUPS.map((group) => (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3 text-base"
                >
                  <span
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Account List */}
        <div className="bg-card border-y border-border">
          <AccountList
            productGroup={activeProductGroup === 'all' ? undefined : activeProductGroup}
            onAccountClick={handleAccountClick}
          />
        </div>
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
