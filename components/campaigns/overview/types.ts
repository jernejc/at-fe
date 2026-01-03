export type DrillDownFilter = {
    type: 'industry' | 'fit_range' | 'outreach_status';
    value: string;
    label: string;
};

export interface OutreachPipeline {
    not_started: number;
    contacted: number;
    responded: number;
    meeting_booked: number;
}

export interface AccountNeedingAttention {
    domain: string;
    name: string;
    industry: string | null;
    fitScore: number | null;
    logoBase64?: string | null;
    reason: 'unassigned_high_fit' | 'high_fit_not_contacted' | 'stale' | 'needs_followup' | 'newly_added';
    reasonLabel: string;
}
