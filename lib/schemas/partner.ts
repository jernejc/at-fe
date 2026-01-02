// Partner-related TypeScript schemas (matching backend API)

export interface PartnerSummary {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    logo_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface PartnerRead extends PartnerSummary {
    industries: string[];
    capacity: number | null;
}

export interface PartnerWithRelations extends PartnerRead {
    // Extended partner with campaign assignments
    campaign_assignments?: CampaignAssignmentSummary[];
}

export interface CampaignAssignmentSummary {
    id: number;
    campaign_id: number;
    campaign_name: string;
    campaign_slug: string;
    role_in_campaign: string | null;
    assigned_at: string;
}

export interface PartnerCreate {
    name: string;
    slug?: string;
    description?: string;
    status?: string;
    partner_type?: string;  // 'consulting' | 'technology' | 'reseller' | 'agency'
    logo_url?: string;
    industries?: string[];
    capacity?: number;
}

export interface PartnerUpdate {
    name?: string;
    description?: string;
    status?: string;
    logo_url?: string;
    industries?: string[];
    capacity?: number;
}

// Campaign-Partner assignment schemas
export interface CampaignPartnerRead {
    id: number;
    campaign_id: number;
    partner_id: number;
    role_in_campaign: string | null;
    notes: string | null;
    assigned_at: string;
    assigned_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface CampaignPartnerCreate {
    partner_id: number;
    role_in_campaign?: string;
    notes?: string;
    assigned_by?: string;
}

export interface CampaignPartnerUpdate {
    role_in_campaign?: string;
    notes?: string;
}

export interface BulkAssignResult {
    assigned: number;
    skipped: number;
    errors: string[];
}

// New response type from list_campaign_partners endpoint
// Includes both partner details AND campaign assignment info
export interface PartnerAssignmentSummary {
    id: number; // Assignment ID
    partner_id: number;
    partner_name: string;
    partner_slug: string;
    partner_description: string | null;
    partner_website: string | null;
    partner_type: string;
    partner_logo_url: string | null;
    partner_capacity: number | null;
    partner_industries: string[];
    partner_status: string;
    
    // Assignment details
    role_in_campaign: string | null;
    assigned_at: string;
    assigned_by?: string | null;
}

// Filters for partner list
export interface PartnerFilters {
    page?: number;
    page_size?: number;
    status?: string;
    sort_by?: 'name' | 'created_at' | 'updated_at';
    sort_order?: 'asc' | 'desc';
}
