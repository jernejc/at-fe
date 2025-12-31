'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    getCampaign,
    getCampaignOverview,
    getCampaignCompanies,
    getCampaignComparison,
    deleteCampaign,
    updateCampaign,
    getCompanies,
} from '@/lib/api';
import type {
    CampaignRead,
    CampaignOverview,
    MembershipRead,
    CampaignComparison,
    CampaignFilterUI,
    CompanyFilters,
    CompanySummary,
    CompanySummaryWithFit,
    FitDistribution,
} from '@/lib/schemas';

// ============================================================================
// Mock Data Generation (temporary - to be removed when API is ready)
// ============================================================================

const MOCK_PARTNER_NAMES = [
    'Acme Solutions',
    'TechForward Partners',
    'CloudScale Consulting',
    'DataDriven Agency',
    'Growth Accelerators',
    'Innovation Labs',
];

function generateMockFitDistribution(companies: MembershipRead[]): FitDistribution {
    // Generate realistic distribution based on actual data
    const total = companies.length;

    if (total === 0) {
        // Empty state - return zeros
        return {
            '80-100': 0,
            '60-80': 0,
            '40-60': 0,
            '20-40': 0,
            '0-20': 0,
            unscored: 0,
        };
    }

    // Bell-curve-ish distribution favoring middle scores
    return {
        '80-100': Math.round(total * 0.12),
        '60-80': Math.round(total * 0.25),
        '40-60': Math.round(total * 0.30),
        '20-40': Math.round(total * 0.20),
        '0-20': Math.round(total * 0.08),
        unscored: Math.round(total * 0.05),
    };
}

