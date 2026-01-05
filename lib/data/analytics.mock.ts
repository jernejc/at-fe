import type {
    KPIData,
    CampaignPerformance,
    PartnerPerformance,
    WorkloadData,
    PDMActivity,
    CampaignDetail,
    PartnerDetail,
} from "@/lib/schemas/analytics.types";

// KPI Summary Data
export const kpiData: KPIData[] = [
    {
        title: "Total Opportunities Assigned",
        value: "1,847",
        trend: { value: 23, direction: "up", label: "vs. last period" },
        sparklineData: [120, 145, 160, 155, 180, 195, 210, 225, 240, 260, 275, 290],
    },
    {
        title: "Active Pipeline",
        value: "$28.4M",
        subtitle: "287 opportunities in pipeline",
        trend: { value: 31, direction: "up", label: "vs. last period" },
        progress: { value: 15.5, label: "of total assigned" },
    },
    {
        title: "Converted to SS2",
        value: "42",
        subtitle: "2.3% conversion rate",
        trend: { value: 12, direction: "up", label: "vs. last period" },
        warning: "Target: 3.0%",
    },
    {
        title: "Partner Engagement Rate",
        value: "64%",
        subtitle: "1,182 of 1,847 opportunities",
        trend: { value: 8, direction: "up", label: "vs. last period" },
    },
];

// Campaign Performance Data
export const campaignData: CampaignPerformance[] = [
    {
        id: "c1",
        name: "Gemini Enterprise Q1",
        workload: "Gemini",
        assigned: 247,
        engaged: 89,
        engagedPercent: 36,
        pipeline: 23,
        pipelinePercent: 9,
        ss2: 3,
        pipelineValue: 4200000,
        convRate: 1.2,
        pdm: "Sarah",
    },
    {
        id: "c2",
        name: "GCP Migration Wave",
        workload: "GCP",
        assigned: 412,
        engaged: 283,
        engagedPercent: 69,
        pipeline: 67,
        pipelinePercent: 16,
        ss2: 12,
        pipelineValue: 12300000,
        convRate: 2.9,
        pdm: "James",
    },
    {
        id: "c3",
        name: "Security Compliance",
        workload: "Security",
        assigned: 189,
        engaged: 124,
        engagedPercent: 66,
        pipeline: 31,
        pipelinePercent: 16,
        ss2: 8,
        pipelineValue: 6800000,
        convRate: 4.2,
        pdm: "Maria",
    },
    {
        id: "c4",
        name: "Workspace Expansion",
        workload: "Workspace",
        assigned: 334,
        engaged: 187,
        engagedPercent: 56,
        pipeline: 42,
        pipelinePercent: 13,
        ss2: 9,
        pipelineValue: 3100000,
        convRate: 2.7,
        pdm: "David",
    },
    {
        id: "c5",
        name: "Looker Analytics Push",
        workload: "Looker",
        assigned: 156,
        engaged: 71,
        engagedPercent: 46,
        pipeline: 18,
        pipelinePercent: 12,
        ss2: 2,
        pipelineValue: 2000000,
        convRate: 1.3,
        pdm: "Sarah",
    },
    {
        id: "c6",
        name: "Gemini for Developers",
        workload: "Gemini",
        assigned: 298,
        engaged: 234,
        engagedPercent: 79,
        pipeline: 48,
        pipelinePercent: 16,
        ss2: 6,
        pipelineValue: 5600000,
        convRate: 2.0,
        pdm: "Alex",
    },
    {
        id: "c7",
        name: "GCP Startup Program",
        workload: "GCP",
        assigned: 211,
        engaged: 194,
        engagedPercent: 92,
        pipeline: 58,
        pipelinePercent: 27,
        ss2: 2,
        pipelineValue: 1800000,
        convRate: 0.9,
        pdm: "Chris",
    },
];

