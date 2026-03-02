# Centralized Entity Models & Store — Implementation Guide

## Context

Entity logic is fragmented: `deriveCompanyStatus` and `isNewOpportunity` compute the same concept in different places, scores are normalized ad-hoc, and the same data gets fetched multiple times with no caching or identity map. This introduces Ember Data-inspired **models** + a **Zustand store** + **serializers**, scoped to the redesigned campaign routes (`/campaigns/[slug]/*`).

**Scope:** Only the redesigned routes — campaigns list and `/campaigns/[slug]` (overview, companies, partners, settings). Legacy routes (partner portal, accounts) are untouched.

---

## Step 1: Install Zustand + Create Foundation Files

### 1.1 Install dependency

```bash
npm install zustand
```

### 1.2 Create `lib/models/types.ts`

Shared types used by all entity slices.

```typescript
/** Loading state for a store record */
export type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

/** How much data has been loaded for a record */
export type DataDepth = 'summary' | 'detail';

/** Wrapper around each cached entity in the store */
export interface StoreRecord<T> {
  data: T;
  loadState: LoadState;
  /** ISO timestamp of last successful fetch */
  loadedAt: string | null;
  error: string | null;
}

/** Default staleness threshold (5 minutes) */
export const DEFAULT_STALE_MS = 5 * 60 * 1000;

/** Check if a record is stale */
export function isRecordStale(record: StoreRecord<unknown> | undefined, maxAgeMs = DEFAULT_STALE_MS): boolean {
  if (!record || record.loadState !== 'loaded' || !record.loadedAt) return true;
  return Date.now() - new Date(record.loadedAt).getTime() > maxAgeMs;
}

/** Create a fresh "loading" record */
export function loadingRecord<T>(data: T): StoreRecord<T> {
  return { data, loadState: 'loading', loadedAt: null, error: null };
}

/** Create a "loaded" record */
export function loadedRecord<T>(data: T): StoreRecord<T> {
  return { data, loadState: 'loaded', loadedAt: new Date().toISOString(), error: null };
}

/** Create an "error" record */
export function errorRecord<T>(data: T, error: string): StoreRecord<T> {
  return { data, loadState: 'error', loadedAt: null, error };
}
```

### 1.3 Create `lib/models/store.ts` (placeholder — will be filled after slices)

```typescript
import { create } from 'zustand';
// Slices will be imported here in Step 2-4

// Placeholder — will be populated as slices are created
export const useStore = create(() => ({}));
```

### Verify Step 1
- `npm run build` passes
- `npm run lint` passes
- No runtime changes yet

---

## Step 2: Company Model + Serializer + Slice + Hooks

### 2.1 Create `lib/models/company/Company.ts`

The Company model class. Encapsulates all company business logic.

**Logic migrated from `lib/utils.ts`:**
- `deriveCompanyStatus()` (line 44-60) → `Company.status` getter
- `isNewOpportunity()` (line 32-35) → `Company.isNew` getter
- `normalizeScore()` / `normalizeScoreNullable()` (line 82-89) → `Company.fitScoreNormalized(productId?)` method + `Company.campaignFitScore` getter

