// Campaign-related TypeScript schemas

export interface CampaignSummary {
    id: number;
    name: string;
    slug: string;
    status: string;
    company_count: number;
    processed_count: number;
    avg_fit_score: number | null;
    target_product_id: number | null;
    owner: string | null;
    created_at: string;
    updated_at: string;
}

export interface CampaignRead {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    owner: string | null;
    tags: string[];
    target_criteria: Record<string, any> | null;
    target_product_id: number | null;
    status: string;
    company_count: number;
    processed_count: number;
    avg_fit_score: number | null;
    created_at: string;
    updated_at: string;
}

export interface CampaignCreate {
    name: string;
    description?: string | null;
    owner?: string | null;
    tags?: string[];
    target_criteria?: Record<string, any> | null;
    target_product_id?: number | null;
    slug?: string | null;
    domains?: string[];
}

export interface CampaignUpdate {
    name?: string | null;
    description?: string | null;
    icon?: string | null;
    status?: string | null;
    owner?: string | null;
    tags?: string[] | null;
    target_criteria?: Record<string, any> | null;
    target_product_id?: number | null;
}

export interface CampaignSegment {
    name: string;
    count: number;
    percentage: number;
    avg_fit_score: number | null;
    domains: string[];
}

export interface FitDistribution {
    '0-20': number;
    '20-40': number;
    '40-60': number;
    '60-80': number;
    '80-100': number;
    unscored: number;
}

export interface CampaignOverview extends CampaignRead {
    segments: CampaignSegment[];
    top_companies: MembershipRead[];
    fit_distribution: FitDistribution;
    industry_breakdown: Record<string, number>;
    processing_progress: number;
    product_name: string | null;
}

export interface MembershipRead {
    id: number;
    company_id: number;
    domain: string;
    company_name: string | null;
    industry: string | null;
    employee_count: number | null;
    hq_country: string | null;
    segment: string | null;
    cached_fit_score: number | null;
    cached_likelihood_score: number | null;
    cached_urgency_score: number | null;
    is_processed: boolean;
    notes: string | null;
    priority: number;
    logo_base64?: string | null;
    logo_url?: string | null;
    created_at: string;
    // Partner assignment fields
    assigned_at: string;
    assigned_partner_id?: number | null;
    assigned_partner_name?: string | null;
}

/** Detailed membership returned by GET /api/v1/campaigns/{slug}/companies/{domain}. */
export interface CampaignCompanyRead {
    id: number;
    company_id: number;
    domain: string;
    company_name: string | null;
    is_unresolved: boolean;
    logo_base64: string | null;
    industry: string | null;
    employee_count: number | null;
    hq_country: string | null;
    segment: string | null;
    cached_fit_score: number | null;
    cached_likelihood_score: number | null;
    cached_urgency_score: number | null;
    processing_status: string | null;
    is_processed: boolean;
    processing_error: string | null;
    processing_started_at: string | null;
    processing_completed_at: string | null;
    target_data_depth: string | null;
    target_signal_status: string | null;
    target_fit_status: string | null;
    target_playbook_status: string | null;
    include_employees: boolean;
    include_posts: boolean;
    include_jobs: boolean;
    achieved_data_depth: string | null;
    achieved_signal_status: string | null;
    achieved_fit_status: string | null;
    achieved_playbook_status: string | null;
    assigned_partner_id: number | null;
    assigned_partner_name: string | null;
    assigned_at: string;
    notes: string | null;
    priority: number;
    created_at: string;
}

export interface MembershipCreate {
    domain: string;
    notes?: string | null;
    priority?: number;
}

export interface MembershipUpdate {
    notes?: string | null;
    priority?: number | null;
    segment?: string | null;
    partner_id?: string | null;
}

export interface BulkAddResult {
    added: number;
    skipped: number;
    errors: Record<string, any>[];
}

export interface CompanyComparison {
    domain: string;
    name: string | null;
    industry: string | null;
    employee_count: number | null;
    hq_country: string | null;
    fit_score: number | null;
    likelihood_score: number | null;
    urgency_score: number | null;
    fit_rank: number;
    top_signals: string[];
    segment: string | null;
}

export interface CampaignComparison {
    campaign_id: number;
    campaign_name: string;
    product_id: number | null;
    product_name: string | null;
    companies: CompanyComparison[];
    total_companies: number;
}

export interface ProcessRequest {
    use_a2a?: boolean;
    force_reprocess?: boolean;
    product_id?: number | null;
}

export interface ProcessResult {
    status: string;
    total: number;
    processed: number;
    failed: number;
    errors: Record<string, any>[];
}

