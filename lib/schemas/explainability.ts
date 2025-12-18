export interface SignalInterest {
    category: string;
    strength: number;
    confidence: number;
    urgency_impact: number;
    evidence_summary: string;
    aggregation_method: string;
    contributor_count: number;
    weight_sum: number;
}

export interface SignalEvent {
    category: string;
    strength: number;
    confidence: number;
    urgency_impact: number;
    evidence_summary: string;
    aggregation_method: string;
    contributor_count: number;
    weight_sum: number;
}

export interface SignalsSummary {
    company_id: number;
    company_domain: string;
    company_name: string;
    interests: SignalInterest[];
    events: SignalEvent[];
    aggregation: Record<string, any>;
    contributor_details: Record<string, any>;
    data_freshness: Record<string, any>;
}

export interface FitSummaryFit {
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

export interface DataCoverage {
    employees_analyzed: number;
    employees_with_signals: number;
    total_weight: number;
    signals_analyzed: number;
}

export interface Freshness {
    newest_source: string;
    oldest_source: string;
    avg_source_age_days: number;
    stale_sources: number;
}

export interface CompanyExplainabilityResponse {
    company_id: number;
    company_domain: string;
    company_name: string;
    signals_summary: SignalsSummary;
    fits_summary: FitSummaryFit[];
    playbooks_count: number;
    data_coverage: DataCoverage;
    freshness: Freshness;
    links: Record<string, string>;
}
