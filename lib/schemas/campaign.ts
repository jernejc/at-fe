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
    created_at: string;
    // Partner assignment fields
    partner_id?: string | null;
    partner_name?: string | null;
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

// Filters for campaign list
export interface CampaignFilters {
    page?: number;
    page_size?: number;
    status?: string;
    owner?: string;
    sort_by?: 'name' | 'created_at' | 'updated_at' | 'company_count';
    sort_order?: 'asc' | 'desc';
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
export type CampaignFilterType = 'natural_query' | 'industry' | 'size_min' | 'size_max' | 'country' | 'domain_list';

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

