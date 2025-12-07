// Playbook-related schemas

export interface PlaybookSummary {
    id: number;
    company_id: number;
    product_group: string;
    fit_score: number | null;
    fit_urgency: number | null;
    contacts_count: number;
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
    outreach_templates: OutreachTemplateResponse[];
}

export interface PlaybookRead {
    id: number;
    company_id: number;
    product_group: string;
    fit_score: number | null;
    fit_urgency: number | null;
    fit_reasoning: string | null;
    value_proposition: string | null;
    elevator_pitch: string | null;
    discovery_questions: string[] | null;
    objection_handling: Record<string, string> | null;
    recommended_channels: string[] | null;
    contacts: PlaybookContactResponse[];
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
    product_group?: string;
    min_fit_score?: number;
}