```typescript
import type { CompanyStatusValue } from '@/components/ui/company-status';

const NEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

/** Per-product fit score data. A company can have fit scores for multiple products. */
export interface CompanyFit {
  productId: number;
  productName: string;
  likelihoodScore: number;
  urgencyScore: number;
  combinedScore: number;
  topDrivers: string[];
  calculatedAt: string;
}

/** Normalized company data stored in the identity map */
export interface CompanyData {
  // Identity
  id: number;
  domain: string;
  name: string;
  dataDepth: 'summary' | 'detail';

  // Summary fields (always present after any fetch)
  industry: string | null;
  employeeCount: number | null;
  hqCity: string | null;
  hqCountry: string | null;
  logoUrl: string | null;
  logoBase64: string | null;
  ratingOverall: number | null;
  dataSources: string[];
  updatedAt: string;

  // Per-product fit scores (keyed by product ID)
  // Populated from CompanyDetailResponse.fits (FitInclude[]) or fit comparison endpoints.
  // In list views (MembershipRead), the campaign's target-product score is cached in membership instead.
  fits: Record<number, CompanyFit>;

  // Campaign membership context (from MembershipRead, optional)
  membership: CompanyMembership | null;

  // Detail fields (populated when dataDepth='detail')
  description: string | null;
  category: string | null;
  specialties: string[];
  technologies: { name: string; category: string | null }[];
  keywords: string[];
  employeeCountRange: string | null;
  companyType: string | null;
  foundedYear: string | null;
  hqAddress: string | null;
  hqState: string | null;
  hqCountryCode: string | null;
  locations: { city: string | null; country: string | null; is_hq: boolean }[];
  websiteUrl: string | null;
  emails: string[];
  phones: string[];
  socialProfiles: { network: string; url: string }[];
  ticker: string | null;
  stockExchange: string | null;
  revenue: string | null;
  fundingRounds: { round_type: string; amount: number | null; date: string | null; investors: string[] }[];
  ratingCulture: number | null;
  ratingCompensation: number | null;
  ratingWorkLife: number | null;
  ratingCareer: number | null;
  ratingManagement: number | null;
  reviewsCount: number | null;
  reviewsUrl: string | null;
  hasPricingPage: boolean | null;
  hasFreeTrial: boolean | null;
  hasDemo: boolean | null;
  hasApiDocs: boolean | null;
  hasMobileApp: boolean | null;
  metaTitle: string | null;
  metaDescription: string | null;
  followersCount: number | null;
  createdAt: string | null;
}

/** Campaign-specific membership data attached to a company */
export interface CompanyMembership {
  campaignSlug: string;
  membershipId: number;
  companyId: number;
  status: string | null;
  progress: number;
  assignedAt: string | null;
  partnerId: string | null;
  partnerName: string | null;
  priority: number;
  notes: string | null;
  segment: string | null;
  isProcessed: boolean;
  /** Cached fit score for the campaign's target product (from MembershipRead) */
  cachedFitScore: number | null;
  cachedLikelihoodScore: number | null;
  cachedUrgencyScore: number | null;
}

/** Empty company data template for initializing partial records */
export function emptyCompanyData(domain: string): CompanyData {
  return {
    id: 0, domain, name: domain, dataDepth: 'summary',
    industry: null, employeeCount: null, hqCity: null, hqCountry: null,
    logoUrl: null, logoBase64: null, ratingOverall: null, dataSources: [],
    updatedAt: '', fits: {}, membership: null, description: null, category: null,
    specialties: [], technologies: [], keywords: [], employeeCountRange: null,
    companyType: null, foundedYear: null, hqAddress: null, hqState: null,
    hqCountryCode: null, locations: [], websiteUrl: null, emails: [], phones: [],
    socialProfiles: [], ticker: null, stockExchange: null, revenue: null,
    fundingRounds: [], ratingCulture: null, ratingCompensation: null,
    ratingWorkLife: null, ratingCareer: null, ratingManagement: null,
    reviewsCount: null, reviewsUrl: null, hasPricingPage: null,
    hasFreeTrial: null, hasDemo: null, hasApiDocs: null, hasMobileApp: null,
    metaTitle: null, metaDescription: null, followersCount: null, createdAt: null,
  };
}

/**
 * Company model — read-only view over normalized CompanyData.
 * All entity logic lives here. Components access computed properties via getters.
 */
export class Company {
  constructor(readonly data: CompanyData) {}

  // --- Identity ---
  get id(): number { return this.data.id; }
  get domain(): string { return this.data.domain; }
  get name(): string { return this.data.name; }
  get dataDepth(): string { return this.data.dataDepth; }

  // --- Display fields ---
  get industry(): string | null { return this.data.industry; }
  get logoUrl(): string | null { return this.data.logoUrl; }
  get logoBase64(): string | null { return this.data.logoBase64; }
  get hqCountry(): string | null { return this.data.hqCountry; }
  get employeeCount(): number | null { return this.data.employeeCount; }
  get revenue(): string | null { return this.data.revenue; }
  get description(): string | null { return this.data.description; }
  get membership(): CompanyMembership | null { return this.data.membership; }

  // --- Computed: Status (replaces deriveCompanyStatus + isNewOpportunity) ---

  /** Unified status derivation. Replaces `deriveCompanyStatus()` from lib/utils.ts:44 */
  get status(): CompanyStatusValue {
    const m = this.data.membership;
    if (!m) return 'default';
    if (m.status === 'closed_won' || m.status === 'closed_lost') return m.status;
    if ((m.progress != null && m.progress > 0) || m.status === 'in_progress') return 'in_progress';
    if (m.assignedAt) {
      const cutoff = Date.now() - NEW_THRESHOLD_MS;
      if (new Date(m.assignedAt).getTime() > cutoff) return 'new';
    }
    return 'default';
  }

  /** Whether this is a new opportunity. Replaces `isNewOpportunity()` from lib/utils.ts:32 */
  get isNew(): boolean {
    return this.status === 'new';
  }

  // --- Computed: Per-product fit scores ---

  /** All per-product fit scores loaded for this company */
  get fits(): CompanyFit[] { return Object.values(this.data.fits); }

  /** Get fit score for a specific product. Returns null if not loaded. */
  fitForProduct(productId: number): CompanyFit | null {
    return this.data.fits[productId] ?? null;
  }

  /** Best fit across all loaded products (highest combined score) */
  get bestFit(): CompanyFit | null {
    const all = this.fits;
    if (all.length === 0) return null;
    return all.reduce((best, f) => f.combinedScore > best.combinedScore ? f : best);
  }

  // --- Computed: Campaign-context scores (from membership cached values) ---

  /**
   * Fit score for the campaign's target product, normalized to 0-100.
   * In list views this uses the cached score from MembershipRead (fast, no extra fetch).
   * For detail views or multi-product context, use `fitForProduct(productId)` instead.
   * Replaces `normalizeScoreNullable()` from lib/utils.ts:86
   */
  get campaignFitScore(): number {
    const s = this.data.membership?.cachedFitScore ?? null;
    if (s == null) return 0;
    return s <= 1 ? s * 100 : s;
  }

  /**
   * Fit score normalized to 0-100 for a given product.
   * Falls back to campaign cached score if no productId given or product not loaded.
   */
  fitScoreNormalized(productId?: number): number {
    if (productId != null) {
      const fit = this.data.fits[productId];
      if (fit) {
        const s = fit.combinedScore;
        return s <= 1 ? s * 100 : s;
      }
    }
    return this.campaignFitScore;
  }

  /** Score category for badge coloring (uses campaign context by default) */
  scoreCategory(productId?: number): 'hot' | 'warm' | 'cold' {
    const score = this.fitScoreNormalized(productId);
    if (score >= 70) return 'hot';
    if (score >= 40) return 'warm';
    return 'cold';
  }

  /** Urgency label for display */
  urgencyLabel(productId?: number): 'Immediate' | 'Near-term' | 'Future' | 'Unknown' {
    let u: number | null = null;
    if (productId != null) {
      u = this.data.fits[productId]?.urgencyScore ?? null;
    }
    if (u == null) {
      u = this.data.membership?.cachedUrgencyScore ?? null;
    }
    if (u == null) return 'Unknown';
    const normalized = u <= 1 ? u * 100 : u;
    if (normalized >= 70) return 'Immediate';
    if (normalized >= 40) return 'Near-term';
    return 'Future';
  }

  // --- Computed: Formatting ---

  /** Formatted employee count (e.g., "1.2K", "3.5M") */
  get employeeCountFormatted(): string {
    const c = this.data.employeeCount;
    if (c == null) return '—';
    if (c >= 1_000_000) return `${(c / 1_000_000).toFixed(1)}M`;
    if (c >= 1_000) return `${(c / 1_000).toFixed(1)}K`;
    return c.toString();
  }

  /** Whether full detail data has been loaded */
  get isDetailLoaded(): boolean {
    return this.data.dataDepth === 'detail';
  }

  // --- Partner assignment (campaign context) ---

  get partnerId(): string | null { return this.data.membership?.partnerId ?? null; }
  get partnerName(): string | null { return this.data.membership?.partnerName ?? null; }
  get assignedAt(): string | null { return this.data.membership?.assignedAt ?? null; }
  get progress(): number { return this.data.membership?.progress ?? 0; }
}
```

### 2.2 Create `lib/models/company/company.serializer.ts`

One function per API response shape. This is the single place where API field names (snake_case) map to model field names (camelCase).

