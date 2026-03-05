# Company Progress Tracking — Backend Spec Proposal

> **Status:** Draft proposal for backend team
> **Date:** 2026-03-05
> **Context:** LookAcross campaign execution tracking — from campaign publish through playbook execution to deal closure.

---

## 1. Overview

When a campaign is **published**, playbooks are generated for each company. When a partner **exports/downloads** companies from a campaign, we treat that as the start of playbook execution. From that point, the system auto-tracks progress by marking playbook steps as completed based on their `day_offset` relative to the export date. Partners can also explicitly mark steps, set deal status, report revenue, and confirm stakeholder engagement.

The frontend needs per-company progress, per-partner aggregations, and per-campaign aggregations — all with date information for timeline charts.

---

## 2. Lifecycle

```
Campaign Published
  └─► Playbooks generated for each company (per product)

Partner exports/downloads companies
  └─► execution_started_at = NOW for each exported company
  └─► Playbook step auto-completion clock starts

Day N after export (matching step.day_offset)
  └─► Step auto-marked as completed (assumed)
  └─► Stakeholders for that step marked as engaged (assumed)

Partner explicitly marks step
  └─► Override: mark step as explicitly completed (or skipped)
  └─► Override: confirm stakeholder engagement

Partner sets company outcome
  └─► Status → closed_won / closed_lost
  └─► Revenue reported (for closed_won)
```

---

## 3. New/Modified Models

### 3.1 `CompanyProgress` (new table)

Tracks the execution state of a company within a specific campaign, for a specific partner.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` (PK) | Auto-increment |
| `campaign_id` | `int` (FK) | Campaign this progress belongs to |
| `company_id` | `int` (FK) | The target company |
| `partner_id` | `int` (FK) | The partner executing on this company |
| `playbook_id` | `int` (FK, nullable) | The playbook being executed (null if not yet generated) |
| `status` | `enum` | `backlog` \| `in_progress` \| `closed_won` \| `closed_lost` |
| `execution_started_at` | `datetime` (nullable) | When the partner exported/downloaded this company. `null` = backlog. |
| `status_changed_at` | `datetime` | Last time `status` changed |
| `earned_revenue` | `decimal` (nullable) | Revenue reported by partner (relevant for `closed_won`) |
| `revenue_currency` | `string` (nullable) | Currency code (e.g., `USD`, `EUR`). Default: `USD` |
| `revenue_reported_at` | `datetime` (nullable) | When revenue was last updated |
| `partner_notes` | `text` (nullable) | Free-text notes from the partner |
| `closed_at` | `datetime` (nullable) | When deal was closed (won or lost) |
| `close_reason` | `string` (nullable) | Reason for closure (especially useful for `closed_lost`) |
| `progress_percentage` | `int` | Computed: 0–100 based on completed steps / total steps |
| `created_at` | `datetime` | Record creation |
| `updated_at` | `datetime` | Last modification |

**Unique constraint:** `(campaign_id, company_id, partner_id)`

**Status transitions:**
- `backlog` → `in_progress` (auto: on export/download)
- `in_progress` → `closed_won` (explicit: partner marks deal won)
- `in_progress` → `closed_lost` (explicit: partner marks deal lost)
- `closed_lost` → `in_progress` (explicit: partner reopens)
- `closed_won` → `in_progress` (explicit: partner reopens — rare, but allowed)

---

### 3.2 `PlaybookStepProgress` (new table)

Tracks completion of each cadence step in the playbook for a given company progress record.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` (PK) | Auto-increment |
| `company_progress_id` | `int` (FK) | References `CompanyProgress.id` |
| `step_number` | `int` | Matches `CadenceStep.step` from the playbook |
| `day_offset` | `int` | Matches `CadenceStep.day_offset` — the planned day |
| `channel` | `string` | Matches `CadenceStep.channel` (e.g., `email`, `linkedin`, `call`) |
| `objective` | `string` (nullable) | Copied from `CadenceStep.objective` for reference |
| `status` | `enum` | `pending` \| `completed` \| `skipped` |
| `completion_type` | `enum` | `assumed` \| `explicit` |
| `planned_date` | `date` | `execution_started_at + day_offset` |
| `completed_at` | `datetime` (nullable) | When this step was marked completed |
| `partner_notes` | `text` (nullable) | Optional notes from the partner about this step |
| `created_at` | `datetime` | Record creation |
| `updated_at` | `datetime` | Last modification |

