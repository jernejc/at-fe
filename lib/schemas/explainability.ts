/**
 * A raw signal component with its source type (post, employee, technographics, etc.)
 */
export interface SignalComponent {
    id: number;
    signal_type: string;
    source_type: string;
    strength: number;
    confidence: number;
    urgency_impact?: number | null;
    evidence_summary?: string | null;
    source_ids: number[];
    detected_at: string;
    employee_signal_ids: number[];
}

/**
 * Aggregated interest signal with underlying components
 */
export interface SignalInterest {
    id: number;
    category: string;
    display_name?: string | null;
    strength: number;
    confidence: number;
    urgency_impact?: number | null;
    evidence_summary?: string | null;
    source_type: string;
    source_types: string[];
    source_ids: number[];
    source_ids_by_type: Record<string, number[]>;
    component_signal_ids: number[];
    component_count: number;
    components: SignalComponent[];
    aggregation_method?: string | null;
    contributor_count: number;
    weight_sum: number;
}

/**
 * Aggregated event signal with underlying components
 */
export interface SignalEvent {
    id: number;
    category: string;
    display_name?: string | null;
    strength: number;
    confidence: number;
    urgency_impact?: number | null;
    evidence_summary?: string | null;
    source_type: string;
    source_types: string[];
    source_ids: number[];
    source_ids_by_type: Record<string, number[]>;
    component_signal_ids: number[];
    component_count: number;
    components: SignalComponent[];
    aggregation_method?: string | null;
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
    id?: number | null;
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
    data_coverage?: DataCoverage | null;
    freshness?: Freshness | null;
    links: Record<string, string>;
}

export * from './provenance';