```typescript
import type { CompanySummary, CompanySummaryWithFit, CompanyRead, CompanyDetailResponse, MembershipRead } from '@/lib/schemas';
import type { FitInclude } from '@/lib/schemas/fit';
import type { PartnerCompanyAssignmentWithCompany } from '@/lib/schemas/partner';
import type { CompanyData, CompanyFit, CompanyMembership } from './Company';
import { emptyCompanyData } from './Company';

// --- Fit helpers ---

/** Convert a FitInclude (from CompanyDetailResponse.fits) to our normalized CompanyFit */
function fitFromInclude(raw: FitInclude): CompanyFit {
  return {
    productId: raw.product_id,
    productName: raw.product_name,
    likelihoodScore: raw.likelihood_score,
    urgencyScore: raw.urgency_score,
    combinedScore: raw.combined_score,
    topDrivers: raw.top_drivers ?? [],
    calculatedAt: raw.calculated_at,
  };
}

/** Convert an array of FitInclude to a Record keyed by product ID */
function fitsFromIncludes(raw: FitInclude[] | null | undefined): Record<number, CompanyFit> {
  if (!raw || raw.length === 0) return {};
  const map: Record<number, CompanyFit> = {};
  for (const f of raw) {
    map[f.product_id] = fitFromInclude(f);
  }
  return map;
}

// --- Serializers ---

/** From GET /companies (list view) → CompanySummary */
export function fromSummary(raw: CompanySummary): CompanyData {
  return {
    ...emptyCompanyData(raw.domain),
    id: raw.id,
    name: raw.name,
    dataDepth: 'summary',
    industry: raw.industry,
    employeeCount: raw.employee_count,
    hqCity: raw.hq_city,
    hqCountry: raw.hq_country,
    logoUrl: raw.logo_url,
    logoBase64: raw.logo_base64,
    ratingOverall: raw.rating_overall,
    dataSources: raw.data_sources ?? [],
    updatedAt: raw.updated_at,
  };
}

/**
 * From GET /companies?include=fit → CompanySummaryWithFit
 * Note: These scores have no product_id context (ambiguous). We don't populate `fits`.
 * This serializer is mainly used by legacy routes. In redesigned routes, use
 * fromMembership (campaign list) or fromDetailResponse (company detail) instead.
 */
export function fromSummaryWithFit(raw: CompanySummaryWithFit): CompanyData {
  return fromSummary(raw);
}

/** From GET /campaigns/:slug/companies → MembershipRead */
export function fromMembership(raw: MembershipRead, campaignSlug: string): CompanyData {
  return {
    ...emptyCompanyData(raw.domain),
    id: raw.company_id,
    name: raw.company_name ?? raw.domain,
    dataDepth: 'summary',
    industry: raw.industry,
    employeeCount: raw.employee_count,
    hqCountry: raw.hq_country,
    logoUrl: raw.logo_url ?? null,
    logoBase64: raw.logo_base64 ?? null,
    updatedAt: raw.created_at,
    // Fit scores are cached per-membership for the campaign's target product.
    // They live in membership (not fits map) because we don't have the product_id here.
    membership: {
      campaignSlug,
      membershipId: raw.id,
      companyId: raw.company_id,
      status: raw.segment, // segment doubles as status in current API
      progress: 0,         // progress not in MembershipRead, default to 0
      assignedAt: raw.assigned_at,
      partnerId: raw.partner_id ?? null,
      partnerName: raw.partner_name ?? null,
      priority: raw.priority,
      notes: raw.notes,
      segment: raw.segment,
      isProcessed: raw.is_processed,
      cachedFitScore: raw.cached_fit_score ?? null,
      cachedLikelihoodScore: raw.cached_likelihood_score ?? null,
      cachedUrgencyScore: raw.cached_urgency_score ?? null,
    },
  };
}

/** From GET /companies/:domain → CompanyRead (base detail, no fits) */
export function fromDetail(raw: CompanyRead): CompanyData {
  return {
    ...emptyCompanyData(raw.domain),
    id: raw.id,
    name: raw.name,
    dataDepth: 'detail',
    industry: raw.industry,
    employeeCount: raw.employee_count,
    hqCity: raw.hq_city,
    hqCountry: raw.hq_country,
    logoUrl: raw.logo_url,
    logoBase64: raw.logo_base64,
    ratingOverall: raw.rating_overall,
    dataSources: raw.data_sources ?? [],
    updatedAt: raw.updated_at,
    description: raw.description,
    category: raw.category,
    specialties: raw.specialties ?? [],
    technologies: (raw.technologies ?? []).map(t => ({ name: t.name, category: t.category ?? null })),
    keywords: raw.keywords ?? [],
    employeeCountRange: raw.employee_count_range,
    companyType: raw.company_type,
    foundedYear: raw.founded_year,
    hqAddress: raw.hq_address,
    hqState: raw.hq_state,
    hqCountryCode: raw.hq_country_code,
    locations: (raw.locations ?? []).map(l => ({ city: l.city ?? null, country: l.country ?? null, is_hq: l.is_hq })),
    websiteUrl: raw.website_url,
    emails: raw.emails ?? [],
    phones: raw.phones ?? [],
    socialProfiles: (raw.social_profiles ?? []).map(s => ({ network: s.network, url: s.url })),
    ticker: raw.ticker,
    stockExchange: raw.stock_exchange,
    revenue: raw.revenue,
    fundingRounds: (raw.funding_rounds ?? []).map(f => ({
      round_type: f.round_type, amount: f.amount ?? null, date: f.date ?? null, investors: f.investors ?? [],
    })),
    ratingCulture: raw.rating_culture,
    ratingCompensation: raw.rating_compensation,
    ratingWorkLife: raw.rating_work_life,
    ratingCareer: raw.rating_career,
    ratingManagement: raw.rating_management,
    reviewsCount: raw.reviews_count,
    reviewsUrl: raw.reviews_url,
    hasPricingPage: raw.has_pricing_page,
    hasFreeTrial: raw.has_free_trial,
    hasDemo: raw.has_demo,
    hasApiDocs: raw.has_api_docs,
    hasMobileApp: raw.has_mobile_app,
    metaTitle: raw.meta_title,
    metaDescription: raw.meta_description,
    followersCount: raw.followers_count,
    createdAt: raw.created_at,
  };
}

/**
 * From GET /companies/:domain (full response) → CompanyDetailResponse
 * This is the primary detail serializer — includes per-product fit scores.
 */
export function fromDetailResponse(raw: CompanyDetailResponse): CompanyData {
  const base = fromDetail(raw.company);
  return {
    ...base,
    fits: fitsFromIncludes(raw.fits),
  };
}

/** From GET /campaigns/:slug/partners/:id/companies → PartnerCompanyAssignmentWithCompany */
export function fromPartnerAssignment(raw: PartnerCompanyAssignmentWithCompany, campaignSlug: string): CompanyData {
  const base = fromSummary(raw.company);
  return {
    ...base,
    membership: {
      campaignSlug,
      membershipId: raw.id,
      companyId: raw.company_id,
      status: raw.status,
      progress: 0,
      assignedAt: raw.assigned_at,
      partnerId: null,
      partnerName: null,
      priority: 0,
      notes: raw.notes,
      segment: null,
      isProcessed: false,
      cachedFitScore: null,
      cachedLikelihoodScore: null,
      cachedUrgencyScore: null,
    },
  };
}

/**
 * Merge incoming data into an existing record.
 * Detail data enriches summary; summary data doesn't overwrite detail.
 * Membership is always replaced when present in incoming.
 * Fits are merged (incoming product entries overwrite, existing are preserved).
 */
export function mergeCompanyData(existing: CompanyData, incoming: Partial<CompanyData>): CompanyData {
  const merged = { ...existing };

  // If incoming has higher data depth, take all its fields
  if (incoming.dataDepth === 'detail' && existing.dataDepth === 'summary') {
    Object.assign(merged, incoming);
    // Still merge fits additively (detail fetch may add products, keep any from membership context)
    merged.fits = { ...existing.fits, ...incoming.fits };
    return merged;
  }

  // Otherwise, only update non-null fields from incoming
  for (const [key, value] of Object.entries(incoming)) {
    if (key === 'fits' || key === 'membership') continue; // handled below
    if (value != null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
      (merged as any)[key] = value;
    }
  }

  // Fits are merged additively — incoming product entries overwrite, existing are preserved
  if (incoming.fits && Object.keys(incoming.fits).length > 0) {
    merged.fits = { ...existing.fits, ...incoming.fits };
  }

  // Membership is always replaced when present
  if (incoming.membership !== undefined) {
    merged.membership = incoming.membership;
  }

  return merged;
}
```

### 2.3 Create `lib/models/company/company.slice.ts`

Zustand slice managing the company identity map.

