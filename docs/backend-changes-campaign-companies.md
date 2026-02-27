# Backend Changes Required for Campaign Companies Page

The frontend companies page (`/campaigns/{slug}/companies`) sends filter and search
query parameters that the backend does not yet handle. Until these are implemented,
the frontend applies client-side fallbacks that only cover the current page of results.

---

## 1. Add `status` query parameter

**Endpoint:** `GET /api/v1/campaigns/{slug}/companies`

**Parameter:** `status` (string, optional)

**Accepted values:** `new`, `in_progress`, `closed_won`, `closed_lost`, `default`

**Behaviour:** Return only memberships whose lifecycle status matches the given value.

**Current frontend workaround:** The frontend derives status heuristically:
- `!is_processed` → `new`
- `is_processed && partner_id` → `in_progress`
- otherwise → `default`

The backend should own this as a first-class field (see item 4 below).

---

## 2. Add `partner_id` query parameter

**Endpoint:** `GET /api/v1/campaigns/{slug}/companies`

**Parameter:** `partner_id` (string or int, optional)

**Behaviour:** Return only memberships assigned to the given partner. A special value
`unassigned` (or absence of partner assignment) should return memberships with no
partner.

**Current frontend workaround:** Client-side filtering on the `partner_id` field of
`MembershipRead`, which only covers the current page.

---

## 3. Add `search` query parameter

**Endpoint:** `GET /api/v1/campaigns/{slug}/companies`

**Parameter:** `search` (string, optional)

**Behaviour:** Case-insensitive substring match against `company_name` and `domain`.
Should work with pagination (search + page + page_size).

**Current frontend workaround:** Client-side search on the current page only. Users
cannot find companies on other pages.

---

## 4. Add `status` field to `MembershipRead` response

The `MembershipRead` schema does not include a lifecycle status. The frontend currently
derives it from `is_processed` and `partner_id`, which is fragile and may diverge from
backend business logic.

**Proposed field:** `status: string | null`

**Values:** `new`, `in_progress`, `closed_won`, `closed_lost`, `default`

This requires either:
- A new `status` column on the campaign membership model, or
- A computed field in the serializer based on existing data.

---

## 5. Optional: Add `partner_logo_url` to `MembershipRead`

The `CompanyRow` component renders partner logos, but `MembershipRead` only includes
`partner_id` and `partner_name`. Adding `partner_logo_url` (joined from the partners
table) would enable partner logos without a separate API call.

---

## 6. Optional: Add `revenue` to `MembershipRead`

The `CompanyRow` component supports rendering company revenue, but `MembershipRead`
does not include it. Consider joining the `revenue` field from the companies table.