**Unique constraint:** `(company_progress_id, step_number)`

**Completion logic:**
- **Assumed completion:** A scheduled job runs daily. For each `in_progress` company, if `NOW() >= execution_started_at + day_offset`, set `status = completed`, `completion_type = assumed`, `completed_at = planned_date`.
- **Explicit completion:** Partner marks the step via API. Sets `completion_type = explicit`, `completed_at = NOW()`.
- **Skip:** Partner explicitly marks a step as skipped. No auto-completion will override this.

---

### 3.3 `StakeholderEngagement` (new table)

Tracks which key contacts were engaged at which playbook steps.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` (PK) | Auto-increment |
| `company_progress_id` | `int` (FK) | References `CompanyProgress.id` |
| `step_progress_id` | `int` (FK, nullable) | References `PlaybookStepProgress.id` (which step triggered this) |
| `contact_name` | `string` | Name of the stakeholder (from `CadenceStep.contacts`) |
| `contact_title` | `string` (nullable) | Title/role at the company |
| `contact_role_category` | `string` (nullable) | Role category (e.g., `decision_maker`, `champion`, `influencer`) |
| `employee_id` | `int` (FK, nullable) | References the employee record if matched |
| `channel` | `string` (nullable) | Channel used (e.g., `email`, `linkedin`, `call`) |
| `engagement_type` | `enum` | `assumed` \| `explicit` |
| `engaged_at` | `datetime` | When the engagement happened (or was assumed to happen) |
| `partner_notes` | `text` (nullable) | Notes about the interaction |
| `created_at` | `datetime` | Record creation |
| `updated_at` | `datetime` | Last modification |

**Engagement logic:**
- When a `PlaybookStepProgress` is marked completed (assumed or explicit), create `StakeholderEngagement` records for each contact listed in that step's `CadenceStep.contacts`.
- `engagement_type` mirrors the step's `completion_type`.
- Partners can also add ad-hoc engagements not tied to a step (set `step_progress_id = null`).

---

## 4. API Endpoints

### 4.1 Company Progress

#### `GET /api/v1/campaigns/{slug}/companies/{company_id}/progress`

Returns the full progress for a company in a campaign.

**Response:**
```json
{
  "id": 1,
  "campaign_id": 42,
  "company_id": 100,
  "partner_id": 5,
  "playbook_id": 77,
  "status": "in_progress",
  "execution_started_at": "2026-02-20T10:00:00Z",
  "status_changed_at": "2026-02-20T10:00:00Z",
  "earned_revenue": null,
  "revenue_currency": "USD",
  "closed_at": null,
  "close_reason": null,
  "progress_percentage": 60,
  "partner_notes": null,
  "steps": [
    {
      "step_number": 1,
      "day_offset": 0,
      "channel": "linkedin",
      "objective": "Send connection request to CTO",
      "status": "completed",
      "completion_type": "assumed",
      "planned_date": "2026-02-20",
      "completed_at": "2026-02-20T00:00:00Z"
    },
    {
      "step_number": 2,
      "day_offset": 2,
      "channel": "email",
      "objective": "Send intro email to VP Engineering",
      "status": "completed",
      "completion_type": "explicit",
      "planned_date": "2026-02-22",
      "completed_at": "2026-02-22T14:30:00Z"
    },
    {
      "step_number": 3,
      "day_offset": 5,
      "channel": "call",
      "objective": "Discovery call with CTO",
      "status": "pending",
      "completion_type": null,
      "planned_date": "2026-02-25",
      "completed_at": null
    }
  ],
  "stakeholder_engagements": [
    {
      "contact_name": "Jane Smith",
      "contact_title": "CTO",
      "contact_role_category": "decision_maker",
      "channel": "linkedin",
      "engagement_type": "assumed",
      "engaged_at": "2026-02-20T00:00:00Z",
      "step_number": 1
    },
    {
      "contact_name": "John Doe",
      "contact_title": "VP Engineering",
      "channel": "email",
      "engagement_type": "explicit",
      "engaged_at": "2026-02-22T14:30:00Z",
      "step_number": 2
    }
  ]
}
```

**Query params:**
- `partner_id` (optional, for PDMs to view a specific partner's progress)

**Access control:**
- Partners: can only see their own progress
- PDMs: can see any partner's progress, or omit `partner_id` to get all

---

#### `PATCH /api/v1/campaigns/{slug}/companies/{company_id}/progress`

Update company progress status or revenue.

**Request body:**
```json
{
  "status": "closed_won",
  "earned_revenue": 50000,
  "revenue_currency": "USD",
  "close_reason": null,
  "partner_notes": "Signed 12-month contract"
}
```

All fields optional. Only provided fields are updated.

---

#### `POST /api/v1/campaigns/{slug}/companies/{company_id}/progress/start`

Explicitly start execution (alternative to auto-start on export). Sets `status = in_progress`, `execution_started_at = NOW()`, and initializes step progress records from the playbook.

---

#### `PATCH /api/v1/campaigns/{slug}/companies/{company_id}/progress/steps/{step_number}`

Update a specific playbook step's status.

**Request body:**
```json
{
  "status": "completed",
  "partner_notes": "Email sent, got a reply within 2 hours"
}
```

Sets `completion_type = explicit` and `completed_at = NOW()`.

---

#### `POST /api/v1/campaigns/{slug}/companies/{company_id}/progress/engagements`

Add an ad-hoc stakeholder engagement (not tied to a step).

**Request body:**
```json
{
  "contact_name": "Sarah Lee",
  "contact_title": "CFO",
  "contact_role_category": "decision_maker",
  "employee_id": 456,
  "channel": "call",
  "partner_notes": "Unplanned intro via mutual connection"
}
```

---

### 4.2 Bulk Progress on Export

#### `POST /api/v1/campaigns/{slug}/partners/{partner_id}/export`

When a partner exports/downloads their assigned companies, the backend should:

1. Return the export data (CSV or JSON with companies + playbooks)
2. For each exported company that is still in `backlog`:
   - Set `status = in_progress`
   - Set `execution_started_at = NOW()`
   - Create `PlaybookStepProgress` records from the playbook's `outreach_cadence.sequence`
   - Create initial `StakeholderEngagement` records for step 1 if `day_offset = 0`

---

### 4.3 Campaign Aggregations

#### `GET /api/v1/campaigns/{slug}/progress/summary`

Campaign-level aggregation. Returns counts, averages, and timeline data.

**Query params:**
- `partner_id` (optional) — filter to a specific partner's companies

**Response:**
```json
{
  "campaign_id": 42,
  "campaign_slug": "q1-enterprise",
  "partner_id": null,
  "total_companies": 120,
  "status_counts": {
    "backlog": 45,
    "in_progress": 55,
    "closed_won": 12,
    "closed_lost": 8
  },
  "avg_progress_percentage": 42.5,
  "total_earned_revenue": 580000,
  "revenue_currency": "USD",
  "unique_stakeholders_engaged": 87,
  "avg_steps_completed": 3.2,
  "avg_total_steps": 6,
  "timeline": [
    {
      "date": "2026-02-01",
      "backlog": 120,
      "in_progress": 0,
      "closed_won": 0,
      "closed_lost": 0,
      "avg_progress": 0,
      "cumulative_revenue": 0
    },
    {
      "date": "2026-02-08",
      "backlog": 80,
      "in_progress": 40,
      "closed_won": 0,
      "closed_lost": 0,
      "avg_progress": 15,
      "cumulative_revenue": 0
    },
    {
      "date": "2026-02-15",
      "backlog": 60,
      "in_progress": 52,
      "closed_won": 5,
      "closed_lost": 3,
      "avg_progress": 35,
      "cumulative_revenue": 250000
    }
  ]
}
```

**Access control:**
- Partners: response auto-filtered to only their assigned companies
- PDMs: see all companies (or filter by `partner_id`)

---

#### `GET /api/v1/campaigns/{slug}/progress/timeline`

Dedicated endpoint for timeline chart data with configurable granularity.

**Query params:**
- `partner_id` (optional)
- `granularity` — `daily` | `weekly` | `monthly` (default: `weekly`)
- `start_date` (optional)
- `end_date` (optional)
- `metrics` (optional, comma-separated) — `status_counts` | `progress` | `revenue` | `engagements` (default: all)

**Response:**
```json
{
  "granularity": "weekly",
  "data_points": [
    {
      "date": "2026-02-03",
      "status_counts": {
        "backlog": 120,
        "in_progress": 0,
        "closed_won": 0,
        "closed_lost": 0
      },
      "avg_progress_percentage": 0,
      "cumulative_revenue": 0,
      "new_engagements": 0,
      "steps_completed": 0
    },
    {
      "date": "2026-02-10",
      "status_counts": {
        "backlog": 75,
        "in_progress": 45,
        "closed_won": 0,
        "closed_lost": 0
      },
      "avg_progress_percentage": 18,
      "cumulative_revenue": 0,
      "new_engagements": 45,
      "steps_completed": 90
    }
  ]
}
```

---

#### `GET /api/v1/campaigns/{slug}/partners/{partner_id}/progress/summary`

Partner-specific aggregation within a campaign. Same response shape as campaign summary but scoped to one partner's assigned companies.

---

### 4.4 Partner-Level Aggregation (across campaigns)

#### `GET /api/v1/partners/{partner_id}/progress/summary`

Aggregation across all campaigns for a partner.

**Response:**
```json
{
  "partner_id": 5,
  "campaigns": [
    {
      "campaign_id": 42,
      "campaign_slug": "q1-enterprise",
      "campaign_name": "Q1 Enterprise Push",
      "total_companies": 30,
      "status_counts": {
        "backlog": 10,
        "in_progress": 15,
        "closed_won": 3,
        "closed_lost": 2
      },
      "avg_progress_percentage": 55,
      "total_earned_revenue": 150000
    }
  ],
  "totals": {
    "total_companies": 75,
    "total_in_progress": 40,
    "total_closed_won": 8,
    "total_closed_lost": 5,
    "total_earned_revenue": 380000,
    "overall_avg_progress": 48
  }
}
```

---

## 5. Scheduled Job: Auto-Complete Steps

A daily cron job (or equivalent) processes assumed step completions:

```
FOR EACH CompanyProgress WHERE status = 'in_progress':
  FOR EACH PlaybookStepProgress WHERE status = 'pending':
    IF NOW() >= planned_date:
      SET status = 'completed'
      SET completion_type = 'assumed'
      SET completed_at = planned_date (midnight UTC)
      CREATE StakeholderEngagement records for each contact in this step
        WITH engagement_type = 'assumed'
        WITH engaged_at = planned_date

  RECALCULATE progress_percentage = (completed_steps / total_steps) * 100