```typescript
import type { StateCreator } from 'zustand';
import type { StoreRecord } from '../types';
import { isRecordStale, loadedRecord } from '../types';
import type { CompanyData } from './Company';
import { Company, emptyCompanyData } from './Company';
import { fromMembership, fromDetailResponse, mergeCompanyData, fromPartnerAssignment } from './company.serializer';
import { getCampaignCompanies, getCompany } from '@/lib/api';
import type { PartnerCompanyAssignmentWithCompany } from '@/lib/schemas/partner';

export interface CompanySlice {
  /** Identity map: domain → StoreRecord<CompanyData> */
  companies: Record<string, StoreRecord<CompanyData>>;

  // Mutations
  upsertCompany: (data: CompanyData) => void;
  upsertCompanies: (items: CompanyData[]) => void;
  setCompanyLoading: (domain: string) => void;
  setCompanyError: (domain: string, error: string) => void;
  invalidateCompany: (domain: string) => void;
  invalidateAllCompanies: () => void;

  // Async actions
  fetchCompanyDetail: (domain: string, opts?: { force?: boolean }) => Promise<Company>;
  fetchCampaignCompanies: (
    slug: string,
    opts?: { page?: number; page_size?: number; sort_by?: string; sort_order?: string; status?: string; partner_id?: string }
  ) => Promise<{ items: Company[]; total: number }>;

  // Helpers
  getCompany: (domain: string) => Company | null;
  isCompanyStale: (domain: string, maxAgeMs?: number) => boolean;

  // Upsert from partner assignment responses
  upsertFromPartnerAssignments: (items: PartnerCompanyAssignmentWithCompany[], campaignSlug: string) => Company[];
}

/** In-flight request deduplication map */
const inflight = new Map<string, Promise<Company>>();

export const createCompanySlice: StateCreator<CompanySlice, [], [], CompanySlice> = (set, get) => ({
  companies: {},

  upsertCompany: (data) => set((state) => {
    const existing = state.companies[data.domain];
    const merged = existing ? mergeCompanyData(existing.data, data) : data;
    return {
      companies: { ...state.companies, [data.domain]: loadedRecord(merged) },
    };
  }),

  upsertCompanies: (items) => set((state) => {
    const updated = { ...state.companies };
    for (const item of items) {
      const existing = updated[item.domain];
      const merged = existing ? mergeCompanyData(existing.data, item) : item;
      updated[item.domain] = loadedRecord(merged);
    }
    return { companies: updated };
  }),

  setCompanyLoading: (domain) => set((state) => ({
    companies: {
      ...state.companies,
      [domain]: {
        data: state.companies[domain]?.data ?? emptyCompanyData(domain),
        loadState: 'loading',
        loadedAt: state.companies[domain]?.loadedAt ?? null,
        error: null,
      },
    },
  })),

  setCompanyError: (domain, error) => set((state) => ({
    companies: {
      ...state.companies,
      [domain]: {
        data: state.companies[domain]?.data ?? emptyCompanyData(domain),
        loadState: 'error',
        loadedAt: null,
        error,
      },
    },
  })),

  invalidateCompany: (domain) => set((state) => {
    const record = state.companies[domain];
    if (!record) return state;
    return {
      companies: {
        ...state.companies,
        [domain]: { ...record, loadedAt: null },
      },
    };
  }),

  invalidateAllCompanies: () => set((state) => {
    const updated: Record<string, StoreRecord<CompanyData>> = {};
    for (const [domain, record] of Object.entries(state.companies)) {
      updated[domain] = { ...record, loadedAt: null };
    }
    return { companies: updated };
  }),

  fetchCompanyDetail: async (domain, opts) => {
    const { force = false } = opts ?? {};
    const existing = get().companies[domain];

    // Return cached if fresh and not forced
    if (!force && existing && !get().isCompanyStale(domain)) {
      return new Company(existing.data);
    }

    // Deduplicate in-flight requests
    const key = `detail:${domain}`;
    if (inflight.has(key)) return inflight.get(key)!;

    const promise = (async () => {
      get().setCompanyLoading(domain);
      try {
        const response = await getCompany(domain);
        const data = fromDetailResponse(response); // includes per-product fits
        get().upsertCompany(data);
        return new Company(get().companies[domain].data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch company';
        get().setCompanyError(domain, msg);
        throw err;
      } finally {
        inflight.delete(key);
      }
    })();

    inflight.set(key, promise);
    return promise;
  },

  fetchCampaignCompanies: async (slug, opts) => {
    const response = await getCampaignCompanies(slug, opts);
    const items = response.items.map((m) => fromMembership(m, slug));
    get().upsertCompanies(items);
    return {
      items: items.map((d) => new Company(get().companies[d.domain].data)),
      total: response.total,
    };
  },

  getCompany: (domain) => {
    const record = get().companies[domain];
    return record ? new Company(record.data) : null;
  },

  isCompanyStale: (domain, maxAgeMs) => {
    return isRecordStale(get().companies[domain], maxAgeMs);
  },

  upsertFromPartnerAssignments: (items, campaignSlug) => {
    const companyDataList = items.map((a) => fromPartnerAssignment(a, campaignSlug));
    get().upsertCompanies(companyDataList);
    return companyDataList.map((d) => new Company(get().companies[d.domain].data));
  },
});
```

### 2.4 Create `lib/models/company/useCompanyStore.ts`

React hooks that bridge the store to components.

```typescript
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useStore } from '../store';
import { Company } from './Company';

/**
 * Get a single company by domain. Auto-fetches detail if not cached.
 * Returns a Company model instance.
 */
export function useCompanyDetail(domain: string | null, enabled = true) {
  const fetchCompanyDetail = useStore((s) => s.fetchCompanyDetail);
  const record = useStore((s) => (domain ? s.companies[domain] : undefined));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domain || !enabled) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    fetchCompanyDetail(domain)
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [domain, enabled, fetchCompanyDetail]);

  const company = useMemo(
    () => (record?.data ? new Company(record.data) : null),
    [record?.data],
  );

  const refetch = useCallback(() => {
    if (domain) return fetchCompanyDetail(domain, { force: true }).then(() => {});
    return Promise.resolve();
  }, [domain, fetchCompanyDetail]);

  return { company, loading, error, refetch };
}

/**
 * Get campaign companies with pagination, filtering, sorting.
 * Replaces the existing useCampaignCompanies hook.
 */
export function useCampaignCompanyList(
  slug: string,
  opts: {
    enabled?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: string;
    partnerId?: string;
  } = {},
) {
  const { enabled = true, page = 1, pageSize = 50, sortBy, sortOrder, status, partnerId } = opts;
  const fetchCampaignCompanies = useStore((s) => s.fetchCampaignCompanies);
  const companiesMap = useStore((s) => s.companies);

  const [domains, setDomains] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef(0);

  useEffect(() => {
    if (!enabled || !slug) return;
    let cancelled = false;
    const version = ++versionRef.current;

    setLoading(true);
    setError(null);
    fetchCampaignCompanies(slug, {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
      status,
      partner_id: partnerId,
    })
      .then((result) => {
        if (cancelled || version !== versionRef.current) return;
        setDomains(result.items.map((c) => c.domain));
        setTotal(result.total);
      })
      .catch((err) => {
        if (cancelled || version !== versionRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => {
        if (cancelled || version !== versionRef.current) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [slug, enabled, page, pageSize, sortBy, sortOrder, status, partnerId, fetchCampaignCompanies]);

  const companies = useMemo(
    () => domains.map((d) => companiesMap[d]).filter(Boolean).map((r) => new Company(r.data)),
    [domains, companiesMap],
  );

  const refetch = useCallback(() => {
    versionRef.current++;
    setLoading(true);
    return fetchCampaignCompanies(slug, { page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder })
      .then((result) => {
        setDomains(result.items.map((c) => c.domain));
        setTotal(result.total);
      })
      .finally(() => setLoading(false));
  }, [slug, page, pageSize, sortBy, sortOrder, fetchCampaignCompanies]);

  return { companies, total, loading, error, refetch };
}
```

### Verify Step 2
- `npm run build` passes (new files, nothing consumed yet)
- Write unit tests for `Company` class computed properties
- Write unit tests for serializer `from*` functions

---

## Step 3: Campaign Model + Serializer + Slice + Hooks

### 3.1 Create `lib/models/campaign/Campaign.ts`

