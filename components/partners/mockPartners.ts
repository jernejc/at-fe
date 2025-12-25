// Real Google Cloud Partners - Mock data for demo purposes
// Using Google's favicon service as a reliable fallback

import { Partner } from '@/lib/schemas/campaign';

// Google Cloud Premier Partners with real company information
export const MOCK_PARTNERS: Partner[] = [
    {
        id: 'sada',
        name: 'SADA',
        type: 'consulting',
        description: 'Multiple-time Google Cloud Partner of the Year. Specializes in AI/ML, security, data analytics, and cloud migration.',
        status: 'active',
        match_score: 98,
        logo_url: 'https://www.google.com/s2/favicons?domain=sada.com&sz=64',
        capacity: 25,
        assigned_count: 0,
        industries: ['Technology', 'Healthcare', 'Retail', 'Financial Services'],
    },
    {
        id: 'accenture',
        name: 'Accenture',
        type: 'consulting',
        description: 'Global professional services company providing strategy, consulting, digital, technology and operations services.',
        status: 'active',
        match_score: 96,
        logo_url: 'https://www.google.com/s2/favicons?domain=accenture.com&sz=64',
        capacity: 50,
        assigned_count: 0,
        industries: ['Enterprise', 'Financial Services', 'Healthcare', 'Automotive'],
    },
    {
        id: 'slalom',
        name: 'Slalom',
        type: 'consulting',
        description: 'Modern consulting firm focused on technology-enabled transformation. Expertise in Vertex AI and data analytics.',
        status: 'active',
        match_score: 94,
        logo_url: 'https://www.google.com/s2/favicons?domain=slalom.com&sz=64',
        capacity: 20,
        assigned_count: 0,
        industries: ['Technology', 'Retail', 'Media'],
    },
    {
        id: 'datatonic',
        name: 'Datatonic',
        type: 'technology',
        description: 'Data & AI consultancy specializing in BigQuery, Generative AI projects, and machine learning implementations.',
        status: 'active',
        match_score: 92,
        logo_url: 'https://www.google.com/s2/favicons?domain=datatonic.com&sz=64',
        capacity: 15,
        assigned_count: 0,
        industries: ['Technology', 'E-commerce', 'Media'],
    },
    {
        id: 'searce',
        name: 'Searce',
        type: 'technology',
        description: 'Cloud-native tech consulting firm focused on Cloud, AI, and Analytics. Premier Google Cloud Partner.',
        status: 'active',
        match_score: 90,
        logo_url: 'https://www.google.com/s2/favicons?domain=searce.com&sz=64',
        capacity: 18,
        assigned_count: 0,
        industries: ['Startups', 'SaaS', 'Fintech'],
    },
    {
        id: 'doit',
        name: 'DoiT International',
        type: 'reseller',
        description: 'Cloud optimization experts specializing in cost-optimized analytics architectures and multi-cloud environments.',
        status: 'active',
        match_score: 88,
        logo_url: 'https://www.google.com/s2/favicons?domain=doit.com&sz=64',
        capacity: 30,
        assigned_count: 0,
        industries: ['Technology', 'SaaS', 'Startups'],
    },
];

// Smaller subset for PartnerTab (campaign-level assigned partners)
export const DEFAULT_CAMPAIGN_PARTNERS = MOCK_PARTNERS.slice(0, 3);

// Mock account assignments with outreach progress for Partner Detail view
import { MembershipWithProgress, OutreachStatus } from '@/lib/schemas/campaign';

const OUTREACH_STATUSES: OutreachStatus[] = ['not_started', 'draft', 'sent', 'replied', 'meeting_booked'];

// Helper to generate mock progress data
function generateMockProgress(partnerId: string, domains: string[]): MembershipWithProgress[] {
    return domains.map((domain, idx) => {
        const status = OUTREACH_STATUSES[idx % OUTREACH_STATUSES.length];
        const baseFit = 0.6 + Math.random() * 0.35;

        return {
            id: idx + 1,
            company_id: idx + 100,
            domain,
            company_name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
            industry: ['Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail'][idx % 5],
            employee_count: [500, 2000, 10000, 250, 5000][idx % 5],
            hq_country: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia'][idx % 5],
            segment: ['Enterprise', 'Mid-Market', 'SMB'][idx % 3],
            cached_fit_score: parseFloat(baseFit.toFixed(2)),
            cached_likelihood_score: parseFloat((Math.random() * 0.4 + 0.5).toFixed(2)),
            cached_urgency_score: parseFloat((Math.random() * 0.5 + 0.3).toFixed(2)),
            is_processed: true,
            notes: null,
            priority: idx % 3,
            created_at: new Date(Date.now() - idx * 86400000).toISOString(),
            partner_id: partnerId,
            partner_name: MOCK_PARTNERS.find(p => p.id === partnerId)?.name ?? null,
            // Progress fields
            outreach_status: status,
            outreach_sent_at: status !== 'not_started' && status !== 'draft'
                ? new Date(Date.now() - (idx * 2 + 1) * 86400000).toISOString()
                : undefined,
            decision_makers_count: Math.floor(Math.random() * 5) + 1,
            last_activity: new Date(Date.now() - idx * 43200000).toISOString(),
        };
    });
}

// Pre-generated mock assignments per partner
export const MOCK_PARTNER_ACCOUNTS: Record<string, MembershipWithProgress[]> = {
    'sada': generateMockProgress('sada', [
        'stripe.com', 'figma.com', 'notion.so', 'linear.app', 'vercel.com'
    ]),
    'accenture': generateMockProgress('accenture', [
        'salesforce.com', 'servicenow.com', 'workday.com', 'adobe.com', 'docusign.com', 'twilio.com', 'datadog.com'
    ]),
    'slalom': generateMockProgress('slalom', [
        'atlassian.com', 'asana.com', 'monday.com', 'airtable.com'
    ]),
    'datatonic': generateMockProgress('datatonic', [
        'snowflake.com', 'databricks.com', 'dbt.com'
    ]),
    'searce': generateMockProgress('searce', [
        'supabase.com', 'planetscale.com', 'neon.tech', 'cockroachlabs.com'
    ]),
    'doit': generateMockProgress('doit', [
        'hashicorp.com', 'pulumi.com', 'grafana.com', 'elastic.co', 'confluent.io', 'mongodb.com'
    ]),
};