```

**Important considerations:**
- Steps marked as `skipped` are excluded from auto-completion but still count toward total steps for progress calculation (treated as 0% for that step).
- The job should be idempotent — safe to run multiple times.
- Consider timezone: use the partner's configured timezone or UTC.

---

## 6. Playbook Generation Trigger

When a campaign status changes to `published`:

1. For each company membership in the campaign:
   - Generate playbook for the campaign's `target_product_id`
   - Create a `CompanyProgress` record with `status = backlog`
   - Link the `playbook_id` once generation completes
2. If playbooks already exist (e.g., campaign was re-published), reuse existing ones unless the partner/PDM requests regeneration.

---

## 7. Progress Percentage Calculation

```
progress_percentage = (completed_steps / total_steps) * 100
```

Where:
- `completed_steps` = count of `PlaybookStepProgress` where `status = 'completed'`
- `total_steps` = count of all `PlaybookStepProgress` records (including `skipped`)
- `skipped` steps count as NOT completed

If the company has no playbook steps (no cadence), `progress_percentage = 0`.

For `closed_won`: progress is considered 100% regardless of step completion.
For `closed_lost`: progress freezes at whatever it was when closed.

---

## 8. Frontend Data Requirements Summary

### When loading a company in a campaign context

The existing `MembershipRead` or `CompanyRowData` responses should be extended (or a new endpoint used) to include:

```typescript
interface CompanyProgressResponse {
  // Existing fields
  company_id: number;
  domain: string;
  company_name: string;
  // ...existing membership fields...

