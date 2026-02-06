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
    publishCampaign,
    unpublishCampaign,
    removeCompanyFromCampaign,
} from '@/lib/api';
import type {
    CampaignRead,
    CampaignOverview,
    MembershipRead,
    CampaignComparison,
    CampaignFilterUI,
    CompanySummary,
    CompanySummaryWithFit,
} from '@/lib/schemas';

// ============================================================================
// Helpers
// ============================================================================

export type CampaignTab = 'overview' | 'companies' | 'partners' | 'analysis';

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

    // Publish functionality
    isPublishing: boolean;
    handlePublish: () => Promise<void>;

    isUnpublishing: boolean;
    handleUnpublish: () => Promise<void>;

    // Company removal
    handleCompanyRemove: (domain: string) => Promise<void>;

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

    // Filter campaign companies based on filter criteria (client-side filtering)
    // This ensures we only show companies that are actually in the campaign, not from the general database
    const filterCampaignCompanies = useCallback((
        campaignCompanies: MembershipRead[],
        activeFilters: CampaignFilterUI[]
    ): MembershipRead[] => {
        if (activeFilters.length === 0) return campaignCompanies;

        return campaignCompanies.filter(company => {
            return activeFilters.every(filter => {
                switch (filter.type) {
                    case 'industry':
                        return company.industry?.toLowerCase().includes(filter.value.toLowerCase());
                    case 'country':
                        return company.hq_country?.toLowerCase().includes(filter.value.toLowerCase());
                    case 'size_min': {
                        const minEmployees = parseInt(filter.value);
                        return !minEmployees || (company.employee_count != null && company.employee_count >= minEmployees);
                    }
                    case 'size_max': {
                        const maxEmployees = parseInt(filter.value);
                        return !maxEmployees || (company.employee_count != null && company.employee_count <= maxEmployees);
                    }
                    default:
                        return true;
                }
            });
        });
    }, []);

    // Apply filters to campaign companies instead of fetching from general endpoint
    const fetchDynamicCompanies = useCallback(async () => {
        if (filters.length === 0) {
            setDynamicCompanies([]);
            setDynamicCompaniesTotal(0);
            return;
        }

        setLoadingDynamicCompanies(true);
        try {
            // First ensure we have campaign companies loaded
            let campaignCompanies = companies;
            if (campaignCompanies.length === 0 && slug) {
                // Load campaign companies if not already loaded
                const result = await getCampaignCompanies(slug, { page_size: 200 });
                campaignCompanies = result.items;
                // Only update state if we found companies to avoid infinite loop with empty array ref churn
                if (result.items.length > 0) {
                    setCompanies(result.items);
                }
            }
            
            // Apply client-side filtering to campaign companies
            const filteredCompanies = filterCampaignCompanies(campaignCompanies, filters);
            
            // Convert MembershipRead to CompanySummaryWithFit format for consistency
            const dynamicResults: (CompanySummary | CompanySummaryWithFit)[] = filteredCompanies.map(c => ({
                id: c.company_id,
                domain: c.domain,
                name: c.company_name || c.domain,
                industry: c.industry,
                employee_count: c.employee_count,
                hq_city: null,
                hq_country: c.hq_country,
                linkedin_id: null,
                rating_overall: null,
                logo_url: null,
                logo_base64: c.logo_base64 ?? null,
                data_sources: [],
                top_contact: null,
                updated_at: c.created_at,
                combined_score: c.cached_fit_score,
                likelihood_score: c.cached_likelihood_score,
                urgency_score: c.cached_urgency_score,
            }));
            
            setDynamicCompanies(dynamicResults);
            setDynamicCompaniesTotal(filteredCompanies.length);
        } catch (err) {
            console.error('Failed to filter campaign companies:', err);
            setDynamicCompanies([]);
            setDynamicCompaniesTotal(0);
            toast.error('Failed to filter companies', {
                description: 'Please try adjusting your filters',
            });
        } finally {
            setLoadingDynamicCompanies(false);
        }
    }, [filters, companies, slug, filterCampaignCompanies]);

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
            if (activeTab === 'companies' || companies.length > 0) {
                const result = await getCampaignCompanies(slug, { page_size: 50 });
                setCompanies(result.items);
            }

            setOverview(overviewData);
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
                if ((activeTab === 'companies' || activeTab === 'overview') && companies.length === 0) {
                    const result = await getCampaignCompanies(slug, { page_size: 50 });
                    // Enrich companies with mock partner data if API returns none
                    setCompanies(result.items);
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
    /* useEffect(() => {
        if (overview && companies.length > 0) {
           // We don't need to re-enrich with mock data anymore
        }
    }, [companies.length]); */

    // Publish functionality
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = useCallback(async () => {
        setIsPublishing(true);
        try {
            const updated = await publishCampaign(slug);
            setCampaign(updated);
            toast.success('Campaign published', {
                description: 'Notifications have been sent to partners.',
                descriptionClassName: '!text-foreground font-medium',
            });
            // Update overview/stats if needed
            refreshData(); 
        } catch (error) {
            console.error('Failed to publish campaign:', error);
            toast.error('Failed to publish campaign', {
                description: error instanceof Error ? error.message : 'Please try again',
            });
        } finally {
            setIsPublishing(false);
        }
    }, [slug, refreshData]);

    const [isUnpublishing, setIsUnpublishing] = useState(false);

    const handleUnpublish = useCallback(async () => {
        setIsUnpublishing(true);
        try {
            const updated = await unpublishCampaign(slug);
            setCampaign(updated);
            toast.success('Campaign unpublished', {
                description: 'Campaign is now in draft mode.',
                descriptionClassName: '!text-foreground font-medium',
            });
            // Update overview/stats if needed
            refreshData(); 
        } catch (error) {
            console.error('Failed to unpublish campaign:', error);
            toast.error('Failed to unpublish campaign', {
                description: error instanceof Error ? error.message : 'Please try again',
            });
        } finally {
            setIsUnpublishing(false);
        }
    }, [slug, refreshData]);

    // Remove company from campaign
    const handleCompanyRemove = useCallback(async (domain: string) => {
        try {
            await removeCompanyFromCampaign(slug, domain);
            toast.success('Company removed', {
                description: `${domain} has been removed from the campaign`,
                descriptionClassName: '!text-foreground font-medium',
            });
            // Refresh data to update the company list
            await refreshData();
        } catch (error) {
            console.error('Failed to remove company:', error);
            toast.error('Failed to remove company', {
                description: error instanceof Error ? error.message : 'Please try again',
            });
        }
    }, [slug, refreshData]);

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

        // Publish functionality
        isPublishing,
        handlePublish,

        isUnpublishing,
        handleUnpublish,

        // Company removal
        handleCompanyRemove,

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
