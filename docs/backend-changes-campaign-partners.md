# Backend Changes: Campaign Partners Progress Metrics

## Summary

The `GET /api/v1/campaigns/{slug}/partners` endpoint currently returns `PartnerAssignmentSummary` objects with an `assigned_count` field. The frontend needs additional progress metrics to display campaign progress per partner.

## Required New Fields on `PartnerAssignmentSummary`

| Field | Type | Description |
|-------|------|-------------|
| `in_progress_count` | `integer` | Number of companies currently in progress for this partner in the campaign |
| `completed_count` | `integer` | Number of companies completed (closed won/lost) by this partner in the campaign |
| `task_completion_pct` | `float` (0–100) | Percentage of task completion across in-progress companies for this partner |

## Context

These fields power the `CampaignProgress` bar displayed on each partner row in the campaign partners list view. The progress bar visualizes how far along each partner is in processing their assigned companies:

- **Green segment**: Companies in progress
- **Striped segment**: Task completion within in-progress companies
- **Dark segment**: Completed companies
- **Empty segment**: Remaining companies

## Derivation Logic (Suggestion)

```
assigned_count = total companies assigned to this partner in the campaign
in_progress_count = count where status IN ('in_progress', 'sent', 'replied')
completed_count = count where status IN ('closed_won', 'closed_lost', 'meeting_booked')
task_completion_pct = average task completion across in_progress companies (or 0 if none)
```

## Priority

Required before the campaign partners page ships to production.
