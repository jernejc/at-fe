'use client';

import { useState } from 'react';
import { CampaignProgress } from '@/components/ui/campaign-progress';
import { CompanyStatus } from '@/components/ui/company-status';
import { StatusesChart } from '@/components/ui/statuses-chart';
import type { CompanyStatusValue } from '@/components/ui/company-status';
import { Dashboard, DashboardCell, DashboardCellTitle, DashboardCellBody } from '@/components/ui/dashboard';
import { EngagementIndicator } from '@/components/ui/engagement-indicator';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { SignalStrengthIndicator } from '@/components/ui/signal-strength-indicator';
import { TrendIndicator } from '@/components/ui/trend-indicator';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { CampaignRow } from '@/components/campaigns/CampaignRow';
import { CompanyRow } from '@/components/campaigns/CompanyRow';
import { PersonRow } from '@/components/ui/person-row';
import { JobRow } from '@/components/ui/job-row';
import { ProductRow } from '@/components/ui/product-row';
import { SignalRow } from '@/components/signals/SignalRow';
import { CampaignIcon } from '@/lib/config/campaign-icons';
import { CAMPAIGN_ICON_NAMES } from '@/lib/config/campaign-icons';
import { Separator } from '@/components/ui/separator';
import { Filter } from '@/components/ui/filter';
import { Sort } from '@/components/ui/sort';
import type { CampaignRowData, CompanyRowData, ProductRowData, FilterDefinition, ActiveFilter, SortOptionDefinition, SortState, EmployeeSummary, JobPostingSummary, SignalInterest } from '@/lib/schemas';

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

