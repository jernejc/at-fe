'use client';

import { useState } from 'react';
import { CampaignProgress } from '@/components/ui/campaign-progress';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { EngagementIndicator } from '@/components/ui/engagement-indicator';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { TrendIndicator } from '@/components/ui/trend-indicator';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { CampaignRow } from '@/components/campaigns/CampaignRow';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { CAMPAIGN_ICON_NAMES } from '@/lib/config/campaign-icons';
import { Separator } from '@/components/ui/separator';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import type { CampaignRowData, FilterDefinition, ActiveFilter, SortOptionDefinition, SortState } from '@/lib/schemas';

const sampleFilterDefs: FilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'completed', label: 'Completed' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    key: 'industry',
    label: 'Industry',
    options: [
      { value: 'technology', label: 'Technology' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'finance', label: 'Finance' },
      { value: 'manufacturing', label: 'Manufacturing' },
    ],
  },
  {
    key: 'location',
    label: 'Location',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'de', label: 'Germany' },
      { value: 'sg', label: 'Singapore' },
    ],
  },
];

const sampleSortOpts: SortOptionDefinition[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'company_count', label: 'Companies' },
  { value: 'avg_fit_score', label: 'Fit Score' },
];

const campaignProgressSamples = [
  { label: 'Empty', total: 20, inProgress: 0, completed: 0, taskCompletion: 0 },
  { label: 'In progress', total: 20, inProgress: 8, completed: 0, taskCompletion: 25 },
  { label: 'Mixed', total: 20, inProgress: 8, completed: 5, taskCompletion: 50 },
  { label: 'Mostly done', total: 20, inProgress: 3, completed: 15, taskCompletion: 80 },
  { label: 'All complete', total: 20, inProgress: 0, completed: 20, taskCompletion: 0 },
];

const fitScoreSamples = [
  { score: 0, label: 'No data' },
  { score: 30, change: 2, label: 'Low' },
  { score: 60, change: -4, label: 'Moderate' },
  { score: 80, label: 'High' },
  { score: 95, change: 5, label: 'Very high' },
];

const sampleCampaigns: CampaignRowData[] = [
  {
    id: 1, name: 'Companies looking for cloud security in SMB', slug: 'cloud-security-smb',
    status: 'active', company_count: 98, processed_count: 47, avg_fit_score: 78,
    target_product_id: 3, owner: 'user@example.com',
    created_at: '2026-01-15T10:30:00Z', updated_at: '2026-02-20T14:22:00Z',
    icon: 'cat', product_name: 'Google Workspace (GWS)',
    avg_employee_size: '100-200', main_location: 'United States',
    in_progress_count: 32, completed_won_count: 10, completed_lost_count: 5,
    task_completion_pct: 67, total_won_amount: 4200000,
    avg_fit_score_change: 3,
  },
  {
    id: 2, name: 'Enterprise AI adoption outreach', slug: 'enterprise-ai',
    status: 'draft', company_count: 45, processed_count: 0, avg_fit_score: 62,
    target_product_id: 1, owner: 'user@example.com',
    created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-22T11:00:00Z',
    icon: 'rat', product_name: 'AI Platform Pro',
    avg_employee_size: '500-1000', main_location: 'Germany',
  },
  {
    id: 3, name: 'Q1 partner expansion drive', slug: 'q1-partner-expansion',
    status: 'completed', company_count: 120, processed_count: 120, avg_fit_score: 85,
    target_product_id: 2, owner: 'user@example.com',
    created_at: '2025-10-01T08:00:00Z', updated_at: '2026-01-31T17:00:00Z',
    icon: 'ghost', product_name: 'Partner Connect',
    avg_employee_size: '50-100', main_location: 'United Kingdom',
    in_progress_count: 0, completed_won_count: 42, completed_lost_count: 78,
    task_completion_pct: 0, total_won_amount: 1850000,
    avg_fit_score_change: -2,
  },
  {
    id: 4, name: 'Startup fintech signal campaign', slug: 'startup-fintech',
    status: 'archived', company_count: 30, processed_count: 28, avg_fit_score: 44,
    target_product_id: null, owner: null,
    created_at: '2025-06-15T12:00:00Z', updated_at: '2025-09-01T09:00:00Z',
    icon: 'skull',
    main_location: 'Singapore',
  },
];

