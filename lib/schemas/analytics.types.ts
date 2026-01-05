// Analytics Dashboard Types

export interface KPIData {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        direction: "up" | "down";
        label: string;
    };
    progress?: {
        value: number;
        label: string;
    };
    warning?: string;
    sparklineData?: number[];
}

export interface CampaignPerformance {
    id: string;
    name: string;
    workload: "Gemini" | "GCP" | "Security" | "Workspace" | "Looker";
    assigned: number;
    engaged: number;
    engagedPercent: number;
    pipeline: number;
    pipelinePercent: number;
    ss2: number;
    pipelineValue: number;
    convRate: number;
    pdm: string;
}

export interface PartnerPerformance {
    id: string;
    rank: number;
    name: string;
    tier: "Strategic" | "Disti" | "Service";
    type: "Managed" | "Unmanaged";
    assigned: number;
    engaged: number;
    engagedPercent: number;
    pipeline: number;
    pipelinePercent: number;
    ss2: number;
    convRate: number;
    health: "green" | "yellow" | "red";
}

export interface WorkloadData {
    name: string;
    assigned: number;
    pipeline: number;
    value: number;
    conversionRate: number;
}

export interface PDMActivity {
    id: string;
    name: string;
    activeCampaigns: number;
    oppsAssigned: number;
    partnersManaged: number;
    avgResponseTime: string;
}

export interface CampaignDetail {
    id: string;
    name: string;
    createdDate: string;
    pdmName: string;
    status: "Active" | "Paused" | "Completed";
    targetCriteria: string;
    routingRules: string[];
    metrics: {
        assigned: number;
        engaged: number;
        engagedPercent: number;
        pipeline: number;
        pipelinePercent: number;
        converted: number;
        convertedPercent: number;
    };
    partnerBreakdown: {
        name: string;
        assigned: number;
        engaged: number;
        engagedPercent: number;
        pipeline: number;
        pipelinePercent: number;
        ss2: number;
        convRate: number;
    }[];
    activityTimeline: {
        date: string;
        action: string;
    }[];
}

export interface PartnerDetail {
    id: string;
    name: string;
    tier: "Strategic" | "Disti" | "Service";
    type: "Managed" | "Unmanaged";
    partnerSince: string;
    health: "green" | "yellow" | "red";
    contact: {
        name: string;
        title: string;
        email: string;
        phone: string;
        territory: string;
    };
    certifications: string[];
    preferredVerticals: string[];
    metrics: {
        assigned: number;
        engaged: number;
        engagedPercent: number;
        pipeline: number;
        pipelinePercent: number;
        ss2: number;
        ss2Percent: number;
        avgDealSize: number;
    };
    campaignParticipation: {
        name: string;
        assigned: number;
        pipeline: number;
        status: "Active" | "Completed";
    }[];
    performanceTrend: number[];
    notes: {
        date: string;
        content: string;
    }[];
    recentActivity: {
        date: string;
        action: string;
    }[];
}

export type SortDirection = "asc" | "desc";
export type SortField<T> = keyof T;
