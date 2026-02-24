# CampaignRow — Missing Backend Fields

The `CampaignRow` component (`components/campaigns/CampaignRow.tsx`) uses the `CampaignRowData` type which extends `CampaignSummary` with the fields below. These fields are **not yet supported** by the backend and need to be added to the campaign summary/list endpoint response.

All fields are optional on the frontend — the component gracefully hides sections when data is absent.

## Fields Required

| Field | Type | Example | Description |
|---|---|---|---|
| `icon` | `string \| null` | `"rocket"` | Lucide icon name chosen by the user. Must be one of the keys in `CAMPAIGN_ICONS` (see `lib/config/campaign-icons.ts`). Falls back to `"megaphone"` when absent. Valid values: `megaphone`, `rocket`, `target`, `zap`, `flame`, `trophy`, `crown`, `gem`, `sparkles`, `heart`, `star`, `shield`, `telescope`, `compass`, `lightbulb`, `puzzle`, `ghost`, `leaf`, `candy`, `ice-cream-cone`. |
| `product_name` | `string \| null` | `"Google Workspace (GWS)"` | Resolved name of the target product. Avoids a separate product lookup on the client. Could be derived from `target_product_id` via a JOIN. |
| `avg_employee_size` | `string \| null` | `"100-200"` | Average or median employee count range across companies in the campaign. Should be a human-readable range string. |
| `main_location` | `string \| null` | `"United States"` | Most common HQ country/region across companies. Could be computed as the mode of `hq_country` from memberships. |
| `in_progress_count` | `integer` | `32` | Number of companies currently in active outreach (not completed, not untouched). Used by the `CampaignProgress` bar. |
| `completed_won_count` | `integer` | `10` | Companies that completed the funnel and were won. Used to compute the completed segment of `CampaignProgress` and derive conversion percentage (`completed_won_count / company_count`). |
| `completed_lost_count` | `integer` | `5` | Companies that completed the funnel and were lost. Combined with `completed_won_count` to get total completed count for the progress bar. |
| `task_completion_pct` | `integer (0-100)` | `67` | Average task/step completion percentage for in-progress companies. Used by the `CampaignProgress` striped bar layer. |
| `total_won_amount` | `number \| null` | `4200000` | Total revenue in USD attributed to this campaign. Displayed as compact currency (e.g., "$4.2M"). |
| `avg_fit_score_change` | `number \| null` | `3.2` | Change in average fit score since the last period. Positive = improvement. Used by the `FitScoreIndicator` trend arrow. |

## Suggested API Response Format

These fields should be included in the `GET /api/v1/campaigns` list endpoint response, alongside the existing `CampaignSummary` fields:

```json
{
  "id": 42,
  "name": "Companies looking for cloud security in SMB",
  "slug": "cloud-security-smb",
  "status": "active",
  "company_count": 98,
  "processed_count": 47,
  "avg_fit_score": 0.78,
  "target_product_id": 3,
  "owner": "user@example.com",
  "created_at": "2026-01-15T10:30:00Z",
  "updated_at": "2026-02-20T14:22:00Z",
  "icon": "rocket",
  "product_name": "Google Workspace (GWS)",
  "avg_employee_size": "100-200",
  "main_location": "United States",
  "in_progress_count": 32,
  "completed_won_count": 10,
  "completed_lost_count": 5,
  "task_completion_pct": 67,
  "total_won_amount": 4200000,
  "avg_fit_score_change": 3.2,
}
```

## Frontend Type Definition

See `lib/schemas/campaign.ts` — the `CampaignRowData` interface.