```typescript
import type { CampaignSegment, FitDistribution } from '@/lib/schemas/campaign';

/** Normalized campaign data stored in the identity map */
export interface CampaignData {
  id: number;
  slug: string;        // primary key
  name: string;
  status: string;
  icon: string | null;
  description: string | null;
  /**
   * Primary target product. The API currently returns `target_product_id: number | null`.
   * For multi-product campaigns, this is the "primary" product used for cached fit scores
   * in MembershipRead. Additional product IDs may be in targetProductIds.
   */
  targetProductId: number | null;
  /**
   * All product IDs associated with this campaign.
   * Currently derived from targetProductId (single element or empty), but ready for when
   * the API supports multiple products per campaign.
   */
  targetProductIds: number[];
  companyCount: number;
  processedCount: number;
  avgFitScore: number | null;
  owner: string | null;
  tags: string[];
  targetCriteria: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;

  // Overview data (merged when overview is fetched)
  overview: CampaignOverviewData | null;
}

export interface CampaignOverviewData {
  segments: CampaignSegment[];
  fitDistribution: FitDistribution;
  industryBreakdown: Record<string, number>;
  processingProgress: number;
  productName: string | null;
}

export function emptyCampaignData(slug: string): CampaignData {
  return {
    id: 0, slug, name: slug, status: 'draft', icon: null, description: null,
    targetProductId: null, targetProductIds: [],
    companyCount: 0, processedCount: 0, avgFitScore: null,
    owner: null, tags: [], targetCriteria: null, createdAt: '', updatedAt: '',
    overview: null,
  };
}

/**
 * Campaign model — read-only view over normalized CampaignData.
 */
export class Campaign {
  constructor(readonly data: CampaignData) {}

  get id(): number { return this.data.id; }
  get slug(): string { return this.data.slug; }
  get name(): string { return this.data.name; }
  get status(): string { return this.data.status; }
  get icon(): string | null { return this.data.icon; }
  get description(): string | null { return this.data.description; }
  /** Primary target product ID (used for cached fit scores in list views) */
  get targetProductId(): number | null { return this.data.targetProductId; }
  /** All product IDs associated with this campaign */
  get targetProductIds(): number[] { return this.data.targetProductIds; }
  get companyCount(): number { return this.data.companyCount; }
  get avgFitScore(): number | null { return this.data.avgFitScore; }
  get owner(): string | null { return this.data.owner; }
  get tags(): string[] { return this.data.tags; }
  get targetCriteria(): Record<string, any> | null { return this.data.targetCriteria; }
  get createdAt(): string { return this.data.createdAt; }
  get updatedAt(): string { return this.data.updatedAt; }
  get overview(): CampaignOverviewData | null { return this.data.overview; }

  // --- Computed properties ---

  get isPublished(): boolean { return this.data.status === 'published'; }
  get isDraft(): boolean { return this.data.status === 'draft'; }
  get isMultiProduct(): boolean { return this.data.targetProductIds.length > 1; }

  get processingProgress(): number {
    if (this.data.overview) return this.data.overview.processingProgress;
    if (this.data.companyCount === 0) return 0;
    return Math.round((this.data.processedCount / this.data.companyCount) * 100);
  }

  get hasOverview(): boolean { return this.data.overview !== null; }
  get productName(): string | null { return this.data.overview?.productName ?? null; }
}
```

### 3.2 Create `lib/models/campaign/campaign.serializer.ts`

```typescript
import type { CampaignRead, CampaignSummary, CampaignOverview, CampaignUpdate } from '@/lib/schemas/campaign';
import type { CampaignData, CampaignOverviewData } from './Campaign';
import { emptyCampaignData } from './Campaign';

/** Derive targetProductIds from a single target_product_id (forward-compatible) */
function productIds(targetProductId: number | null): number[] {
  return targetProductId != null ? [targetProductId] : [];
}

/** From GET /campaigns/:slug → CampaignRead */
export function fromCampaignRead(raw: CampaignRead): CampaignData {
  return {
    ...emptyCampaignData(raw.slug),
    id: raw.id,
    name: raw.name,
    status: raw.status,
    icon: raw.icon,
    description: raw.description,
    targetProductId: raw.target_product_id,
    targetProductIds: productIds(raw.target_product_id),
    companyCount: raw.company_count,
    processedCount: raw.processed_count,
    avgFitScore: raw.avg_fit_score,
    owner: raw.owner,
    tags: raw.tags ?? [],
    targetCriteria: raw.target_criteria,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** From GET /campaigns → CampaignSummary (list) */
export function fromCampaignSummary(raw: CampaignSummary): CampaignData {
  return {
    ...emptyCampaignData(raw.slug),
    id: raw.id,
    name: raw.name,
    status: raw.status,
    targetProductId: raw.target_product_id,
    targetProductIds: productIds(raw.target_product_id),
    companyCount: raw.company_count,
    processedCount: raw.processed_count,
    avgFitScore: raw.avg_fit_score,
    owner: raw.owner,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** From GET /campaigns/:slug/overview → CampaignOverview (includes campaign + overview data) */
export function fromOverview(raw: CampaignOverview): CampaignData {
  const base = fromCampaignRead(raw);
  return {
    ...base,
    overview: {
      segments: raw.segments,
      fitDistribution: raw.fit_distribution,
      industryBreakdown: raw.industry_breakdown,
      processingProgress: raw.processing_progress,
      productName: raw.product_name,
    },
  };
}

/** Convert model changes back to API update payload */
export function toUpdatePayload(changes: Partial<CampaignData>): CampaignUpdate {
  const payload: CampaignUpdate = {};
  if (changes.name !== undefined) payload.name = changes.name;
  if (changes.description !== undefined) payload.description = changes.description;
  if (changes.icon !== undefined) payload.icon = changes.icon;
  if (changes.status !== undefined) payload.status = changes.status;
  if (changes.owner !== undefined) payload.owner = changes.owner;
  if (changes.tags !== undefined) payload.tags = changes.tags;
  if (changes.targetCriteria !== undefined) payload.target_criteria = changes.targetCriteria;
  if (changes.targetProductId !== undefined) payload.target_product_id = changes.targetProductId;
  return payload;
}

/** Merge overview data into existing campaign record */
export function mergeCampaignData(existing: CampaignData, incoming: Partial<CampaignData>): CampaignData {
  return {
    ...existing,
    ...incoming,
    // Overview is merged, not replaced
    overview: incoming.overview ?? existing.overview,
    // Product IDs: union of existing and incoming (for multi-product support)
    targetProductIds: incoming.targetProductIds && incoming.targetProductIds.length > 0
      ? [...new Set([...existing.targetProductIds, ...incoming.targetProductIds])]
      : existing.targetProductIds,
  };
}
```

### 3.3 Create `lib/models/campaign/campaign.slice.ts`

