// Fit score related schemas

export interface SourceContribution {
    source_type: string;
    strength: number;
    confidence: number;
    evidence: string;
    qualified: boolean;
    qualifier_confidence: number;
    qualifier_reasoning: string;
    contribution_weight: number;
}

export interface SignalContribution {
    signal_id?: number;
    category: string;
    display_name?: string | null;
    signal_type: string;
    strength: number;
    weight: number;
    contribution: number;
    multiplier?: number | null;
    confidence?: number;
    source_type?: string;
    evidence?: string;
    qualifier?: string | null;
    qualifier_confidence?: number;
    qualifier_reasoning?: string;
    source_contributions?: SourceContribution[];
    qualified_sources?: string[];
    excluded_sources?: string[];
    urgency?: string | null;
    detected_at?: string;
    signal_date?: string | null;
    age_days?: number;
    decay_factor?: number;
    source_type_factor?: number;
    probability?: number;
    idf_score?: number;
    raw_probability?: number;
    contribution_rank?: number;
}

export interface InterestWeight {
    interest: string;
    weight: number;
    reasoning: string;
    qualifier: string | null;
}

export interface EventWeight {
    event: string;
    weight: number;
    urgency_multiplier: number;
    reasoning: string;
    qualifier: string | null;
}

export interface NegativeEventWeight {
    event: string;
    weight: number;
    reasoning: string;
    qualifier: string | null;
}

export interface ProductWeightsSnapshot {
    product_id: number;
    product_name: string;
    interest_weights: InterestWeight[];
    event_weights: EventWeight[];
    negative_event_weights: NegativeEventWeight[];
    source_type_weights: Record<string, number>;
    snapshot_at: string;
}

export interface FitScore {
    company_id: number;
    company_domain: string;
    company_name: string;
    product_id: number;
    product_name: string;
    likelihood_score: number;
    urgency_score: number;
    combined_score: number;
    negative_penalty?: number;
    pre_penalty_score?: number;
    interest_matches?: SignalContribution[];
    event_matches?: SignalContribution[];
    negative_matches?: SignalContribution[];
    top_drivers?: string[];
    missing_signals?: string[];
    fit_explanation?: string | null;
    explanation_generated_at?: string | null;
    signals_used: number;
    signal_ids?: number[];
    calculated_at: string;
    product_weights_snapshot?: ProductWeightsSnapshot | null;
    likelihood_breakdown_v2?: { signals: SignalContribution[] } | null;
    algorithm_version?: string;
    likelihood_components?: unknown | null;
    urgency_components?: unknown | null;
}

export interface FitScoreSummary {
    company_id: number;
    company_domain: string;
    company_name: string;
    product_id: number;
    product_name: string;
    likelihood_score: number;
    urgency_score: number;
    combined_score: number;
    top_drivers: string[];
    calculated_at: string;
}

export interface FitInclude {
    product_id: number;
    product_name: string;
    likelihood_score: number;
    urgency_score: number;
    combined_score: number;
    top_drivers: string[];
    calculated_at: string;
}

export interface FitCacheInfo {
    oldest_calculation?: string | null;
    newest_calculation?: string | null;
    total_cached: number;
    stale_count: number;
}

export interface FitCacheHealth {
    total_cached: number;
    stale_count: number;
    stale_percentage: number;
    total_companies: number;
    total_products: number;
    coverage_percentage: number;
    oldest_calculation?: string | null;
    newest_calculation?: string | null;
}

export interface CandidateFitSummary {
    company_id: number;
    company_domain: string;
    company_name: string;
    industry?: string | null;
    employee_count?: number | null;
    hq_country?: string | null;
    logo_url?: string | null;
    logo_base64?: string | null;
    top_contact?: {
        full_name: string;
        current_title?: string | null;
        avatar_url?: string | null;
    } | null;
    likelihood_score: number;
    urgency_score: number;
    combined_score: number;
    top_drivers: string[];
    calculated_at: string;
}

export interface ProductCandidatesResponse {
    product_id: number;
    product_name: string;
    candidates: CandidateFitSummary[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    cache_info: FitCacheInfo;
}

export interface FitCalculateRequest {
    domain?: string | null;
    product_id?: number | null;
    force?: boolean;
}

export interface FitCalculateResponse {
    companies_calculated: number;
    companies_skipped: number;
    products_processed: number;
    duration_seconds: number;
    status: string;
}

export interface CompanyFitComparisonResponse {
    company_id: number;
    company_domain: string;
    company_name: string;
    fits: ProductFitScore[];
    best_fit_product?: string | null;
    best_fit_score?: number | null;
    signals_detected: number;
}

export interface ProductFitScore {
    product_id: number;
    product_name: string;
    likelihood_score: number;
    urgency_score: number;
    combined_score: number;
    interest_matches?: SignalMatch[];
    event_matches?: SignalMatch[];
    top_drivers?: string[];
    missing_signals?: string[];
}

export interface SignalMatch {
    signal: string;
    signal_type: string;
    strength: number;
    weight: number;
    contribution: number;
    multiplier?: number | null;
}