export interface CampaignExport {
    version: string;
    exported_at: string;
    campaign: CampaignRead;
    companies: any[];
    memberships: any[];
}

export interface ImportResult {
    campaign_id: number;
    campaign_slug: string;
    total_domains: number;
    existing_companies: number;
    created_companies: number;
    failed_companies: Record<string, any>[];
}

export interface CampaignImport {
    name: string;
    description?: string | null;
    owner?: string | null;
    tags?: string[];
    target_product_id?: number | null;
    domains: string[];
    companies?: Record<string, any>[] | null;
}

/**
 * Extended campaign data for the CampaignRow component.
 * Adds optional fields that the backend will provide once supported.
 * All new fields are optional so the row degrades gracefully.
 */
export interface CampaignRowData extends CampaignSummary {
    /** Lucide icon name chosen by the user (e.g. "rocket", "target") */
    icon?: string | null;
    /** Resolved target product name(s) */
    product_name?: string | null;
    /** Average employee size range, e.g. "100-200" */
    avg_employee_size?: string | null;
    /** Primary geographic location, e.g. "United States" */
    main_location?: string | null;
    /** Companies with active outreach (in-progress) */
    in_progress_count?: number;
    /** Companies that completed the funnel and were won */
    completed_won_count?: number;
    /** Companies that completed the funnel and were lost */
    completed_lost_count?: number;
    /** 0-100 task completion percentage for in-progress companies */
    task_completion_pct?: number;
    /** Total revenue won in dollars */
    total_won_amount?: number | null;
    /** Fit score change since last period */
    avg_fit_score_change?: number | null;
    /** Number of leads the partner has engaged with. Partner view only. */
    engaged_count?: number;
    /** Total leads assigned to the partner for this campaign. Partner view only. */
    assigned_count?: number;
}

// Filters for campaign list
export interface CampaignFilters {
    page?: number;
    page_size?: number;
    status?: string;
    owner?: string;
    sort_by?: 'name' | 'created_at' | 'updated_at' | 'company_count';
    sort_order?: 'asc' | 'desc';
    own_only?: boolean;
}

// Funnel metrics
export interface FunnelStage {
    name: string;
    count: number;
    percentage: number;
    criteria: string;
}

export interface CampaignFunnel {
    campaign_id: number;
    campaign_name: string;
    product_id: number | null;
    stages: FunnelStage[];
    total_companies: number;
    conversion_rate: number;
}

// UI-only filter types for the campaign builder
export type CampaignFilterType = 'natural_query' | 'industry' | 'size_min' | 'size_max' | 'country' | 'domain_list' | 'fit_min';

export interface CampaignFilterUI {
    id: string;
    type: CampaignFilterType;
    value: string;
    displayLabel: string;
}


export type PartnerType = 'agency' | 'technology' | 'consulting' | 'reseller';

export interface Partner {
    id: string;
    name: string;
    type: PartnerType;
    logo_url?: string;
    description: string;
    status: 'active' | 'inactive';
    match_score: number;
    // Enhanced fields for assignment tracking
    capacity?: number;
    assigned_count?: number;
    industries?: string[];
}

export interface CampaignDraft {
    name: string;
    description: string;
    filters: CampaignFilterUI[];
    owner?: string;
    partners?: Partner[];
}

// Outreach progress tracking (for partner detail view)
export type OutreachStatus = 'not_started' | 'draft' | 'sent' | 'replied' | 'meeting_booked';

export interface MembershipWithProgress extends MembershipRead {
    outreach_status: OutreachStatus;
    outreach_sent_at?: string;
    decision_makers_count: number;
    last_activity?: string;
}

// Company progress tracking (per-company within a campaign)
export interface CompanyProgressStep {
    step_number: number;
    day_offset: number;
    channel: string;
    objective: string;
    contacts: string[];
    status: string;
    completion_type: string;
    planned_date: string;
    completed_at: string | null;
    partner_notes: string | null;
}

export interface CompanyProgressRead {
    id: number;
    assignment_id: number;
    campaign_id: number;
    company_id: number;
    company_domain: string;
    company_name: string;
    assigned_at: string;
    partner_id: number;
    partner_name: string;
    playbook_id: number;
    status: string;
    execution_started_at: string | null;
    status_changed_at: string | null;
    earned_revenue: string | null;
    closed_at: string | null;
    close_reason: string | null;
    partner_notes: string | null;
    progress_percentage: number;
    steps: CompanyProgressStep[];
    created_at: string;
    updated_at: string;
}