```typescript
import type { StateCreator } from 'zustand';
import type { StoreRecord } from '../types';
import { isRecordStale, loadedRecord } from '../types';
import type { CampaignData } from './Campaign';
import { Campaign, emptyCampaignData } from './Campaign';
import { fromCampaignRead, fromOverview, mergeCampaignData, toUpdatePayload } from './campaign.serializer';
import {
  getCampaign, getCampaignOverview, updateCampaign as apiUpdateCampaign,
  publishCampaign as apiPublishCampaign, unpublishCampaign as apiUnpublishCampaign,
  deleteCampaign as apiDeleteCampaign,
} from '@/lib/api';

export interface CampaignSlice {
  campaigns: Record<string, StoreRecord<CampaignData>>;

  upsertCampaign: (data: CampaignData) => void;
  setCampaignLoading: (slug: string) => void;
  setCampaignError: (slug: string, error: string) => void;
  invalidateCampaign: (slug: string) => void;

  // Async actions
  fetchCampaign: (slug: string, opts?: { force?: boolean }) => Promise<Campaign>;
  updateCampaignAction: (slug: string, changes: Partial<CampaignData>) => Promise<Campaign>;
  publishCampaignAction: (slug: string) => Promise<Campaign>;
  unpublishCampaignAction: (slug: string) => Promise<Campaign>;
  deleteCampaignAction: (slug: string) => Promise<void>;

  // Helpers
  getCampaignModel: (slug: string) => Campaign | null;
  isCampaignStale: (slug: string, maxAgeMs?: number) => boolean;
}

const inflight = new Map<string, Promise<Campaign>>();

export const createCampaignSlice: StateCreator<CampaignSlice, [], [], CampaignSlice> = (set, get) => ({
  campaigns: {},

  upsertCampaign: (data) => set((state) => {
    const existing = state.campaigns[data.slug];
    const merged = existing ? mergeCampaignData(existing.data, data) : data;
    return { campaigns: { ...state.campaigns, [data.slug]: loadedRecord(merged) } };
  }),

  setCampaignLoading: (slug) => set((state) => ({
    campaigns: {
      ...state.campaigns,
      [slug]: {
        data: state.campaigns[slug]?.data ?? emptyCampaignData(slug),
        loadState: 'loading', loadedAt: state.campaigns[slug]?.loadedAt ?? null, error: null,
      },
    },
  })),

  setCampaignError: (slug, error) => set((state) => ({
    campaigns: {
      ...state.campaigns,
      [slug]: {
        data: state.campaigns[slug]?.data ?? emptyCampaignData(slug),
        loadState: 'error', loadedAt: null, error,
      },
    },
  })),

  invalidateCampaign: (slug) => set((state) => {
    const record = state.campaigns[slug];
    if (!record) return state;
    return { campaigns: { ...state.campaigns, [slug]: { ...record, loadedAt: null } } };
  }),

  fetchCampaign: async (slug, opts) => {
    const { force = false } = opts ?? {};
    const existing = get().campaigns[slug];
    if (!force && existing && !get().isCampaignStale(slug)) {
      return new Campaign(existing.data);
    }

    const key = `campaign:${slug}`;
    if (inflight.has(key)) return inflight.get(key)!;

    const promise = (async () => {
      get().setCampaignLoading(slug);
      try {
        const [campaignRaw, overviewRaw] = await Promise.all([
          getCampaign(slug),
          getCampaignOverview(slug),
        ]);
        const campaignData = fromCampaignRead(campaignRaw);
        const overviewData = fromOverview(overviewRaw);
        const merged = mergeCampaignData(campaignData, overviewData);
        get().upsertCampaign(merged);
        return new Campaign(get().campaigns[slug].data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch campaign';
        get().setCampaignError(slug, msg);
        throw err;
      } finally {
        inflight.delete(key);
      }
    })();

    inflight.set(key, promise);
    return promise;
  },

  updateCampaignAction: async (slug, changes) => {
    const payload = toUpdatePayload(changes);
    const updated = await apiUpdateCampaign(slug, payload);
    const data = fromCampaignRead(updated);
    get().upsertCampaign(data);
    return new Campaign(get().campaigns[slug].data);
  },

  publishCampaignAction: async (slug) => {
    const updated = await apiPublishCampaign(slug);
    const data = fromCampaignRead(updated);
    get().upsertCampaign(data);
    return new Campaign(get().campaigns[slug].data);
  },

  unpublishCampaignAction: async (slug) => {
    const updated = await apiUnpublishCampaign(slug);
    const data = fromCampaignRead(updated);
    get().upsertCampaign(data);
    return new Campaign(get().campaigns[slug].data);
  },

  deleteCampaignAction: async (slug) => {
    await apiDeleteCampaign(slug);
    set((state) => {
      const { [slug]: _, ...rest } = state.campaigns;
      return { campaigns: rest };
    });
  },

  getCampaignModel: (slug) => {
    const record = get().campaigns[slug];
    return record ? new Campaign(record.data) : null;
  },

  isCampaignStale: (slug, maxAgeMs) => isRecordStale(get().campaigns[slug], maxAgeMs),
});
```

### 3.4 Create `lib/models/campaign/useCampaignStore.ts`

```typescript
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useStore } from '../store';
import { Campaign } from './Campaign';
import type { CampaignData } from './Campaign';

/**
 * Access a campaign by slug. Auto-fetches if not in store or stale.
 * Replaces useCampaignDetail() from CampaignDetailProvider.
 */
export function useCampaign(slug: string) {
  const fetchCampaign = useStore((s) => s.fetchCampaign);
  const updateCampaignAction = useStore((s) => s.updateCampaignAction);
  const publishCampaignAction = useStore((s) => s.publishCampaignAction);
  const unpublishCampaignAction = useStore((s) => s.unpublishCampaignAction);
  const deleteCampaignAction = useStore((s) => s.deleteCampaignAction);
  const record = useStore((s) => s.campaigns[slug]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCampaign(slug)
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, fetchCampaign]);

  const campaign = useMemo(
    () => (record?.data ? new Campaign(record.data) : null),
    [record?.data],
  );

  const refresh = useCallback(
    () => fetchCampaign(slug, { force: true }).then(() => {}),
    [slug, fetchCampaign],
  );

  const update = useCallback(
    (changes: Partial<CampaignData>) => updateCampaignAction(slug, changes).then(() => {}),
    [slug, updateCampaignAction],
  );

  const publish = useCallback(async () => {
    setIsPublishing(true);
    try { await publishCampaignAction(slug); }
    finally { setIsPublishing(false); }
  }, [slug, publishCampaignAction]);

  const unpublish = useCallback(async () => {
    setIsUnpublishing(true);
    try { await unpublishCampaignAction(slug); }
    finally { setIsUnpublishing(false); }
  }, [slug, unpublishCampaignAction]);

  const remove = useCallback(
    () => deleteCampaignAction(slug),
    [slug, deleteCampaignAction],
  );

  return { campaign, loading, error, isPublishing, isUnpublishing, refresh, update, publish, unpublish, remove };
}
```

### Verify Step 3
- `npm run build` passes
- Write unit tests for `Campaign` class
- Write unit tests for campaign serializers

---

## Step 4: Partner Model + Serializer + Slice + Hooks

### 4.1 Create `lib/models/partner/Partner.ts`

```typescript
/** Normalized partner data stored in the identity map */
export interface PartnerData {
  id: number;          // primary key
  name: string;
  slug: string;
  description: string | null;
  status: string;
  logoUrl: string | null;
  partnerType: string | null;
  industries: string[];
  capacity: number | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;

  // Campaign assignment stats (from PartnerAssignmentSummary)
  assignment: PartnerAssignment | null;
}

export interface PartnerAssignment {
  assignmentId: number;
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  taskCompletionPct: number;
  roleInCampaign: string | null;
  assignedAt: string;
  assignedBy: string | null;
}

export function emptyPartnerData(id: number): PartnerData {
  return {
    id, name: '', slug: '', description: null, status: 'active', logoUrl: null,
    partnerType: null, industries: [], capacity: null, website: null,
    createdAt: '', updatedAt: '', assignment: null,
  };
}

/**
 * Partner model — read-only view over normalized PartnerData.
 */
export class Partner {
  constructor(readonly data: PartnerData) {}

  get id(): number { return this.data.id; }
  get name(): string { return this.data.name; }
  get slug(): string { return this.data.slug; }
  get description(): string | null { return this.data.description; }
  get status(): string { return this.data.status; }
  get logoUrl(): string | null { return this.data.logoUrl; }
  get partnerType(): string | null { return this.data.partnerType; }
  get industries(): string[] { return this.data.industries; }
  get capacity(): number | null { return this.data.capacity; }
  get assignment(): PartnerAssignment | null { return this.data.assignment; }

  // --- Computed ---

  get isActive(): boolean { return this.data.status === 'active'; }

  get capacityRemaining(): number | null {
    if (this.data.capacity == null || !this.data.assignment) return this.data.capacity;
    return Math.max(0, this.data.capacity - this.data.assignment.assignedCount);
  }

  get completionRate(): number {
    const a = this.data.assignment;
    if (!a || a.assignedCount === 0) return 0;
    return Math.round((a.completedCount / a.assignedCount) * 100);
  }

  get assignedCount(): number { return this.data.assignment?.assignedCount ?? 0; }
  get inProgressCount(): number { return this.data.assignment?.inProgressCount ?? 0; }
  get completedCount(): number { return this.data.assignment?.completedCount ?? 0; }
  get taskCompletionPct(): number { return this.data.assignment?.taskCompletionPct ?? 0; }
}
```

