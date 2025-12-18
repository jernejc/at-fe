import type { CampaignFilterUI } from '@/lib/schemas/campaign';

// Simple keyword matching for natural language parsing
export const INDUSTRY_KEYWORDS = ['tech', 'technology', 'software', 'saas', 'healthcare', 'health', 'finance', 'financial', 'retail', 'manufacturing', 'education', 'media', 'energy'];
export const SIZE_KEYWORDS = ['enterprise', 'startup', 'small', 'medium', 'large', 'smb'];
export const COUNTRY_KEYWORDS = ['us', 'usa', 'united states', 'uk', 'germany', 'france', 'canada', 'australia'];

// Dropdown options
export const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Media', 'Energy'];
export const SIZE_OPTIONS = [
    { label: 'Startup (1-50)', value: '50', type: 'size_max' as const },
    { label: 'Small (50-200)', value: '50', type: 'size_min' as const },
    { label: 'Medium (200-1000)', value: '200', type: 'size_min' as const },
    { label: 'Enterprise (1000+)', value: '1000', type: 'size_min' as const },
];
export const COUNTRY_OPTIONS = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia'];

export function parseNaturalLanguage(input: string): CampaignFilterUI | null {
    const lower = input.toLowerCase().trim();

    // Parse "50+ employees" or "1000 employees"
    const sizeMatch = lower.match(/(\d+)\+?\s*(employees?)?/);
    if (sizeMatch) {
        return {
            id: crypto.randomUUID(),
            type: 'size_min',
            value: sizeMatch[1],
            displayLabel: `${parseInt(sizeMatch[1]).toLocaleString()}+ employees`
        };
    }

    // Keyword matching for size
    if (SIZE_KEYWORDS.some(k => lower.includes(k))) {
        if (lower.includes('enterprise') || lower.includes('large')) {
            return { id: crypto.randomUUID(), type: 'size_min', value: '1000', displayLabel: 'Enterprise (1000+)' };
        }
        if (lower.includes('startup') || lower.includes('small')) {
            return { id: crypto.randomUUID(), type: 'size_max', value: '100', displayLabel: 'Startup (< 100)' };
        }
        if (lower.includes('smb') || lower.includes('medium')) {
            return { id: crypto.randomUUID(), type: 'size_min', value: '50', displayLabel: 'SMB (50-500)' };
        }
    }

    // Keyword matching for industry
    for (const industry of INDUSTRY_KEYWORDS) {
        if (lower.includes(industry)) {
            const displayName = industry.charAt(0).toUpperCase() + industry.slice(1);
            return { id: crypto.randomUUID(), type: 'industry', value: displayName, displayLabel: displayName };
        }
    }

    // Keyword matching for country
    for (const country of COUNTRY_KEYWORDS) {
        if (lower.includes(country)) {
            let displayName = country;
            if (country === 'us' || country === 'usa' || country === 'united states') displayName = 'United States';
            else if (country === 'uk') displayName = 'United Kingdom';
            else displayName = country.charAt(0).toUpperCase() + country.slice(1);

            return { id: crypto.randomUUID(), type: 'country', value: displayName, displayLabel: displayName };
        }
    }

    // Fallback to generic query if long enough
    if (input.trim().length > 2) {
        return { id: crypto.randomUUID(), type: 'natural_query', value: input.trim(), displayLabel: input.trim() };
    }

    return null;
}