  // New progress fields
  progress: {
    status: 'backlog' | 'in_progress' | 'closed_won' | 'closed_lost';
    execution_started_at: string | null;
    progress_percentage: number;
    earned_revenue: number | null;
    revenue_currency: string;
    closed_at: string | null;
    close_reason: string | null;
    steps: {
      step_number: number;
      day_offset: number;
      channel: string;
      objective: string | null;
      status: 'pending' | 'completed' | 'skipped';
      completion_type: 'assumed' | 'explicit' | null;
      planned_date: string;
      completed_at: string | null;
      contacts: string[];  // who should be / was engaged at this step
    }[];
    stakeholders_engaged: number;
    total_stakeholders: number;
  };
}
```

### For campaign list/overview (no per-company loading)

```typescript
interface CampaignProgressSummary {
  total_companies: number;
  status_counts: {
    backlog: number;
    in_progress: number;
    closed_won: number;
    closed_lost: number;
  };
  avg_progress_percentage: number;
  total_earned_revenue: number;
  revenue_currency: string;
  timeline: TimelineDataPoint[];
}

interface TimelineDataPoint {
  date: string;              // ISO date
  backlog: number;
  in_progress: number;
  closed_won: number;
  closed_lost: number;
  avg_progress: number;      // 0-100
  cumulative_revenue: number;
  steps_completed: number;   // total steps completed that period
  new_engagements: number;   // new stakeholder engagements that period
}
```

---

## 9. Database Diagram

```
┌──────────────────────┐     ┌──────────────────────┐
│      Campaign        │     │       Partner         │
│──────────────────────│     │──────────────────────│
│ id                   │     │ id                   │
│ slug                 │     │ name                 │
│ status               │     │ slug                 │
│ target_product_id    │     └──────────┬───────────┘
└──────────┬───────────┘                │
           │                            │
           │     ┌──────────────────────┴───────────┐
           │     │       CompanyProgress             │
           ├────►│──────────────────────────────────│
           │     │ id                               │
           │     │ campaign_id (FK → Campaign)      │
           │     │ company_id (FK → Company)        │
           │     │ partner_id (FK → Partner)        │
           │     │ playbook_id (FK → Playbook)      │
           │     │ status (enum)                    │
           │     │ execution_started_at             │
           │     │ earned_revenue                   │
           │     │ progress_percentage              │
           │     │ closed_at                        │
           │     └──────────┬───────────────────────┘
           │                │
           │       ┌────────┴─────────┐
           │       │                  │
           │       ▼                  ▼
           │  ┌─────────────┐  ┌──────────────────┐
           │  │PlaybookStep │  │  Stakeholder     │
           │  │Progress     │  │  Engagement      │
           │  │─────────────│  │──────────────────│
           │  │ id          │  │ id               │
           │  │ company_    │  │ company_         │
           │  │  progress_id│  │  progress_id     │
           │  │ step_number │  │ step_progress_id │
           │  │ day_offset  │  │ contact_name     │
           │  │ channel     │  │ contact_title    │
           │  │ status      │  │ employee_id      │
           │  │ completion_ │  │ engagement_type  │
           │  │  type       │  │ engaged_at       │
           │  │ planned_date│  │ channel          │
           │  │ completed_at│  └──────────────────┘
           │  └─────────────┘
           │
           ▼
