// Fit score related schemas

export interface SignalContribution {
    category: string;
    signal_type: string;
    strength: number;
    weight: number;
    contribution: number;
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
    interest_matches?: SignalContribution[];
    event_matches?: SignalContribution[];
    top_drivers?: string[];
    missing_signals?: string[];
    signals_used: number;
    calculated_at: string;
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