### 4.2 Create `lib/models/partner/partner.serializer.ts`

```typescript
import type { PartnerRead, PartnerSummary, PartnerAssignmentSummary } from '@/lib/schemas/partner';
import type { PartnerData } from './Partner';
import { emptyPartnerData } from './Partner';

/** From GET /partners/:id → PartnerRead */
export function fromPartnerRead(raw: PartnerRead): PartnerData {
  return {
    ...emptyPartnerData(raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    status: raw.status,
    logoUrl: raw.logo_url,
    industries: raw.industries ?? [],
    capacity: raw.capacity,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** From GET /partners → PartnerSummary (list) */
export function fromPartnerSummary(raw: PartnerSummary): PartnerData {
  return {
    ...emptyPartnerData(raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    status: raw.status,
    logoUrl: raw.logo_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

/** From GET /campaigns/:slug/partners → PartnerAssignmentSummary */
export function fromAssignmentSummary(raw: PartnerAssignmentSummary): PartnerData {
  return {
    id: raw.partner_id,
    name: raw.partner_name,
    slug: raw.partner_slug,
    description: raw.partner_description,
    status: raw.partner_status,
    logoUrl: raw.partner_logo_url,
    partnerType: raw.partner_type,
    industries: raw.partner_industries ?? [],
    capacity: raw.partner_capacity,
    website: raw.partner_website ?? null,
    createdAt: '',
    updatedAt: '',
    assignment: {
      assignmentId: raw.id,
      assignedCount: raw.assigned_count,
      inProgressCount: raw.in_progress_count,
      completedCount: raw.completed_count,
      taskCompletionPct: raw.task_completion_pct,
      roleInCampaign: raw.role_in_campaign,
      assignedAt: raw.assigned_at,
      assignedBy: raw.assigned_by ?? null,
    },
  };
}

/** Merge partner data (assignment info always replaces) */
export function mergePartnerData(existing: PartnerData, incoming: Partial<PartnerData>): PartnerData {
  return {
    ...existing,
    ...incoming,
    assignment: incoming.assignment ?? existing.assignment,
  };
}
```

### 4.3 Create `lib/models/partner/partner.slice.ts`

```typescript
import type { StateCreator } from 'zustand';
import type { StoreRecord } from '../types';
import { isRecordStale, loadedRecord } from '../types';
import type { PartnerData } from './Partner';
import { Partner, emptyPartnerData } from './Partner';
import { fromAssignmentSummary, mergePartnerData } from './partner.serializer';
import { getCampaignPartners } from '@/lib/api';

export interface PartnerSlice {
  partners: Record<string, StoreRecord<PartnerData>>;  // keyed by id (as string)

  upsertPartner: (data: PartnerData) => void;
  upsertPartners: (items: PartnerData[]) => void;
  invalidatePartner: (id: number) => void;
  invalidateAllPartners: () => void;

  // Async actions
  fetchCampaignPartners: (slug: string, opts?: { force?: boolean }) => Promise<Partner[]>;

  // Helpers
  getPartnerModel: (id: number) => Partner | null;
  isPartnerStale: (id: number, maxAgeMs?: number) => boolean;
}

const inflight = new Map<string, Promise<Partner[]>>();

export const createPartnerSlice: StateCreator<PartnerSlice, [], [], PartnerSlice> = (set, get) => ({
  partners: {},

  upsertPartner: (data) => set((state) => {
    const key = String(data.id);
    const existing = state.partners[key];
    const merged = existing ? mergePartnerData(existing.data, data) : data;
    return { partners: { ...state.partners, [key]: loadedRecord(merged) } };
  }),

  upsertPartners: (items) => set((state) => {
    const updated = { ...state.partners };
    for (const item of items) {
      const key = String(item.id);
      const existing = updated[key];
      const merged = existing ? mergePartnerData(existing.data, item) : item;
      updated[key] = loadedRecord(merged);
    }
    return { partners: updated };
  }),

  invalidatePartner: (id) => set((state) => {
    const key = String(id);
    const record = state.partners[key];
    if (!record) return state;
    return { partners: { ...state.partners, [key]: { ...record, loadedAt: null } } };
  }),

  invalidateAllPartners: () => set((state) => {
    const updated: Record<string, StoreRecord<PartnerData>> = {};
    for (const [key, record] of Object.entries(state.partners)) {
      updated[key] = { ...record, loadedAt: null };
    }
    return { partners: updated };
  }),

  fetchCampaignPartners: async (slug, opts) => {
    const key = `campaign-partners:${slug}`;
    if (!opts?.force && inflight.has(key)) return inflight.get(key)!;

    const promise = (async () => {
      try {
        const raw = await getCampaignPartners(slug);
        const items = raw.map(fromAssignmentSummary);
        get().upsertPartners(items);
        return items.map((d) => new Partner(get().partners[String(d.id)].data));
      } finally {
        inflight.delete(key);
      }
    })();

    inflight.set(key, promise);
    return promise;
  },

  getPartnerModel: (id) => {
    const record = get().partners[String(id)];
    return record ? new Partner(record.data) : null;
  },

  isPartnerStale: (id, maxAgeMs) => isRecordStale(get().partners[String(id)], maxAgeMs),
});
```

### 4.4 Create `lib/models/partner/usePartnerStore.ts`

```typescript
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useStore } from '../store';
import { Partner } from './Partner';
import type { PartnerAssignmentSummary } from '@/lib/schemas/partner';

/**
 * Campaign partners with client-side search/sort.
 * Replaces the existing useCampaignPartners hook for redesigned routes.
 */
export function useCampaignPartnerList(slug: string, opts: { enabled?: boolean } = {}) {
  const { enabled = true } = opts;
  const fetchCampaignPartners = useStore((s) => s.fetchCampaignPartners);
  const partnersMap = useStore((s) => s.partners);

  const [partnerIds, setPartnerIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchCampaignPartners(slug)
      .then((partners) => {
        if (!cancelled) setPartnerIds(partners.map((p) => p.id));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, enabled, fetchCampaignPartners]);

  const partners = useMemo(
    () => partnerIds
      .map((id) => partnersMap[String(id)])
      .filter(Boolean)
      .map((r) => new Partner(r.data)),
    [partnerIds, partnersMap],
  );

  const refetch = useCallback(
    () => fetchCampaignPartners(slug, { force: true })
      .then((p) => setPartnerIds(p.map((x) => x.id)))
      .catch(() => {}),
    [slug, fetchCampaignPartners],
  );

  return { partners, loading, error, refetch };
}
```

### Verify Step 4
- `npm run build` passes
- Write unit tests for `Partner` class
- Write unit tests for partner serializers

---

## Step 5: Complete the Root Store

### 5.1 Update `lib/models/store.ts`

Replace the placeholder with the real combined store:

```typescript
import { create } from 'zustand';
import { createCompanySlice, type CompanySlice } from './company/company.slice';
import { createCampaignSlice, type CampaignSlice } from './campaign/campaign.slice';
import { createPartnerSlice, type PartnerSlice } from './partner/partner.slice';

export type AppStore = CompanySlice & CampaignSlice & PartnerSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createCompanySlice(...a),
  ...createCampaignSlice(...a),
  ...createPartnerSlice(...a),
}));
```

### Verify Step 5
- `npm run build` passes (all slices imported, store complete)

