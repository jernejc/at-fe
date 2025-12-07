// Signal-related schemas

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

export interface CompanySignalsResponse {
    company_id: number;
    company_name: string;
    aggregation_source: string | null;
    total_signals: number;
    interests: CompanySignalResponse[];
    events: CompanySignalResponse[];
    aggregation: SignalAggregationResponse | null;
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

export interface SignalCategoryInfo {
    value: string;
    name: string;
    description: string;
}

export interface SignalCategoriesResponse {
    interests: SignalCategoryInfo[];
    events: SignalCategoryInfo[];
    total_interests: number;
    total_events: number;
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