┌──────────────────────┐     ┌──────────────────────┐
│      Playbook        │     │       Company        │
│──────────────────────│     │──────────────────────│
│ id                   │     │ id                   │
│ company_id           │     │ domain               │
│ product_id           │     │ name                 │
│ outreach_cadence     │     └──────────────────────┘
│  └─ sequence[]       │
│     └─ step, day_    │
│       offset, channel│
│       contacts[]     │
└──────────────────────┘
```

---

## 10. Edge Cases & Considerations

1. **Multiple partners per company:** A company can be assigned to multiple partners in the same campaign. Each partner has their own `CompanyProgress` record. The campaign-level aggregation should deduplicate company counts (a company in `in_progress` for partner A and `closed_won` for partner B should count once under the "best" status).

2. **Playbook regeneration:** If a playbook is regenerated after execution started, keep the existing `PlaybookStepProgress` records. New steps from the regenerated playbook should be appended, but already-completed steps should not be reset.

3. **No playbook:** If a company doesn't have a playbook (generation failed or product not set), `CompanyProgress` still works — just with 0 steps and 0% progress. Status transitions still apply.

4. **Campaign unpublish:** If a campaign is unpublished while in progress, existing `CompanyProgress` records should be preserved. Re-publishing should not reset progress.

5. **Partner removed from campaign:** If a partner is unassigned from a campaign, their `CompanyProgress` records should be preserved for historical data but marked as inactive (add an `is_active` flag or a `deactivated_at` field).

6. **Revenue in different currencies:** If multi-currency is needed, aggregations should either convert to a base currency or group by currency. Start simple: assume single currency per campaign.

7. **Timeline data generation:** Timeline data should be computed from status change history. Consider adding a `CompanyProgressHistory` table that logs every status change with a timestamp, or compute from `status_changed_at` and `PlaybookStepProgress.completed_at` timestamps.

8. **Step contact resolution:** `CadenceStep.contacts` contains name strings. For `StakeholderEngagement`, attempt to match these to `employee_id` via the playbook's `PlaybookContactResponse` records. If no match, store the name string only.

---

## 11. Timeline History Table (recommended)

For accurate timeline charts, we recommend a separate history table:

### `CompanyProgressEvent` (new table)

| Field | Type | Description |
|-------|------|-------------|
| `id` | `int` (PK) | Auto-increment |
| `company_progress_id` | `int` (FK) | References `CompanyProgress.id` |
| `event_type` | `enum` | `status_change` \| `step_completed` \| `step_skipped` \| `revenue_updated` \| `engagement_added` |
| `event_date` | `datetime` | When the event occurred |
| `old_value` | `string` (nullable) | Previous value (e.g., old status) |
| `new_value` | `string` (nullable) | New value (e.g., new status) |
| `metadata` | `jsonb` (nullable) | Extra data (step_number, revenue amount, contact name, etc.) |
| `created_at` | `datetime` | Record creation |

This table enables:
- Reconstructing status at any point in time for timeline charts
- Auditing all changes
- Computing "velocity" metrics (how fast companies move through the pipeline)
- Weekly/monthly rollup queries without scanning all step records

---

## 12. Existing Model Alignment

This proposal builds on existing models without breaking them:

| Existing Model | Relationship | Notes |
|---|---|---|
| `MembershipRead` | `CompanyProgress` references the same `campaign_id` + `company_id` pair | Membership tracks campaign inclusion; `CompanyProgress` tracks execution |
| `PartnerCompanyAssignment` | `CompanyProgress.partner_id` aligns with partner assignment | Progress is created when assignment + export happens |
| `PlaybookRead.outreach_cadence` | `PlaybookStepProgress` is seeded from `outreach_cadence.sequence` | Steps are copied at execution start so playbook changes don't retroactively affect progress |
| `CadenceStep.contacts` | `StakeholderEngagement.contact_name` | Contacts are resolved to employees where possible |
| `CompanyRowData.status` | Maps to `CompanyProgress.status` | Frontend already has `in_progress`, `closed_won`, `closed_lost` — add `backlog` |
| `CompanyRowData.progress` | Maps to `CompanyProgress.progress_percentage` | Already a 0-100 field |
| `PartnerAssignmentSummary` | Aggregation endpoints replace/supplement these counts | `assigned_count`, `in_progress_count`, `completed_count` now come from `CompanyProgress` |
| `CampaignRowData` | Extended with real progress data | `task_completion_pct`, `total_won_amount` now backed by real data |