/** Custom project components: FitScoreIndicator and TrendIndicator. */
export function CustomSection() {
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [sort, setSort] = useState<SortState | null>(null);

  return (
    <section id="custom" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Custom Components
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Project-specific UI primitives.
        </p>
      </div>

      {/* Campaign Icons */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Campaign Icons
        </h3>
        <p className="text-xs text-muted-foreground">
          20 playful Lucide icons available for campaigns. Stored as a name string in the database.
        </p>
        <div className="flex flex-wrap gap-3">
          {CAMPAIGN_ICON_NAMES.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <CampaignIcon name={name} className="w-6 h-6" />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">{name}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Status Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          StatusIndicator
        </h3>
        <div className="flex items-center gap-6">
          {(['active', 'published', 'draft', 'completed', 'archived'] as const).map((status) => (
            <div key={status} className="flex items-center gap-2">
              <StatusIndicator status={status} />
              <span className="text-xs text-muted-foreground capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Filter & Sort */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Filter &amp; Sort
        </h3>
        <p className="text-xs text-muted-foreground">
          Reusable controlled filter (with submenu) and sort dropdown. Select filters to see active badges.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter definitions={sampleFilterDefs} value={filters} onValueChange={setFilters} />
          <Sort options={sampleSortOpts} value={sort} onValueChange={setSort} />
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          filters: {JSON.stringify(filters.map(f => `${f.fieldLabel} ${f.operator} ${f.valueLabel}`))}
          {' · '}sort: {sort ? `${sort.field} ${sort.direction}` : 'none'}
        </p>
      </div>

      <Separator />

      {/* Campaign Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          CampaignRow
        </h3>
        <p className="text-xs text-muted-foreground">
          Table row variant showing icon, status, title, product, metadata, fit score, progress, conversion, and revenue.
        </p>
        <div>
          <Separator />
          {sampleCampaigns.map((campaign) => (
            <div key={campaign.id}>
              <CampaignRow campaign={campaign} onClick={() => {}} className='-mx-6' />
              <Separator />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Dashboard */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Dashboard
        </h3>
        <p className="text-xs text-muted-foreground">
          Flexible grid dashboard with cell size, height, and gradient variants. Responsive: full on mobile, half on tablet, quarter on desktop.
        </p>
        <Dashboard>
          <DashboardCell gradient="orange">
            <DashboardCellTitle>Companies</DashboardCellTitle>
            <DashboardCellBody>32</DashboardCellBody>
          </DashboardCell>
          <DashboardCell>
            <DashboardCellTitle>Avg. fit</DashboardCellTitle>
            <DashboardCellBody>73%</DashboardCellBody>
          </DashboardCell>
          <DashboardCell>
            <DashboardCellTitle>Statuses</DashboardCellTitle>
            <DashboardCellBody>5 / 7</DashboardCellBody>
          </DashboardCell>
          <DashboardCell>
            <DashboardCellTitle>Leads engaged</DashboardCellTitle>
            <DashboardCellBody>12/38</DashboardCellBody>
          </DashboardCell>
          <DashboardCell size="half">
            <DashboardCellTitle>Outreach progress</DashboardCellTitle>
            <DashboardCellBody>72%</DashboardCellBody>
          </DashboardCell>
          <DashboardCell>
            <DashboardCellTitle>Deadline</DashboardCellTitle>
            <DashboardCellBody>-</DashboardCellBody>
          </DashboardCell>
          <DashboardCell gradient="green">
            <DashboardCellTitle>Total won</DashboardCellTitle>
            <DashboardCellBody>$3.42m</DashboardCellBody>
          </DashboardCell>
        </Dashboard>
      </div>

      <Separator />

      {/* Fit Score Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          FitScoreIndicator
        </h3>
        <div className="space-y-4">
          {fitScoreSamples.map((s) => (
            <div key={s.score} className="flex items-center gap-4">
              <span className="w-20 text-xs text-muted-foreground">
                {s.label}
              </span>
              <FitScoreIndicator score={s.score} change={s.change} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <span className="w-20 text-xs text-muted-foreground">
            Large (32px)
          </span>
          <FitScoreIndicator score={75} change={3} size={32} />
        </div>
      </div>

      <Separator />

      {/* Trend Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          TrendIndicator
        </h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Positive:</span>
            <TrendIndicator change={5} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Negative:</span>
            <TrendIndicator change={-3} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Large:</span>
            <TrendIndicator change={12} />
          </div>
        </div>
      </div>
      <Separator />

      {/* Engagement Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          EngagementIndicator
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-28 text-xs text-muted-foreground">Empty</span>
            <EngagementIndicator engaged={0} total={10} />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-28 text-xs text-muted-foreground">Partial</span>
            <EngagementIndicator engaged={4} total={12} />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-28 text-xs text-muted-foreground">High</span>
            <EngagementIndicator engaged={8} total={10} />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-28 text-xs text-muted-foreground">Full</span>
            <EngagementIndicator engaged={10} total={10} />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-28 text-xs text-muted-foreground">Large (48px)</span>
            <EngagementIndicator engaged={7} total={12} size={48} />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-28 text-xs text-muted-foreground">Hidden count</span>
            <EngagementIndicator engaged={5} total={10} hideCount />
          </div>
        </div>
      </div>
      <Separator />

      {/* Campaign Progress */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          CampaignProgress
        </h3>
        <div className="space-y-4">
          {campaignProgressSamples.map((s) => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="w-28 text-xs text-muted-foreground">
                {s.label}
              </span>
              <CampaignProgress
                total={s.total}
                inProgress={s.inProgress}
                completed={s.completed}
                taskCompletion={s.taskCompletion}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
