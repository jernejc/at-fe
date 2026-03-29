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

/** Discriminated message type for outreach templates. */
export type OutreachMessageType =
    | 'anchor_artifact'
    | 'initial_email'
    | 'linkedin_note'
    | 'cold_call_script'
    | 'insight_email'
    | 'linkedin_value_message'
    | 'case_proof_email'
    | 'followup_call_script'
    | 'linkedin_followup_message'
    | 'breakup_email'
    | 'voicemail_script';

/**
 * A single outreach message within a template.
 * Part of the structured messages array on OutreachTemplateResponse.
 */
export interface OutreachMessage {
    id: number;
    template_id: number;
    message_type: OutreachMessageType;
    channel: string;
    subject: string | null;
    body: string;
    cta: string | null;
    metadata: Record<string, unknown> | null;
    sort_order: number;
}

export interface OutreachTemplateResponse {
    id: number;
    playbook_id: number;
    contact_id: number;
    recipient: string | null;
    messages: OutreachMessage[];
}

/** KPI metrics and value framing anchored to the contact's role. */
export interface RoleAnchor {
    kpi_metrics: string[];
    role_category: string;
    value_framing: string;
    pain_hypothesis: string;
}

/** A trigger hook describing a timely reason to engage a contact. */
export interface TriggerHook {
    why_now: string;
    signal_type: string;
    signal_category: string;
    trigger_summary: string;
    hypothesis_of_value: string;
}

/** Structured approach notes for a playbook contact. */
export interface ApproachNotes {
    role_anchor: RoleAnchor;
    trigger_hooks: TriggerHook[];
    opening_approach: string;
    resistance_strategy: string;
    meeting_value_exchange: string;
}

/** A single step in a contact's personalized outreach sequence. */
export interface ContactSequenceItem {
    step: number;
    day_offset: number;
    week: number;
    channel: string;
    message_type: string;
    thread: string;
    purpose: string;
    framework_technique: string;
    objective: string;
    subject: string | null;
    body: string;
    cta: string | null;
    source: string;
    metadata: Record<string, unknown> | null;
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

export interface ContactFitAssessment {
    score: number | null;
    urgency: number | null;
    reasoning: string | null;
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
    approach_notes: ApproachNotes | null;
    // Persona
    persona_type: string | null;
    persona_types: string[] | null;
    persona_confidence: number | null;
    committee_role: string | null;
    // Fit assessment
    fit_assessment: ContactFitAssessment | null;
    // Outreach sequence
    sequence: ContactSequenceItem[];
}

/**
 * A contact reference within a cadence step.
 * Includes an optional employee_id for linking to full contact records.
 */
export interface CadenceStepContact {
    name: string;
    employee_id: number | null;
}

/**
 * A single step in an outreach cadence.
 */
export interface CadenceStep {
    step: number | null;
    day_offset: number | null;
    channel: string;
    contacts: CadenceStepContact[];
    objective: string | null;
    follow_up: string | null;
    notes: string | null;
    framework_technique: string | null;
    purpose: string | null;
    message_angle: string | null;
}

/**
 * Outreach cadence plan with sequence of steps.
 */
export interface OutreachCadence {
    sequence: CadenceStep[];
    total_touches: number | null;
    duration_days: number | null;
    summary: string | null;
    escalation_plan: string | null;
    multi_thread_strategy: string | null;
    breakup_strategy: string | null;
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

export interface ObjectionHandlingEntry {
    objection: string;
    response: string;
}

/** Coverage analysis of the buying committee for a playbook. */
export interface CommitteeCoverage {
    filled_slots: number;
    total_slots: number;
    gaps: string[];
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
    objection_handling: ObjectionHandlingEntry[] | null;
    recommended_channels: string[] | null;
    contacts: PlaybookContactResponse[];
    committee_confidence: number | null;
    committee_coverage: CommitteeCoverage | null;
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