const companyStatusSamples: { label: string; status: CompanyStatusValue; progress?: number }[] = [
  { label: 'New', status: 'new' },
  { label: 'Default', status: 'default' },
  { label: 'In progress (25%)', status: 'in_progress', progress: 25 },
  { label: 'In progress (60%)', status: 'in_progress', progress: 60 },
  { label: 'In progress (90%)', status: 'in_progress', progress: 90 },
  { label: 'Closed Won', status: 'closed_won' },
  { label: 'Closed Lost', status: 'closed_lost' },
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

const sampleCompanies: CompanyRowData[] = [
  {
    id: 1, name: 'Notion', domain: 'notion.so',
    status: 'new', fit_score: 0.55, fit_score_change: 8,
    hq_country: 'United States', employee_count: 600,
  },
  {
    id: 2, name: 'Recursion', domain: 'recursion.com',
    status: 'default', fit_score: 0.9, fit_score_change: -3,
    hq_country: 'United States', employee_count: 128,
    revenue: 241400000, partner_name: 'Brio Tech',
  },
  {
    id: 3, name: 'Stripe', domain: 'stripe.com',
    status: 'in_progress', progress: 60,
    fit_score: 0.82, fit_score_change: 5,
    hq_country: 'United States', employee_count: 8000,
    revenue: 14000000000, partner_name: 'Acme Partners',
  },
  {
    id: 4, name: 'Klarna', domain: 'klarna.com',
    status: 'closed_won', fit_score: 0.71,
    hq_country: 'Sweden', employee_count: 5000,
    revenue: 1900000000,
  },
];

const sampleProducts: ProductRowData[] = [
  {
    company_id: 1, company_domain: 'notion.so', company_name: 'Notion',
    product_id: 1, product_name: 'Google Workspace (GWS)',
    likelihood_score: 0.87, urgency_score: 0.62, combined_score: 0.92,
    top_drivers: ['Cloud adoption', 'Collaboration tools', 'Enterprise readiness', 'Security posture', 'API integration'],
    calculated_at: '2026-03-01T10:00:00Z',
  },
  {
    company_id: 1, company_domain: 'notion.so', company_name: 'Notion',
    product_id: 2, product_name: 'AI Platform Pro',
    likelihood_score: 0.54, urgency_score: 0.30, combined_score: 0.61,
    top_drivers: ['ML experimentation', 'Data pipeline interest'],
    calculated_at: '2026-03-01T10:00:00Z',
  },
  {
    company_id: 1, company_domain: 'notion.so', company_name: 'Notion',
    product_id: 3, product_name: 'Partner Connect',
    likelihood_score: 0.22, urgency_score: 0.10, combined_score: 0.28,
    top_drivers: [],
    calculated_at: '2026-03-01T10:00:00Z',
  },
];

const samplePeople: EmployeeSummary[] = [
  {
    id: 1, full_name: 'Sarah Chen', headline: null, current_title: 'VP of Engineering',
    department: 'Engineering', company_id: 1, city: 'San Francisco', country: 'US',
    profile_url: 'https://linkedin.com/in/sarahchen', avatar_url: null,
    is_decision_maker: true, is_currently_employed: true,
  },
  {
    id: 2, full_name: 'Marcus Johnson', headline: null, current_title: 'Senior Account Executive',
    department: 'Sales', company_id: 1, city: 'New York', country: 'US',
    profile_url: 'https://linkedin.com/in/marcusjohnson', avatar_url: null,
    is_decision_maker: false, is_currently_employed: true,
  },
  {
    id: 3, full_name: 'Elena Petrov', headline: null, current_title: 'Product Manager',
    department: null, company_id: 2, city: 'London', country: 'UK',
    profile_url: null, avatar_url: null,
    is_decision_maker: false, is_currently_employed: true,
  },
  {
    id: 4, full_name: 'James O\'Brien', headline: null, current_title: 'CTO',
    department: 'Engineering', company_id: 3, city: null, country: 'Germany',
    profile_url: 'https://linkedin.com/in/jamesobrien', avatar_url: null,
    is_decision_maker: true, is_currently_employed: true,
  },
];

const sampleJobs: JobPostingSummary[] = [
  { id: 1, title: 'Senior Frontend Engineer', location: 'San Francisco, CA', department: 'Engineering', employment_type: 'Full-time', posted_at: new Date(Date.now() - 2 * 86400000).toISOString(), is_remote: true },
  { id: 2, title: 'Account Executive - Enterprise', location: 'New York, NY', department: 'Sales', employment_type: 'Full-time', posted_at: new Date(Date.now() - 14 * 86400000).toISOString(), is_remote: false },
  { id: 3, title: 'Product Design Intern', location: null, department: 'Design', employment_type: 'Internship', posted_at: new Date(Date.now() - 45 * 86400000).toISOString(), is_remote: true },
  { id: 4, title: 'DevOps Engineer', location: 'London, UK', department: 'Engineering', employment_type: null, posted_at: null, is_remote: null },
];

const sampleCampaigns: CampaignRowData[] = [
  {
    id: 1, name: 'Companies looking for cloud security in SMB', slug: 'cloud-security-smb',
    status: 'active', company_count: 98, processed_count: 47, avg_fit_score: 78,
    target_product_id: 3, owner: 'user@example.com', owner_id: 1,
    created_at: '2026-01-15T10:30:00Z', updated_at: '2026-02-20T14:22:00Z',
    icon: 'cat', product_name: 'Google Workspace (GWS)',
    partner_count: 3, avg_employee_count: 150, min_employee_count: 100, max_employee_count: 200,
    avg_revenue: 5000000, min_revenue: 1000000, max_revenue: 10000000, top_location: 'United States',
    in_progress_count: 32, completed_won_count: 10, completed_lost_count: 5,
    task_completion_pct: 67, total_won_amount: 4200000,
    avg_fit_score_change: 3,
  },
  {
    id: 2, name: 'Enterprise AI adoption outreach', slug: 'enterprise-ai',
    status: 'draft', company_count: 45, processed_count: 0, avg_fit_score: 62,
    target_product_id: 1, owner: 'user@example.com', owner_id: 1,
    created_at: '2026-02-10T09:00:00Z', updated_at: '2026-02-22T11:00:00Z',
    icon: 'rat', product_name: 'AI Platform Pro',
    partner_count: 1, avg_employee_count: 750, min_employee_count: 500, max_employee_count: 1000,
    avg_revenue: 50000000, min_revenue: 20000000, max_revenue: 80000000, top_location: 'Germany',
  },
  {
    id: 3, name: 'Q1 partner expansion drive', slug: 'q1-partner-expansion',
    status: 'completed', company_count: 120, processed_count: 120, avg_fit_score: 85,
    target_product_id: 2, owner: 'user@example.com', owner_id: 1,
    created_at: '2025-10-01T08:00:00Z', updated_at: '2026-01-31T17:00:00Z',
    icon: 'ghost', product_name: 'Partner Connect',
    partner_count: 5, avg_employee_count: 75, min_employee_count: 50, max_employee_count: 100,
    avg_revenue: 3000000, min_revenue: 500000, max_revenue: 8000000, top_location: 'United Kingdom',
    in_progress_count: 0, completed_won_count: 42, completed_lost_count: 78,
    task_completion_pct: 0, total_won_amount: 1850000,
    avg_fit_score_change: -2,
  },
  {
    id: 4, name: 'Startup fintech signal campaign', slug: 'startup-fintech',
    status: 'archived', company_count: 30, processed_count: 28, avg_fit_score: 44,
    target_product_id: null, owner: null, owner_id: null,
    created_at: '2025-06-15T12:00:00Z', updated_at: '2025-09-01T09:00:00Z',
    icon: 'skull',
    partner_count: 0, avg_employee_count: null, min_employee_count: null, max_employee_count: null,
    avg_revenue: null, min_revenue: null, max_revenue: null, top_location: 'Singapore',
  },
];

const sampleSignals: SignalInterest[] = [
  {
    id: 1, category: 'cloud_security', display_name: 'Cloud Security Interest',
    strength: 8, confidence: 0.9, evidence_summary: 'Multiple employees engaging with cloud security content and attending AWS re:Invent sessions',
    source_type: 'employee', source_types: ['employee', 'post', 'technographics'],
    source_ids: [1, 2, 3], source_ids_by_type: { employee: [1], post: [2], technographics: [3] },
    component_signal_ids: [10, 11, 12], component_count: 3, components: [],
    contributor_count: 5, weight_sum: 12.4,
  },
  {
    id: 2, category: 'hiring_growth', display_name: 'Hiring Surge',
    strength: 5, confidence: 0.7, evidence_summary: '12 new engineering roles posted in the last 30 days across multiple departments',
    source_type: 'job', source_types: ['job', 'news'],
    source_ids: [4, 5], source_ids_by_type: { job: [4], news: [5] },
    component_signal_ids: [20, 21], component_count: 2, components: [],
    contributor_count: 2, weight_sum: 6.1,
  },
  {
    id: 3, category: 'data_analytics', display_name: 'Data Analytics Adoption',
    strength: 3, confidence: 0.5, evidence_summary: 'CTO mentioned evaluating data platforms in a recent blog post',
    source_type: 'post', source_types: ['post'],
    source_ids: [6], source_ids_by_type: { post: [6] },
    component_signal_ids: [30], component_count: 1, components: [],
    contributor_count: 1, weight_sum: 3.0,
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
              <CampaignRow campaign={campaign} onClick={() => { }} className='-mx-6' />
              <Separator />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Company Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          CompanyRow
        </h3>
        <p className="text-xs text-muted-foreground">
          Table row showing company status, logo, name, domain, fit score with trend, location, employee count, revenue, and assigned partner.
        </p>
        <div>
          <Separator />
          {sampleCompanies.map((company) => (
            <div key={company.id}>
              <CompanyRow company={company} onClick={() => { }} className='-mx-6' />
              <Separator />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Product Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          ProductRow
        </h3>
        <p className="text-xs text-muted-foreground">
          Row showing product fit score disc, product name, top driver tags, and likelihood metric with progress bar.
        </p>
        <div>
          <Separator />
          {sampleProducts.map((product) => (
            <div key={product.product_id}>
              <ProductRow product={product} onClick={() => { }} className='-mx-6' />
              <Separator />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Person Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          PersonRow
        </h3>
        <p className="text-xs text-muted-foreground">
          Row showing person avatar, name, title, department, location, and LinkedIn link.
          Key contacts display a yellow key icon.
        </p>
        <div>
          <Separator />
          {samplePeople.map((person) => (
            <div key={person.id}>
              <PersonRow
                person={person}
                keyContact={person.is_decision_maker}
                onClick={() => { }}
                className='-mx-6'
              />
              <Separator />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Job Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          JobRow
        </h3>
        <p className="text-xs text-muted-foreground">
          Row showing job posting date badge, title, location, remote status, and employment type.
        </p>
        <div>
          <Separator />
          {sampleJobs.map((job) => (
            <div key={job.id}>
              <JobRow job={job} onClick={() => { }} className='-mx-6' />
              <Separator />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Signal Row */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          SignalRow
        </h3>
        <p className="text-xs text-muted-foreground">
          Row showing signal strength triangle, type icon, name, evidence summary, source type badges, contributor and component counts.
        </p>
        <div>
          <Separator />
          {sampleSignals.map((signal) => (
            <div key={signal.id}>
              <SignalRow signal={signal} onClick={() => { }} className='-mx-6' />
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
            <DashboardCellBody className="flex items-end">
              <StatusesChart
                newCount={5}
                backlogCount={5}
                inProgressCount={7}
                wonCount={5}
                lostCount={10}
                inProgressCompletion={45}
              />
            </DashboardCellBody>
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

      {/* Signal Strength Indicator */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          SignalStrengthIndicator
        </h3>
        <div className="space-y-4">
          {[
            { value: 0, label: 'None' },
            { value: 3, label: 'Low' },
            { value: 5, label: 'Medium' },
            { value: 7, label: 'High' },
            { value: 10, label: 'Max' },
          ].map((s) => (
            <div key={s.value} className="flex items-center gap-4">
              <span className="w-20 text-xs text-muted-foreground">
                {s.label}
              </span>
              <SignalStrengthIndicator value={s.value} />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <span className="w-20 text-xs text-muted-foreground">
            Large (32px)
          </span>
          <SignalStrengthIndicator value={7} size={32} />
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

      {/* Company Status */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          CompanyStatus
        </h3>
        <p className="text-xs text-muted-foreground">
          Circle indicator for company lifecycle: new (yellow ring), default (grey ring),
          in_progress (green arc), closed_won (green check), closed_lost (red X).
        </p>
        <div className="flex items-center gap-6">
          {companyStatusSamples.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <CompanyStatus status={s.status} progress={s.progress} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
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
