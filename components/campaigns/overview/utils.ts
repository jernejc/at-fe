import type { CampaignOverview, MembershipRead } from '@/lib/schemas';
import { AccountNeedingAttention, OutreachPipeline } from './types';

// ============================================================================
// Mock Data Generation (to be replaced with real API data)
// ============================================================================

export const MOCK_PARTNER_NAMES = [
    'Acme Solutions',
    'TechForward Partners',
    'CloudScale Consulting',
    'DataDriven Agency',
    'Growth Accelerators',
    'Innovation Labs',
];

// Enrich companies with mock partner data when API doesn't return any
export function enrichCompaniesWithMockPartners(
    companies: MembershipRead[],
    topCompanies?: MembershipRead[]
): MembershipRead[] {
    // Use companies if available, otherwise fall back to topCompanies
    const source = companies.length > 0 ? companies : (topCompanies || []);

    if (source.length === 0) return [];

    // Check if data already has partners
    const hasPartnerData = source.some(c => c.partner_id);
    if (hasPartnerData) return source;

    // Assign partners deterministically based on index (~60% get partners)
    return source.map((company, idx) => {
        // Use a deterministic pattern: first 3 always get partners, then every other one roughly
        const shouldAssign = idx < 3 || (idx % 5 !== 4);
        if (shouldAssign) {
            const partnerIdx = idx % MOCK_PARTNER_NAMES.length;
            return {
                ...company,
                partner_id: `partner-${partnerIdx + 1}`,
                partner_name: MOCK_PARTNER_NAMES[partnerIdx],
            };
        }
        return company;
    });
}

export function generateMockPipeline(companies: MembershipRead[]): OutreachPipeline {
    const total = companies.length;
    if (total === 0) {
        // Provide reasonable mock defaults aligned with other cards (Total 28)
        // 15 Not Started, 9 Contacted, 3 Responded, 1 Meeting
        return { not_started: 15, contacted: 9, responded: 3, meeting_booked: 1 };
    }

    const meetingBooked = Math.floor(total * 0.05);
    const responded = Math.floor(total * 0.12);
    const contacted = Math.floor(total * 0.35);
    const notStarted = total - meetingBooked - responded - contacted;

    return { not_started: notStarted, contacted, responded, meeting_booked: meetingBooked };
}

export function generateAccountsNeedingAttention(companies: MembershipRead[]): AccountNeedingAttention[] {
    // 1. Unassigned High Fit (Priority)
    const highFitUnassigned = companies
        .filter(c => !c.partner_id && (c.cached_fit_score || 0) >= 0.7)
        .sort((a, b) => (b.cached_fit_score || 0) - (a.cached_fit_score || 0))
        .map(c => ({
            domain: c.domain,
            name: c.company_name || c.domain,
            industry: c.industry,
            fitScore: c.cached_fit_score,
            logoBase64: c.logo_base64,
            reason: 'unassigned_high_fit' as const,
            reasonLabel: 'High fit, unassigned',
        }));

    // If we have enough unassigned, just return them
    if (highFitUnassigned.length >= 4) return highFitUnassigned.slice(0, 4);

    // 2. Newly Added High Potential (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newAndPromising = companies
        .filter(c =>
            new Date(c.created_at) > sevenDaysAgo &&
            (c.cached_fit_score || 0) >= 0.6 &&
            !highFitUnassigned.find(h => h.domain === c.domain)
        )
        .sort((a, b) => (b.cached_fit_score || 0) - (a.cached_fit_score || 0))
        .map(c => ({
            domain: c.domain,
            name: c.company_name || c.domain,
            industry: c.industry,
            fitScore: c.cached_fit_score,
            logoBase64: c.logo_base64,
            reason: 'newly_added' as const,
            reasonLabel: 'New high potential',
        }));

    const result = [...highFitUnassigned, ...newAndPromising].slice(0, 4);



    return result;
}

// Calculate fit distribution from actual companies
export function calculateFitDistribution(companies: MembershipRead[]): CampaignOverview['fit_distribution'] {
    const distribution = {
        '80-100': 0,
        '60-80': 0,
        '40-60': 0,
        '20-40': 0,
        '0-20': 0,
        unscored: 0
    };

    if (!companies || companies.length === 0) return distribution;

    companies.forEach(company => {
        const score = company.cached_fit_score;
        if (score === null || score === undefined) {
            distribution.unscored++;
            return;
        }

        const percentage = score * 100;
        if (percentage >= 80) distribution['80-100']++;
        else if (percentage >= 60) distribution['60-80']++;
        else if (percentage >= 40) distribution['40-60']++;
        else if (percentage >= 20) distribution['20-40']++;
        else distribution['0-20']++;
    });

    return distribution;
}

// ============================================================================
// Color Helpers
// ============================================================================

export const getFitColor = (range: string) => {
    const start = parseInt(range.split('-')[0]);
    if (start >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
    if (start >= 60) return { bg: 'bg-green-500', text: 'text-green-600 dark:text-green-400' };
    if (start >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' };
    if (start >= 20) return { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' };
    return { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
};