// Partner Performance Data
export const partnerData: PartnerPerformance[] = [
    { id: "p1", rank: 1, name: "CloudTech Solutions", tier: "Strategic", type: "Managed", assigned: 234, engaged: 187, engagedPercent: 80, pipeline: 89, pipelinePercent: 38, ss2: 18, convRate: 7.7, health: "green" },
    { id: "p2", rank: 2, name: "Enterprise Partners", tier: "Strategic", type: "Managed", assigned: 298, engaged: 234, engagedPercent: 79, pipeline: 67, pipelinePercent: 22, ss2: 12, convRate: 4.0, health: "green" },
    { id: "p3", rank: 3, name: "Global Systems Inc", tier: "Strategic", type: "Managed", assigned: 187, engaged: 143, engagedPercent: 76, pipeline: 48, pipelinePercent: 26, ss2: 8, convRate: 4.3, health: "green" },
    { id: "p4", rank: 4, name: "TechForward Group", tier: "Disti", type: "Unmanaged", assigned: 156, engaged: 118, engagedPercent: 76, pipeline: 31, pipelinePercent: 20, ss2: 4, convRate: 2.6, health: "green" },
    { id: "p5", rank: 5, name: "Digital Transform Co", tier: "Strategic", type: "Managed", assigned: 143, engaged: 97, engagedPercent: 68, pipeline: 23, pipelinePercent: 16, ss2: 3, convRate: 2.1, health: "yellow" },
    { id: "p6", rank: 6, name: "Innovation Partners", tier: "Service", type: "Managed", assigned: 201, engaged: 134, engagedPercent: 67, pipeline: 28, pipelinePercent: 14, ss2: 2, convRate: 1.0, health: "yellow" },
    { id: "p7", rank: 7, name: "NextGen Solutions", tier: "Strategic", type: "Managed", assigned: 189, engaged: 124, engagedPercent: 66, pipeline: 18, pipelinePercent: 10, ss2: 1, convRate: 0.5, health: "yellow" },
    { id: "p8", rank: 8, name: "Apex Technology", tier: "Disti", type: "Unmanaged", assigned: 127, engaged: 71, engagedPercent: 56, pipeline: 12, pipelinePercent: 9, ss2: 1, convRate: 0.8, health: "yellow" },
    { id: "p9", rank: 9, name: "Premier Partners LLC", tier: "Strategic", type: "Managed", assigned: 112, engaged: 58, engagedPercent: 52, pipeline: 8, pipelinePercent: 7, ss2: 0, convRate: 0.0, health: "red" },
    { id: "p10", rank: 10, name: "Strategic Alliance Co", tier: "Service", type: "Managed", assigned: 98, engaged: 31, engagedPercent: 32, pipeline: 4, pipelinePercent: 4, ss2: 0, convRate: 0.0, health: "red" },
];

// Workload Data
export const workloadData: WorkloadData[] = [
    { name: "Gemini Enterprise", assigned: 545, pipeline: 157, value: 9800000, conversionRate: 29 },
    { name: "GCP", assigned: 623, pipeline: 125, value: 14100000, conversionRate: 20 },
    { name: "Security", assigned: 189, pipeline: 31, value: 6800000, conversionRate: 16 },
    { name: "Workspace", assigned: 334, pipeline: 42, value: 3100000, conversionRate: 13 },
    { name: "Looker", assigned: 156, pipeline: 18, value: 2000000, conversionRate: 12 },
];

export const workloadInsights: string[] = [
    "GCP has highest pipeline value ($14.1M) but lower conversion rate (20%) - high volume play",
    "Gemini has best engagement-to-pipeline rate (29%) - quality over quantity",
    "Security has highest average deal size ($219k per opportunity in pipeline)",
    "Workspace and Looker may be under-resourced compared to opportunity quality",
];

// PDM Activity Data
export const pdmData: PDMActivity[] = [
    { id: "pdm1", name: "Sarah Chen", activeCampaigns: 3, oppsAssigned: 545, partnersManaged: 8, avgResponseTime: "4.2 hours" },
    { id: "pdm2", name: "James Park", activeCampaigns: 2, oppsAssigned: 412, partnersManaged: 6, avgResponseTime: "2.8 hours" },
    { id: "pdm3", name: "Maria Lopez", activeCampaigns: 2, oppsAssigned: 189, partnersManaged: 4, avgResponseTime: "3.1 hours" },
    { id: "pdm4", name: "David Kim", activeCampaigns: 1, oppsAssigned: 334, partnersManaged: 5, avgResponseTime: "5.7 hours" },
    { id: "pdm5", name: "Alex Rivera", activeCampaigns: 1, oppsAssigned: 298, partnersManaged: 4, avgResponseTime: "3.9 hours" },
    { id: "pdm6", name: "Chris Taylor", activeCampaigns: 1, oppsAssigned: 211, partnersManaged: 3, avgResponseTime: "6.2 hours" },
];