function generateMockPartnerData(companies: MembershipRead[]): MembershipRead[] {
    // Assign ~60% of companies to random partners
    return companies.map((company, idx) => {
        if (Math.random() < 0.6) {
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

function enrichOverviewWithMockData(
    overview: CampaignOverview,
    companies: MembershipRead[]
): CampaignOverview {
    const hasRealFitData = overview.fit_distribution &&
        Object.values(overview.fit_distribution).some(v => v > 0);

    // Use companies if available, otherwise fall back to top_companies
    const dataSource = companies.length > 0 ? companies : (overview.top_companies || []);

    // Calculate actual company count from available sources - no artificial minimum
    // But ensure at least 28 for mock/demo purposes if everything is empty
    const actualCompanyCount = Math.max(
        overview.company_count,
        overview.top_companies?.length || 0,
        companies.length,
        28 // Mock fallback
    );

    // Generate mock fit distribution based on available data source
    const mockFitDistribution = generateMockFitDistributionFromCount(actualCompanyCount);

    return {
        ...overview,
        company_count: actualCompanyCount,
        processed_count: Math.max(overview.processed_count, Math.round(actualCompanyCount * 0.75)),
        fit_distribution: hasRealFitData
            ? overview.fit_distribution
            : mockFitDistribution,
    };
}

// Generate fit distribution based on a count rather than an array
function generateMockFitDistributionFromCount(total: number): FitDistribution {
    if (total === 0) {
        return {
            '80-100': 0,
            '60-80': 0,
            '40-60': 0,
            '20-40': 0,
            '0-20': 0,
            unscored: 0,
        };
    }

    // Bell-curve-ish distribution favoring middle scores
    return {
        '80-100': Math.round(total * 0.12),
        '60-80': Math.round(total * 0.25),
        '40-60': Math.round(total * 0.30),
        '20-40': Math.round(total * 0.20),
        '0-20': Math.round(total * 0.08),
        unscored: Math.round(total * 0.05),
    };
}

// Convert CampaignFilterUI array to CompanyFilters for API
function filtersToCompanyFilters(filters: CampaignFilterUI[], productId?: number | null): CompanyFilters {
    const companyFilters: CompanyFilters = {
        page: 1,
        page_size: 100,
    };

    if (productId) {
        companyFilters.product_id = productId;
    }

    for (const filter of filters) {
        switch (filter.type) {
            case 'industry':
                companyFilters.industry = filter.value;
                break;
            case 'country':
                companyFilters.country = filter.value;
                break;
            case 'size_min':
                companyFilters.min_employees = parseInt(filter.value) || undefined;
                break;
            case 'size_max':
                companyFilters.max_employees = parseInt(filter.value) || undefined;
                break;
        }
    }

    return companyFilters;
}

export type CampaignTab = 'overview' | 'companies' | 'analysis' | 'partners';

interface UseCampaignPageOptions {
    slug: string;
}

interface UseCampaignPageReturn {
    // Core data
    campaign: CampaignRead | null;
    overview: CampaignOverview | null;
    companies: MembershipRead[];
    comparison: CampaignComparison | null;

    // Loading & error states
    loading: boolean;
    error: string | null;

    // Tab management
    activeTab: CampaignTab;
    setActiveTab: (tab: CampaignTab) => void;

    // Account detail popover
    selectedDomain: string | null;
    detailOpen: boolean;
    handleCompanyClick: (domain: string) => void;
    closeDetail: () => void;

    // Delete functionality
    isDeleting: boolean;
    handleDelete: () => Promise<void>;

    // Filter management
    filters: CampaignFilterUI[];
    handleFiltersChange: (filters: CampaignFilterUI[]) => void;
    isSavingFilters: boolean;

    // Dynamic companies (from filters)
    dynamicCompanies: (CompanySummary | CompanySummaryWithFit)[];
    dynamicCompaniesTotal: number;
    loadingDynamicCompanies: boolean;

    // Data refresh
    refreshData: () => Promise<void>;
}

export function useCampaignPage({ slug }: UseCampaignPageOptions): UseCampaignPageReturn {
    const router = useRouter();

    // Core data states
    const [campaign, setCampaign] = useState<CampaignRead | null>(null);
    const [overview, setOverview] = useState<CampaignOverview | null>(null);
    const [companies, setCompanies] = useState<MembershipRead[]>([]);
    const [comparison, setComparison] = useState<CampaignComparison | null>(null);

    // Loading & error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Tab management
    const [activeTab, setActiveTab] = useState<CampaignTab>('overview');

    // Account detail popover state
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Delete state
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter state
    const [filters, setFilters] = useState<CampaignFilterUI[]>([]);
    const [isSavingFilters, setIsSavingFilters] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Dynamic companies based on filters
    const [dynamicCompanies, setDynamicCompanies] = useState<(CompanySummary | CompanySummaryWithFit)[]>([]);
    const [dynamicCompaniesTotal, setDynamicCompaniesTotal] = useState(0);
    const [loadingDynamicCompanies, setLoadingDynamicCompanies] = useState(false);
    const fetchCompaniesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Extract filters from campaign.target_criteria when campaign loads
    useEffect(() => {
        if (campaign?.target_criteria?.filters) {
            setFilters(campaign.target_criteria.filters);
        } else {
            setFilters([]);
        }
    }, [campaign]);

    // Fetch companies dynamically based on filters
    const fetchDynamicCompanies = useCallback(async () => {
        if (filters.length === 0) {
            setDynamicCompanies([]);
            setDynamicCompaniesTotal(0);
            return;
        }

        setLoadingDynamicCompanies(true);
        try {
            const companyFilters = filtersToCompanyFilters(filters, campaign?.target_product_id);
            const result = await getCompanies(companyFilters);
            setDynamicCompanies(result.items);
            setDynamicCompaniesTotal(result.total);
        } catch (err) {
            console.error('Failed to fetch dynamic companies:', err);
            setDynamicCompanies([]);
            setDynamicCompaniesTotal(0);
            toast.error('Failed to search companies', {
                description: 'Please try adjusting your filters',
            });
        } finally {
            setLoadingDynamicCompanies(false);
        }
    }, [filters, campaign?.target_product_id]);

    // Debounced fetch when filters change
    useEffect(() => {
        if (fetchCompaniesTimeoutRef.current) {
            clearTimeout(fetchCompaniesTimeoutRef.current);
        }

        fetchCompaniesTimeoutRef.current = setTimeout(() => {
            fetchDynamicCompanies();
        }, 300);

        return () => {
            if (fetchCompaniesTimeoutRef.current) {
                clearTimeout(fetchCompaniesTimeoutRef.current);
            }
        };
    }, [fetchDynamicCompanies]);

    // Handle filter changes with debounced save
    const handleFiltersChange = useCallback((newFilters: CampaignFilterUI[]) => {
        setFilters(newFilters);

        // Debounce the save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSavingFilters(true);
            try {
                const updatedCampaign = await updateCampaign(slug, {
                    target_criteria: { filters: newFilters },
                });
                setCampaign(updatedCampaign);
            } catch (error) {
                console.error('Failed to save filters:', error);
                toast.error('Failed to save filters', {
                    description: error instanceof Error ? error.message : 'Please try again',
                });
            } finally {
                setIsSavingFilters(false);
            }
        }, 500);
    }, [slug]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            if (fetchCompaniesTimeoutRef.current) {
                clearTimeout(fetchCompaniesTimeoutRef.current);
            }
        };
    }, []);

    // Company click handler
    const handleCompanyClick = useCallback((domain: string) => {
        setSelectedDomain(domain);
        setDetailOpen(true);
    }, []);

    // Close detail popover
    const closeDetail = useCallback(() => {
        setDetailOpen(false);
    }, []);

    // Refresh data
    const refreshData = useCallback(async () => {
        try {
            // Refresh overview always as it affects stats and top companies
            const overviewData = await getCampaignOverview(slug);

            // Refresh companies list if it's already loaded or we are on that tab
            let newCompanies = companies;
            if (activeTab === 'companies' || companies.length > 0) {
                const result = await getCampaignCompanies(slug, { page_size: 50 });
                // Enrich companies with mock partner data if API returns none
                const hasPartnerData = result.items.some(c => c.partner_id);
                newCompanies = hasPartnerData
                    ? result.items
                    : generateMockPartnerData(result.items);
                setCompanies(newCompanies);
            }

            // Enrich overview with mock data if API returns empty values
            const enrichedOverview = enrichOverviewWithMockData(overviewData, newCompanies);
            setOverview(enrichedOverview);
        } catch (error) {
            console.error('Failed to refresh data', error);
            toast.error('Failed to refresh data', {
                description: 'Please try again',
            });
        }
    }, [slug, activeTab, companies.length]);

    // Delete campaign handler
    const handleDelete = useCallback(async () => {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteCampaign(slug);
            toast.success('Campaign deleted');
            router.push('/campaigns');
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            toast.error('Failed to delete campaign', {
                description: error instanceof Error ? error.message : 'Please try again',
            });
            setIsDeleting(false);
        }
    }, [slug, router]);

    // Initial data fetch
    useEffect(() => {
        async function fetchCampaign() {
            try {
                const [campaignData, overviewData] = await Promise.all([
                    getCampaign(slug),
                    getCampaignOverview(slug),
                ]);
                setCampaign(campaignData);
                // Enrich overview with mock data if API returns empty values
                const enrichedOverview = enrichOverviewWithMockData(overviewData, []);
                setOverview(enrichedOverview);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load campaign');
                console.error('Error fetching campaign:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCampaign();
    }, [slug]);

    // Load data for active tab
    useEffect(() => {
        async function fetchTabData() {
            try {
                if (activeTab === 'companies' && companies.length === 0) {
                    const result = await getCampaignCompanies(slug, { page_size: 50 });
                    // Enrich companies with mock partner data if API returns none
                    const hasPartnerData = result.items.some(c => c.partner_id);
                    const enrichedCompanies = hasPartnerData
                        ? result.items
                        : generateMockPartnerData(result.items);
                    setCompanies(enrichedCompanies);
                } else if (activeTab === 'analysis' && !comparison) {
                    const result = await getCampaignComparison(slug, { limit: 50 });
                    setComparison(result);
                }
            } catch (err) {
                console.error('Error fetching tab data:', err);
            }
        }

        if (!loading && campaign) {
            fetchTabData();
        }
    }, [activeTab, slug, loading, campaign, companies.length, comparison]);

    // Re-enrich overview when companies load to get better fit distribution estimates
    useEffect(() => {
        if (overview && companies.length > 0) {
            const enrichedOverview = enrichOverviewWithMockData(overview, companies);
            // Only update if values actually changed
            if (enrichedOverview.company_count !== overview.company_count ||
                JSON.stringify(enrichedOverview.fit_distribution) !== JSON.stringify(overview.fit_distribution)) {
                setOverview(enrichedOverview);
            }
        }
    }, [companies.length]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        // Core data
        campaign,
        overview,
        companies,
        comparison,

        // Loading & error states
        loading,
        error,

        // Tab management
        activeTab,
        setActiveTab,

        // Account detail popover
        selectedDomain,
        detailOpen,
        handleCompanyClick,
        closeDetail,

        // Delete functionality
        isDeleting,
        handleDelete,

        // Filter management
        filters,
        handleFiltersChange,
        isSavingFilters,

        // Dynamic companies
        dynamicCompanies,
        dynamicCompaniesTotal,
        loadingDynamicCompanies,

        // Data refresh
        refreshData,
    };
}
