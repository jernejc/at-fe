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
} from '@/lib/schemas';

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

export type CampaignTab = 'overview' | 'companies' | 'comparison' | 'partners';

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
            setOverview(overviewData);

            // Refresh companies list if it's already loaded or we are on that tab
            if (activeTab === 'companies' || companies.length > 0) {
                const result = await getCampaignCompanies(slug, { page_size: 50 });
                setCompanies(result.items);
            }
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
                setOverview(overviewData);
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
                    setCompanies(result.items);
                } else if (activeTab === 'comparison' && !comparison) {
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
