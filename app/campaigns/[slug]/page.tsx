'use client';

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AccountDetail } from '@/components/accounts';
import { CampaignHeader, OverviewTab, OverviewTabSkeleton, CompaniesTab, AnalysisTab, PartnerTab, type DrillDownFilter } from '@/components/campaigns';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/Header';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useCampaignPage } from '@/hooks/useCampaignPage';
import { toast } from 'sonner';
import { MOCK_PARTNER_ACCOUNTS } from '@/components/partners/mockPartners';
import type { CampaignFilterUI, MembershipRead } from '@/lib/schemas';

interface CampaignPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
    const { slug } = use(params);
    const router = useRouter();

    const {
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
    } = useCampaignPage({ slug });

    // Consistent company data for Partner Tab
    // Priority:
    // 1. Memberships (companies that are part of the campaign)
    // 2. Dynamic companies (search/filter results) - mapped to be assignable
    // 3. Fallback only if absolutely nothing else exists
    const partnerTabCompanies = useMemo<MembershipRead[]>(() => {
        if (companies.length > 0) return companies;

        if (dynamicCompanies && dynamicCompanies.length > 0) {
            return dynamicCompanies.map((c, idx) => ({
                id: 20000 + idx, // Temporary ID for prospects
                company_id: 0,
                domain: c.domain,
                company_name: c.name,
                industry: c.industry,
                employee_count: c.employee_count,
                hq_country: c.hq_country,
                segment: null,
                logo_base64: c.logo_base64,
                partner_id: null,
                partner_name: null,
                cached_fit_score: 'combined_score' in c ? (c as any).combined_score : null,
                cached_likelihood_score: null,
                cached_urgency_score: null,
                created_at: new Date().toISOString(),
                status: 'active' as const,
                is_processed: false,
                notes: null,
                priority: 0,
            }));
        }

        return [];
    }, [companies, dynamicCompanies]);

    // Handle drill-down filtering from overview charts
    const handleDrillDown = (filter: DrillDownFilter) => {
        if (filter.type === 'industry') {
            // Add industry filter
            const newFilter: CampaignFilterUI = {
                id: `industry-${Date.now()}`,
                type: 'industry',
                value: filter.value,
                displayLabel: filter.label,
            };
            handleFiltersChange([...filters, newFilter]);
            toast.success('Filter applied', {
                description: `Filtering by ${filter.label}`,
            });
        } else if (filter.type === 'fit_range') {
            // For fit range, we'll show a toast and switch to companies tab
            // The actual filtering would need backend support for fit score ranges
            toast.info('Fit range filtering', {
                description: `Showing companies with ${filter.label}`,
            });
            setActiveTab('companies');
        }
    };

    if (loading) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{error || 'Campaign not found'}</p>
                    <Button
                        onClick={() => router.push('/')}
                        size="lg"
                        className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all"
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                {/* Campaign Header with Tabs */}
                <CampaignHeader
                    campaign={campaign}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                    companyCount={overview?.company_count ?? dynamicCompaniesTotal ?? undefined}
                    partnerCount={new Set(partnerTabCompanies.filter(c => c.partner_id).map(c => c.partner_id)).size}
                />

                {/* Content Area */}
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <Tabs value={activeTab} className="w-full">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            {overview ? (
                                <OverviewTab
                                    overview={overview}
                                    companies={companies}
                                    dynamicCompanies={filters.length > 0 ? dynamicCompanies : undefined}
                                    dynamicCompaniesTotal={dynamicCompaniesTotal}
                                    loadingDynamicCompanies={loadingDynamicCompanies}
                                    onCompanyClick={handleCompanyClick}
                                    onManagePartners={() => setActiveTab('partners')}
                                    onViewAllCompanies={() => setActiveTab('companies')}
                                    onDrillDown={handleDrillDown}
                                />
                            ) : (
                                <OverviewTabSkeleton />
                            )}
                        </TabsContent>

                        {/* Companies Tab */}
                        <TabsContent value="companies" className="mt-0 animate-in fade-in-50">
                            <CompaniesTab
                                slug={slug}
                                companies={companies}
                                dynamicCompanies={filters.length > 0 ? dynamicCompanies : undefined}
                                dynamicCompaniesTotal={dynamicCompaniesTotal}
                                loadingDynamicCompanies={loadingDynamicCompanies}
                                onCompanyClick={handleCompanyClick}
                                onCompanyAdded={refreshData}
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                isSavingFilters={isSavingFilters}
                            />
                        </TabsContent>

                        {/* Analysis Tab */}
                        <TabsContent value="analysis" className="mt-0 animate-in fade-in-50">
                            {overview ? (
                                <AnalysisTab
                                    slug={slug}
                                    productId={campaign.target_product_id ?? undefined}
                                    overview={overview}
                                    comparison={comparison}
                                    onCompanyClick={handleCompanyClick}
                                />
                            ) : (
                                <div className="text-center py-12 text-slate-500">Loading analysis...</div>
                            )}
                        </TabsContent>

                        {/* Partners Tab */}
                        <TabsContent value="partners" className="mt-0 animate-in fade-in-50">
                            <PartnerTab
                                campaignSlug={slug}
                                companies={partnerTabCompanies}
                                onCompanyClick={handleCompanyClick}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Account Detail Popover */}
            {selectedDomain && (
                <AccountDetail
                    domain={selectedDomain}
                    open={detailOpen}
                    onClose={closeDetail}
                />
            )}
        </div>
    );
}
