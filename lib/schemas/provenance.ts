
import { SignalContributor } from './signal';
export type { SignalContributor } from './signal';

export interface SourceDetail {
    source_id: number;
    source_type: string;
    title: string | null;
    url: string | null;
    snippet: string | null;
    collected_at: string | null;
}

export interface SignalProvenanceResponse {
    signal_id: number;
    company_id: number;
    company_domain: string;
    signal_type: string;
    signal_category: string;
    strength: number;
    confidence: number;
    evidence_summary: string | null;
    source_type: string;
    source_ids: number[] | null;
    source_details: SourceDetail[];
    contributors: SignalContributor[];
    aggregation_method: string | null;
    detected_at: string;
}