// Campaign Detail Data
export const campaignDetails: Record<string, CampaignDetail> = {
    c1: {
        id: "c1",
        name: "Gemini Enterprise Q1 2025 Push",
        createdDate: "January 5, 2025",
        pdmName: "Sarah Chen",
        status: "Active",
        targetCriteria: "Enterprise accounts (500+ employees) in technology and financial services sectors with existing Google Workspace subscriptions.",
        routingRules: [
            "Priority routing to Strategic partners with Gemini certification",
            "Geographic matching for APAC accounts",
            "Capacity-based load balancing across certified partners",
        ],
        metrics: {
            assigned: 247,
            engaged: 89,
            engagedPercent: 36,
            pipeline: 23,
            pipelinePercent: 9,
            converted: 3,
            convertedPercent: 1.2,
        },
        partnerBreakdown: [
            { name: "CloudTech Solutions", assigned: 127, engaged: 71, engagedPercent: 56, pipeline: 18, pipelinePercent: 14, ss2: 2, convRate: 1.6 },
            { name: "Enterprise Partners", assigned: 60, engaged: 22, engagedPercent: 37, pipeline: 4, pipelinePercent: 7, ss2: 0, convRate: 0.0 },
            { name: "Global Systems Inc", assigned: 60, engaged: 31, engagedPercent: 52, pipeline: 9, pipelinePercent: 15, ss2: 1, convRate: 1.7 },
            { name: "Innovation Partners", assigned: 31, engaged: 8, engagedPercent: 26, pipeline: 2, pipelinePercent: 6, ss2: 0, convRate: 0.0 },
        ],
        activityTimeline: [
            { date: "Jan 5, 2025", action: "Campaign launched with 247 assigned opportunities" },
            { date: "Jan 8, 2025", action: "CloudTech Solutions added 12 opps to pipeline" },
            { date: "Jan 12, 2025", action: "First SS2 conversion by CloudTech Solutions" },
            { date: "Jan 15, 2025", action: "Global Systems Inc reached 50% engagement" },
            { date: "Jan 18, 2025", action: "Performance review meeting scheduled" },
        ],
    },
};

// Partner Detail Data
export const partnerDetails: Record<string, PartnerDetail> = {
    p1: {
        id: "p1",
        name: "CloudTech Solutions",
        tier: "Strategic",
        type: "Managed",
        partnerSince: "March 2019",
        health: "green",
        contact: {
            name: "Jennifer Martinez",
            title: "VP of Google Practice",
            email: "jmartinez@cloudtech.com",
            phone: "+1 (555) 123-4567",
            territory: "North America - West",
        },
        certifications: ["Gemini Certified", "GCP Professional", "Workspace Enterprise", "Security Specialist"],
        preferredVerticals: ["Technology", "Financial Services", "Healthcare", "Retail"],
        metrics: {
            assigned: 234,
            engaged: 187,
            engagedPercent: 80,
            pipeline: 89,
            pipelinePercent: 38,
            ss2: 18,
            ss2Percent: 7.7,
            avgDealSize: 245000,
        },
        campaignParticipation: [
            { name: "Gemini Enterprise Q1", assigned: 127, pipeline: 18, status: "Active" },
            { name: "GCP Migration Wave", assigned: 54, pipeline: 32, status: "Active" },
            { name: "Security Compliance", assigned: 28, pipeline: 24, status: "Active" },
            { name: "Holiday 2024 Push", assigned: 25, pipeline: 15, status: "Completed" },
        ],
        performanceTrend: [45, 52, 58, 63, 68, 72, 75, 78, 82, 85, 87, 89],
        notes: [
            { date: "Jan 15, 2025", content: "Excellent momentum on Gemini deals. Team is well trained." },
            { date: "Jan 8, 2025", content: "Discussed expanding coverage to include Looker practice." },
            { date: "Dec 20, 2024", content: "Q4 review complete. Exceeded all targets." },
        ],
        recentActivity: [
            { date: "Jan 18, 2025", action: "Moved 3 opportunities to SS2" },
            { date: "Jan 16, 2025", action: "Added 5 leads to pipeline" },
            { date: "Jan 14, 2025", action: "Completed Gemini workshop with prospect" },
        ],
    },
};

// Helper to get campaign detail by ID
export function getCampaignDetail(id: string): CampaignDetail | undefined {
    return campaignDetails[id] ?? campaignDetails.c1;
}

// Helper to get partner detail by ID  
export function getPartnerDetail(id: string): PartnerDetail | undefined {
    return partnerDetails[id] ?? partnerDetails.p1;
}