---

## Step 6: Wire Up Redesigned Routes

This is the main refactoring step. Each sub-step modifies existing files to use the store.

### 6.1 Campaign Layout — Remove CampaignDetailProvider

**File:** `app/campaigns/[slug]/layout.tsx`

- Remove `CampaignDetailProvider` import and wrapper
- Use `useCampaign(slug)` from `lib/models/campaign/useCampaignStore`
- Pass `campaign` model to `CampaignDetailHeader` and other components
- Layout still renders nav, header, and `{children}`

### 6.2 Campaign Overview Page

**File:** `app/campaigns/[slug]/page.tsx`

- Replace `useCampaignDetail()` → `useCampaign(slug)`
- Pass `Campaign` model to `CampaignOverviewDashboard`

**File:** `components/campaigns/detail/CampaignOverviewDashboard.tsx`

- Update props to accept `Campaign` model instead of raw `CampaignRead` + `CampaignOverview`
- Access fields via `campaign.productName`, `campaign.isPublished`, etc.

### 6.3 Campaign Companies Page

**File:** `app/campaigns/[slug]/companies/page.tsx`

- Replace `useCampaignCompanies()` → `useCampaignCompanyList(slug, opts)` from company store
- Replace `useCampaignDetail()` → `useCampaign(slug)` for campaign context
- Companies are now `Company[]` model instances

**File:** `components/campaigns/CompanyRow.tsx`

- Change `company` prop type from `CompanyRowData` to `Company`
- Replace field access: `company.status` (already a getter), `company.campaignFitScore` (for list views), `company.fitScoreNormalized(productId)` (for detail views with product context), etc.

**File:** `components/campaigns/companies/useCampaignCompanies.ts`

- Rewrite internals to use company store's `fetchCampaignCompanies`
- Return `Company[]` instead of `CompanyRowData[]`
- Remove manual `toRowData()` mapping — the model handles it
- For partners filter dropdown: use `fetchCampaignPartners` from partner store (eliminates duplicate call)

**File:** `components/campaigns/companies/detail/useCampaignCompanyDetail.ts`

- Use `useCompanyDetail(domain)` for cached company loading
- Company detail sidebar opens instantly for previously viewed companies

### 6.4 Campaign Partners Page

**File:** `app/campaigns/[slug]/partners/page.tsx`

- Replace `useCampaignPartners()` → `useCampaignPartnerList(slug)` from partner store
- Partners are now `Partner[]` model instances

**File:** `components/campaigns/partners/PartnerRow.tsx`

- Change prop type from `PartnerRowData` → `Partner` model
- Access via `partner.name`, `partner.completionRate`, `partner.capacityRemaining`, etc.

**File:** `components/campaigns/partners/useCampaignPartners.ts`

- Rewrite to use partner store
- Return `Partner[]` instead of `PartnerRowData[]`

**File:** `components/campaigns/partners/detail/useCampaignPartnerDetail.ts`

- Use company store's `upsertFromPartnerAssignments` for partner's assigned companies
- Return `Company[]` instead of `CompanyRowData[]`

### 6.5 Campaign Settings Page

**File:** `hooks/useCampaignSettings.ts`

- Replace `useCampaignDetail()` → `useCampaign(slug)`
- Use `campaign.update({ name: newName })` instead of `updateCampaign` API call + `setCampaign`
- Campaign store handles the API call and store update

**File:** `hooks/useCampaignDetailHeader.ts`

- Replace `useCampaignDetail()` → `useCampaign(slug)`
- Derive header fields from `Campaign` model: `campaign.name`, `campaign.icon`, `campaign.status`, `campaign.productName`

### 6.6 Delete CampaignDetailProvider

**File:** `components/providers/CampaignDetailProvider.tsx` — **DELETE**

This file is fully replaced by the campaign store slice + `useCampaign()` hook.

### 6.7 Deprecate Migrated Utils

**File:** `lib/utils.ts`

Add `@deprecated` JSDoc to functions that now live in models. Don't delete — legacy routes still import them.

```typescript
/**
 * @deprecated Use Company.status getter from lib/models/company/Company.ts instead.
 */
export function deriveCompanyStatus(...) { ... }

/**
 * @deprecated Use Company.isNew getter from lib/models/company/Company.ts instead.
 */
export function isNewOpportunity(...) { ... }

/**
 * @deprecated Use Company.fitScoreNormalized(productId?) or Company.campaignFitScore from lib/models/company/Company.ts instead.
 */
export function normalizeScore(...) { ... }
export function normalizeScoreNullable(...) { ... }
```

### Verify Step 6
- `npm run build` — no type errors
- `npm run lint` — passes
- **Manual testing:**
  - Navigate to `/campaigns/[slug]` → overview loads correctly
  - Go to companies tab → rows show status, fit scores, partner names
  - Click a company row → detail sidebar opens → close and re-open → verify it's instant (cached)
  - Go to partners tab → rows show progress, capacity
  - Go to settings → change name → verify header updates immediately
  - Publish/unpublish → status changes reflected across all tabs

---

## Files Summary

| Action | Path |
|--------|------|
| **New** | `lib/models/types.ts` |
| **New** | `lib/models/store.ts` |
| **New** | `lib/models/company/Company.ts` |
| **New** | `lib/models/company/company.serializer.ts` |
| **New** | `lib/models/company/company.slice.ts` |
| **New** | `lib/models/company/useCompanyStore.ts` |
| **New** | `lib/models/campaign/Campaign.ts` |
| **New** | `lib/models/campaign/campaign.serializer.ts` |
| **New** | `lib/models/campaign/campaign.slice.ts` |
| **New** | `lib/models/campaign/useCampaignStore.ts` |
| **New** | `lib/models/partner/Partner.ts` |
| **New** | `lib/models/partner/partner.serializer.ts` |
| **New** | `lib/models/partner/partner.slice.ts` |
| **New** | `lib/models/partner/usePartnerStore.ts` |
| **Modify** | `package.json` — add `zustand` |
| **Modify** | `lib/utils.ts` — add `@deprecated` to migrated fns |
| **Modify** | `app/campaigns/[slug]/layout.tsx` |
| **Modify** | `app/campaigns/[slug]/page.tsx` |
| **Modify** | `app/campaigns/[slug]/companies/page.tsx` |
| **Modify** | `app/campaigns/[slug]/partners/page.tsx` |
| **Modify** | `app/campaigns/[slug]/settings/page.tsx` |
| **Modify** | `components/campaigns/CompanyRow.tsx` |
| **Modify** | `components/campaigns/companies/useCampaignCompanies.ts` |
| **Modify** | `components/campaigns/companies/CampaignCompaniesView.tsx` |
| **Modify** | `components/campaigns/companies/detail/CampaignCompanyDetail.tsx` |
| **Modify** | `components/campaigns/companies/detail/useCampaignCompanyDetail.ts` |
| **Modify** | `components/campaigns/partners/PartnerRow.tsx` |
| **Modify** | `components/campaigns/partners/useCampaignPartners.ts` |
| **Modify** | `components/campaigns/partners/detail/useCampaignPartnerDetail.ts` |
| **Modify** | `components/campaigns/detail/CampaignOverviewDashboard.tsx` |
| **Modify** | `hooks/useCampaignDetailHeader.ts` |
| **Modify** | `hooks/useCampaignSettings.ts` |
| **Delete** | `components/providers/CampaignDetailProvider.tsx` |
| **Keep** | `components/providers/PartnerProvider.tsx` (legacy) |
| **Keep** | `hooks/useAccountDetail.ts` (legacy) |
| **Keep** | `hooks/useCampaignPage.ts` (legacy) |
