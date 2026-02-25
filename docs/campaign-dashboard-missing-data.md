# Campaign Dashboard — Missing Data & Proposed Metrics API

## Available Data

These metrics are available from existing API calls (`getCampaign` + `getCampaignOverview`) and are rendered on the dashboard today.

| Dashboard Cell | Source | Field |
|----------------|--------|-------|
| Product name | `CampaignOverview` | `product_name` |
| Status | `CampaignRead` | `status` |
| Company count | `CampaignRead` | `company_count` |
| Avg. fit score | `CampaignRead` | `avg_fit_score` |

## Missing Data

These metrics show `"--"` on the dashboard and require a new backend endpoint. The chart in the Progress cell is also deferred.

| Dashboard Cell | Why Not Available Now |
|----------------|----------------------|
| **Partners** (count) | Needs campaign-specific partner count with activity context |
| **Partners** (inactive badge + red gradient) | "Inactive" means partners with no outreach progress in the last N days — this is different from `partner_status` on `PartnerAssignmentSummary`, which indicates account-level status |
| **Companies** (unassigned badge + orange gradient) | Requires checking partner assignments across all paginated companies — too expensive client-side |
| **Target** | No `target_amount` field exists on any campaign schema |
| **Closed** (won amount + green gradient) | `total_won_amount` on `CampaignRowData` is a UI-only extension, not returned by the API |
| **Progress** (task completion %) | `CampaignOverview.processing_progress` tracks data processing progress, not outreach task completion |
| **Progress** (chart) | Requires time-series data for task completion over time across all companies |
| **Avg. conversion** | Different from `CampaignFunnel.conversion_rate` — the funnel tracks stage progression, not execution-level conversion |
| **Avg. fit score change** | `CampaignRowData.avg_fit_score_change` is UI-only, not from the API |

## Proposed API

### New endpoint: `GET /api/v1/campaigns/{slug}/metrics`

Returns aggregated campaign execution metrics. This replaces multiple client-side API calls and computations with a single server-side aggregation.

```typescript
interface CampaignMetrics {
  // Partners
  partner_count: number;              // Total partners assigned to this campaign
  inactive_partner_count: number;     // Partners with no outreach progress in last N days

  // Companies
  unassigned_company_count: number;   // Companies with no partner assigned

  // Revenue
  target_amount: number | null;       // User-set campaign revenue target
  closed_won_amount: number;          // Sum of won deal values
  closed_won_count: number;           // Number of won deals

  // Progress & conversion
  task_completion_pct: number;        // Overall outreach task completion rate (0-100)
  avg_conversion_rate: number;        // Execution-level conversion (contacted -> positive outcome)

  // Trends
  avg_fit_score_change: number | null; // Change since last calculation period

  // Time-series for progress chart
  progress_timeseries: Array<{
    date: string;                     // ISO date
    task_completion: number;          // 0-100
    completed_count: number;          // Companies fully completed by this date
  }>;
}
```

### Schema changes needed

Add `target_amount` to `CampaignCreate` and `CampaignUpdate` so users can set campaign revenue targets:

```typescript
// In CampaignCreate
target_amount?: number | null;

// In CampaignUpdate
target_amount?: number | null;
```

### Integration path

Once the metrics endpoint exists:

1. Add `getCampaignMetrics(slug)` to `lib/api/campaigns.ts`
2. Add `CampaignMetrics` type to `lib/schemas/campaign.ts`
3. Fetch metrics in `CampaignDetailProvider` alongside campaign + overview
4. Pass metrics props to `CampaignOverviewDashboard` — it already accepts optional `unassignedCount`, `inactivePartnerCount`, `partnerCount`, `targetAmount`, `closedAmount`, `progressPct`, `conversionRate`
5. The badges, gradients, and chart will activate automatically when data is provided

### Progress chart

The Progress cell has reserved space for a time-series chart. When `progress_timeseries` data is available, render it using `recharts` (already a project dependency). The chart should show task completion percentage over time, matching the design reference which displays two lines (likely overall completion and a secondary metric like completed count).
