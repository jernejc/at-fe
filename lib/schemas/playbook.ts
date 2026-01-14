// Playbook-related schemas

export interface PlaybookSummary {
    id: number;
    company_id: number;
    product_id: number;
    product_name: string | null;
    fit_score: number | null;
    fit_urgency: number | null;
    contacts_count: number;
    generation_version: number;
    regenerated_at?: string | null;
}

/**
 * Context for playbook employee interactions.
 * Used when viewing employee details from playbook context.
 */
export interface PlaybookContext {
    role_category?: string | null;
    value_prop?: string | null;
    fit_score?: number | null;
}

export interface OutreachTemplateResponse {
    id: number;
    recipient: string | null;
    draft_message: string | null;
    linkedin_connection_note: string | null;
    follow_up_email: string | null;
}

export interface PlaybookContact {
    id: number;
    employee_id: number | null;
    name: string;
    title: string | null;
    role_category: string | null;
    value_prop: string | null;
    fit_score: number | null;
    fit_urgency: number | null;
    fit_reasoning: string | null;
}

export interface PlaybookContactResponse extends PlaybookContact {
    // Contact info
    linkedin_url: string | null;
    email: string | null;
    phone: string | null;
    // Priority
    priority_rank: number | null;
    priority_reasoning: string | null;
    // Channel preferences
    preferred_channel: string | null;
    channel_sequence: string[] | null;
    approach_notes: string | null;
    // Outreach
    outreach_templates: OutreachTemplateResponse[];
}

/**
 * A single step in an outreach cadence.
 */
export interface CadenceStep {
    step: number | null;
    day_offset: number | null;
    channel: string;
    contacts: string[];
    objective: string | null;
    follow_up: string | null;
    notes: string | null;
}

/**
 * Outreach cadence plan with sequence of steps.
 */
export interface OutreachCadence {
    sequence: CadenceStep[];
    total_days: number | null;
    contacts_involved: string[] | null;
    summary: string | null;
}

export interface SignalBasisEvent {
    urgency: number;
    category: string;
    confidence: number;
    influence_on_strategy: string;
}

export interface SignalBasisInterest {
    category: string;
    strength: number;
    confidence: number;
    influence_on_strategy: string;
}

export interface SignalBasis {
    notes: string;
    top_events: SignalBasisEvent[];
    top_interests: SignalBasisInterest[];
}

export interface GenerationMetadata {
    signal_basis?: SignalBasis;
    [key: string]: unknown;
}

export interface PlaybookRead {
    id: number;
    company_id: number;
    product_id: number;
    product_name: string | null;
    fit_score: number | null;
    fit_urgency: number | null;
    fit_reasoning: string | null;
    value_proposition: string | null;
    elevator_pitch: string | null;
    discovery_questions: string[] | null;
    objection_handling: Record<string, string> | null;
    recommended_channels: string[] | null;
    contacts: PlaybookContactResponse[];
    outreach_cadence: OutreachCadence | null;
    generation_version: number;
    generation_metadata?: GenerationMetadata | null;
    regenerated_at?: string | null;
}

export interface CompanyPlaybooksResponse {
    company_id: number;
    company_domain: string;
    company_name: string;
    playbooks: PlaybookSummary[];
}

export interface PlaybookFilters {
    [key: string]: string | number | undefined;
    page?: number;
    page_size?: number;
    product_id?: number;
    min_fit_score?: number;
    domain?: string;
}

export interface PlaybookRegenerateRequest {
    product_groups?: string[] | null;
    force?: boolean;
}

export interface PlaybookRegenerateResponse {
    company_id: number;
    company_domain: string;
    company_name: string;
    playbooks_created: number;
    previous_version: number;
    new_version: number;
    product_groups: string[];
    fit_scores: Record<string, number>;
    generation_metadata: Record<string, unknown>;
}

export interface BulkPlaybookGenerationResponse {
    product_id: number;
    companies_processed: number;
    playbooks_created: number;
    playbooks_failed: number;
    status: string;
    job_id?: string | null;
    errors: string[];
}
