export function getScoreCategory(score: number): 'hot' | 'warm' | 'cold' {
    if (score >= 80) return 'hot';
    if (score >= 60) return 'warm';
    return 'cold';
}

export function getScoreLabel(score: number): string {
    const category = getScoreCategory(score);
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getUrgencyLabel(urgency: number | null): string {
    if (urgency === null) return 'Unknown';
    if (urgency >= 8) return 'Immediate';
    if (urgency >= 5) return 'Near-term';
    return 'Future';
}

export function formatEmployeeCount(count: number | null): string {
    if (count === null) return 'Unknown';
    if (count >= 10000) return `${Math.floor(count / 1000)}K+`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
}

// Product group definitions
export const PRODUCT_GROUPS = [
    { id: 'gen_ai', name: 'Gen AI / Agentic AI', color: '#8b5cf6' },
    { id: 'database', name: 'Database Modernization / Cloud Infra', color: '#3b82f6' },
    { id: 'collaboration', name: 'Collaboration & Productivity', color: '#10b981' },
] as const;

export type ProductGroupId = typeof PRODUCT_GROUPS[number]['id'];
