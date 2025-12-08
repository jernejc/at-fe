// Signal-related schemas

// New unified signal detail type
export interface SignalDetail {
    category: string;
    strength: number;
    confidence: number;
    urgency_impact?: number | null;
    evidence_summary?: string | null;
    aggregation_method: string;
    contributor_count: number;
    weight_sum: number;
}

export interface SignalsInclude {
    interests: SignalDetail[];
    events: SignalDetail[];
    last_aggregated_at?: string | null;
    employees_analyzed: number;
}

export interface CompanySignalsResponse {
    company_id: number;
    company_domain: string;
    company_name: string;
    interests: SignalDetail[];
    events: SignalDetail[];
    aggregation: Record<string, unknown>;
}

export interface SignalContributor {
    employee_id: number;
    employee_name: string;
    title?: string | null;
    seniority_level?: string | null;
    weight: number;
    strength: number;
    evidence?: string | null;
}

export interface SignalContributorsResponse {
    company_id: number;
    company_domain: string;
    contributors: Record<string, SignalContributor[]>;
}

export interface SignalCategoryInfo {
    name: string;
    display_name: string;
    description?: string | null;
    signal_type: string;
    default_weight: number;
}

export interface SignalCategoriesResponse {
    interests: SignalCategoryInfo[];
    events: SignalCategoryInfo[];
}

export interface SignalStatsResponse {
    total_company_signals: number;
    total_employee_signals: number;
    companies_with_signals: number;
    employees_with_signals: number;
    interest_category_counts: Record<string, number>;
    event_category_counts: Record<string, number>;
}

// Employee signal types
export interface EmployeeDetectedInterest {
    category: string;
    confidence: number;
    strength: number;
    evidence: string;
    source_type: string;
}

export interface EmployeeDetectedEvent {
    category: string;
    confidence: number;
    urgency: number;
    evidence: string;
    source_type: string;
}

export interface EmployeeSignalsInclude {
    interests: EmployeeDetectedInterest[];
    events: EmployeeDetectedEvent[];
}

// Aggregation request/response
export interface AggregateRequest {
    max_employees?: number;
    min_seniority?: string;
    force?: boolean;
    reaggregate_only?: boolean;
}

export interface AggregateResponse {
    company_id: number;
    company_domain: string;
    employees_analyzed: number;
    employees_with_signals: number;
    total_weight: number;
    avg_confidence: number;
    interests_count: number;
    events_count: number;
    status: string;
}

// Legacy types for backward compatibility
export interface CompanySignal {
    id: number;
    signal_type: string;
    signal_category: string;
    confidence: number;
    strength: number;
    urgency_impact: number | null;
    evidence_summary: string;
    source_type: string;
    detected_at: string;
    valid_until: string | null;
}

export interface CompanySignalResponse {
    id: number;
    signal_type: string;
    signal_category: string;
    confidence: number;
    strength: number;
    urgency_impact: number | null;
    evidence_summary: string;
    source_type: string;
    detected_at: string;
    valid_until: string | null;
}

export interface SignalAggregationResponse {
    company_id: number;
    interest_summary: Record<string, unknown> | null;
    event_summary: Record<string, unknown> | null;
    top_interests: Record<string, unknown>[] | null;
    top_events: Record<string, unknown>[] | null;
    signals_analyzed: number;
    last_analyzed_at: string;
}

export interface EmployeeSignalResponse {
    id: number;
    employee_id: number;
    employee_name: string | null;
    signal_type: string;
    signal_category: string;
    strength: number;
    urgency: number | null;
    confidence: number;
    evidence_summary: string;
    employee_weight: number | null;
}

export interface EmployeeSignalsListResponse {
    company_id: number;
    total_signals: number;
    employees_with_signals: number;
    signals: EmployeeSignalResponse[];
}

export interface AggregatedSignal {
    signal_type: string;
    signal_category: string;
    aggregated_strength: number;
    aggregated_urgency: number | null;
    confidence: number;
    contributor_count: number;
    weight_sum: number;
    aggregation_method: string;
    top_contributors: Record<string, unknown>[];
}

export interface CompanySignalAggregationResult {
    company_id: number;
    interests: AggregatedSignal[];
    events: AggregatedSignal[];
    employees_analyzed: number;
    employees_with_signals: number;
    total_weight: number;
    avg_confidence: number;
}

export interface AggregationResultResponse {
    company_id: number;
    employees_analyzed: number;
    employees_with_signals: number;
    total_weight: number;
    avg_confidence: number;
    interests_count: number;
    events_count: number;
}

export interface AnalysisStatusResponse {
    company_id: number;
    status: string;
    message: string;
}
