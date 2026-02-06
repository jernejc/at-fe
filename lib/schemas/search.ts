// Search-related schemas

import type { CompanySummary } from './company';
import type { EmployeeSummary } from './employee';

export interface SearchResults {
    query: string;
    total_results: number;
    companies: CompanySummary[];
    employees: EmployeeSummary[];
}

// ============= WebSocket Agentic Search Types =============

export type WSSearchPhase =
    | 'idle'
    | 'connecting'
    | 'interpreting'
    | 'searching'
    | 'ranking'
    | 'results'
    | 'suggesting'
    | 'partner_suggestion'
    | 'suggestions_complete'
    | 'insights'
    | 'complete'
    | 'error';

export type WSMessageType = 'ack' | 'result' | 'error' | 'complete';

// Request sent to WebSocket
export interface WSSearchRequest {
    query: string;
    entity_types?: ('companies' | 'partners')[];
    limit?: number;
    include_partner_suggestions?: boolean;
    partner_suggestion_limit?: number;
    product_id?: number | null;
    context?: Record<string, unknown>;
    request_id?: string;
}

// Interpretation from LLM
export interface WSSearchInterpretation {
    intent: string;
    semantic_query: string;
    keywords: string[];
    filters: Record<string, unknown>;
    suggested_queries: string[];
    feedback: Record<string, unknown>;
}

// Top interest for a company
export interface WSTopInterest {
    category: string;
    display_name?: string;
    strength: number;
    contributors: number;
}

// Company result from WebSocket search
export interface WSCompanyResult {
    entity_type: 'company';
    company_id: number;
    domain: string;
    name: string;
    description: string | null;
    industry?: string | null;
    match_score: number;
    vector_score: number;
    keyword_score: number;
    match_reasons: string[];
    top_interests: WSTopInterest[];
    key_employees: string[];
    logo_base64?: string | null;
    employee_count?: number | null;
}

// Partner result from WebSocket search
export interface WSPartnerResult {
    entity_type: 'partner';
    partner_id: number;
    slug: string;
    name: string;
    description: string | null;
    website: string | null;
    match_score: number;
    vector_score: number;
    keyword_score: number;
    contact_name: string | null;
    contact_email: string | null;
    logo_url?: string | null;
}

// Matched interest in partner suggestion
export interface WSMatchedInterest {
    interest: string;
    partner_weight: number;
    interest_importance: number;
    contribution: number;
    reasoning: string;
    certifications: string[];
}

// Partner suggestion with detailed matching
export interface WSPartnerSuggestion {
    partner_id: number;
    slug: string;
    name: string;
    description: string | null;
    match_score: number;
    interest_coverage: number;
    matched_interests: WSMatchedInterest[];
    logo_url?: string | null;
}

// AI-generated insights
export interface WSSearchInsights {
    observation: string;
    insight: string;
    suggested_queries: string[];
    refinement_tips: string[];
}

// Interest frequency in summary
export interface WSInterestFrequency {
    interest: string;
    frequency: number;
}

// Partner suggestion summary
export interface WSPartnerSuggestionSummary {
    count: number;
    based_on_interests: WSInterestFrequency[];
}

// Base message structure
export interface WSBaseMessage {
    type: WSMessageType;
    request_id?: string;
}

// Ack message
export interface WSAckMessage extends WSBaseMessage {
    type: 'ack';
    request_id: string;
}

// Result message (varies by phase)
export interface WSResultMessage extends WSBaseMessage {
    type: 'result';
    phase: WSSearchPhase;
    message?: string;
    partial?: boolean;
    // Phase-specific fields
    interpretation?: WSSearchInterpretation;
    company?: WSCompanyResult;
    partner?: WSPartnerResult | WSPartnerSuggestion;
    insights?: WSSearchInsights;
    count?: number;
    based_on_interests?: WSInterestFrequency[];
}

// Error message
export interface WSErrorMessage extends WSBaseMessage {
    type: 'error';
    message: string;
    code?: string;
}

// Complete message
export interface WSCompleteMessage extends WSBaseMessage {
    type: 'complete';
    total_results: number;
    partner_results: number;
    partner_suggestions: WSPartnerSuggestion[];
    partner_suggestion_summary: WSPartnerSuggestionSummary;
    search_time_ms: number;
    observation: string;
    suggested_queries: string[];
    refinement_tips: string[];
}

// Union type for all messages
export type WSSearchMessage = WSAckMessage | WSResultMessage | WSErrorMessage | WSCompleteMessage;