import type { OutreachStatus } from '@/lib/config/outreach';

// Dashboard Analytics
export const demoDashboardAnalytics = {
    pipelineValue: 2450000,
    wonRevenue: 875000,
    activeOpportunities: 47,
    conversionRate: 12.5,
    pipelineTrend: 23,
    revenueTrend: 15,
    opportunitiesTrend: 8,
    conversionTrend: 2.1,
    monthlyTrend: [
        { month: 'Aug', value: 1800000 },
        { month: 'Sep', value: 2200000 },
        { month: 'Oct', value: 1950000 },
        { month: 'Nov', value: 2100000 },
        { month: 'Dec', value: 2300000 },
        { month: 'Jan', value: 2450000 },
    ],
    outreachFunnel: {
        not_started: 45,
        draft: 10,
        sent: 32,
        replied: 18,
        meeting_booked: 12,
    } as Record<OutreachStatus, number>,
};

// Campaign Analytics
export const demoCampaignAnalytics = {
    responseRate: 24,
    meetingsBooked: 12,
    campaignROI: 3.2,
    avgDealCycle: 34,
    outreachDistribution: {
        not_started: 28,
        draft: 8,
        sent: 15,
        replied: 12,
        meeting_booked: 7,
    } as Record<OutreachStatus, number>,
};

// Company Analytics
export type DealStage = 'lead' | 'qualified' | 'demo' | 'proposal' | 'closed';

export const DEAL_STAGES: { id: DealStage; label: string }[] = [
    { id: 'lead', label: 'Lead' },
    { id: 'qualified', label: 'Qualified' },
    { id: 'demo', label: 'Demo' },
    { id: 'proposal', label: 'Proposal' },
    { id: 'closed', label: 'Closed' },
];

export interface TimelineEvent {
    id: number;
    date: string;
    event: string;
    type: 'email_sent' | 'email_opened' | 'reply' | 'meeting' | 'call' | 'note';
}

export interface Stakeholder {
    id: number;
    name: string;
    title: string;
    engaged: boolean;
    lastActivity: string | null;
}

export const demoCompanyAnalytics = {
    currentStage: 'demo' as DealStage,
    timeline: [
        { id: 1, date: 'Jan 15', event: 'Initial email sent', type: 'email_sent' },
        { id: 2, date: 'Jan 17', event: 'Email opened (3x)', type: 'email_opened' },
        { id: 3, date: 'Jan 18', event: 'Reply received', type: 'reply' },
        { id: 4, date: 'Jan 22', event: 'Discovery call completed', type: 'call' },
        { id: 5, date: 'Jan 25', event: 'Demo scheduled', type: 'meeting' },
    ] as TimelineEvent[],
    stakeholders: [
        { id: 1, name: 'Sarah Chen', title: 'CTO', engaged: true, lastActivity: '2 days ago' },
        { id: 2, name: 'Mike Johnson', title: 'VP Engineering', engaged: false, lastActivity: null },
        { id: 3, name: 'Lisa Park', title: 'Director of IT', engaged: true, lastActivity: '1 week ago' },
    ] as Stakeholder[],
    dealValue: 150000,
    probability: 65,
    expectedCloseDate: 'Feb 28, 2025',
};
