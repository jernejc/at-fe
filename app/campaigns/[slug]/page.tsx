'use client';

import { use, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AccountDetail } from '@/components/accounts';
import { CampaignHeader, CompaniesTab, AnalysisTab, PartnerTab, OverviewTab, OverviewTabSkeleton, type DrillDownFilter } from '@/components/campaigns';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Header } from '@/components/ui/Header';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useCampaignPage } from '@/hooks/useCampaignPage';
import { toast } from 'sonner';
import { getCampaignPartners, getPartnerAssignedCompanies } from '@/lib/api';
import type { CampaignFilterUI, MembershipRead, PartnerAssignmentSummary } from '@/lib/schemas';

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

    // Centralized partner data loading (shared by Overview and Partners tabs)
    const [partners, setPartners] = useState<PartnerAssignmentSummary[]>([]);
    const [companyToPartnerMap, setCompanyToPartnerMap] = useState<Map<number, string>>(new Map());
    const [partnersLoading, setPartnersLoading] = useState(true);

    const fetchPartnerData = async () => {
        try {
            setPartnersLoading(true);
            
            // Step 1: Fetch all partners in the campaign
            const partnerAssignments = await getCampaignPartners(slug);
            setPartners(partnerAssignments);

            // Step 2: Fetch partner-company assignments for all partners in parallel
            // O(P) requests where P = number of partners (typically 5-10)
            const partnerCompanyAssignments = await Promise.all(
                partnerAssignments.map(async (p) => {
                    try {
                        const assignments = await getPartnerAssignedCompanies(slug, p.partner_id);
                        return { partnerId: String(p.partner_id), assignments };
                    } catch {
                        return { partnerId: String(p.partner_id), assignments: [] };
                    }
                })
            );

            // Step 3: Build lookup map: company_id -> partner_id
            const newMap = new Map<number, string>();
            for (const { partnerId, assignments } of partnerCompanyAssignments) {
                for (const assignment of assignments) {
                    newMap.set(assignment.company_id, partnerId);
                }
            }
            setCompanyToPartnerMap(newMap);
        } catch (error) {
            console.error('Failed to fetch partner data:', error);
            setPartners([]);
        } finally {
            setPartnersLoading(false);
        }
    };

    useEffect(() => {
        fetchPartnerData();
    }, [slug]);

    const partnerCount = partners.length;

    const handleAssignmentsChanged = useCallback((updates: { companyId: number; partnerId: string | null }[]) => {
        setCompanyToPartnerMap(prev => {
            const next = new Map(prev);
            updates.forEach(({ companyId, partnerId }) => {
                if (partnerId) {
                    next.set(companyId, partnerId);
                } else {
                    next.delete(companyId);
                }
            });
            return next;
        });
    }, []);

    // Enrich companies with partner_id from the centralized lookup
    const companiesWithPartners = useMemo<MembershipRead[]>(() => {
        if (companyToPartnerMap.size === 0) return companies;
        return companies.map(company => ({
            ...company,
            partner_id: companyToPartnerMap.get(company.company_id) ?? company.partner_id ?? null,
        }));
    }, [companies, companyToPartnerMap]);

    // Publish functionality from hook
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);

    const onPublishClick = () => setShowPublishConfirm(true);

    const confirmPublish = async () => {
        await handlePublish();
        setShowPublishConfirm(false);
    };

    // Unpublish functionality
    const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);
    const onUnpublishClick = () => setShowUnpublishConfirm(true);

    const confirmUnpublish = async () => {
        await handleUnpublish();
        setShowUnpublishConfirm(false);
    };

    // Company removal confirmation
    const [companyToRemove, setCompanyToRemove] = useState<string | null>(null);
    const [isRemovingCompany, setIsRemovingCompany] = useState(false);

    const confirmRemoveCompany = async () => {
        if (!companyToRemove) return;
        setIsRemovingCompany(true);
        await handleCompanyRemove(companyToRemove);
        setIsRemovingCompany(false);
        setCompanyToRemove(null);
    };

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
                    onPublish={onPublishClick}
                    isPublishing={isPublishing}
                    onUnpublish={onUnpublishClick}
                    isUnpublishing={isUnpublishing}
                    companyCount={overview?.company_count ?? dynamicCompaniesTotal ?? undefined}
                    partnerCount={partnerCount}
                    productId={campaign.target_product_id}
                    productName={overview?.product_name}
                />

                {/* Content Area */}
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <Tabs value={activeTab} className="w-full">


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
                                onCompanyRemoved={setCompanyToRemove}
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
                                partners={partners}
                                onCompanyClick={handleCompanyClick}
                                onPartnersUpdated={fetchPartnerData}
                                onAssignmentsChanged={handleAssignmentsChanged}
                            />
                        </TabsContent>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            {overview ? (
                                <OverviewTab
                                    overview={overview}
                                    companies={companiesWithPartners}
                                    partners={partners}
                                    dynamicCompanies={filters.length > 0 ? dynamicCompanies : undefined}
                                    dynamicCompaniesTotal={dynamicCompaniesTotal}
                                    loadingDynamicCompanies={loadingDynamicCompanies}
                                    onCompanyClick={handleCompanyClick}
                                    onManagePartners={() => setActiveTab('partners')}
                                    onViewAllCompanies={() => setActiveTab('companies')}
                                    onDrillDown={handleDrillDown}
                                    campaignSlug={slug}
                                />
                            ) : (
                                <OverviewTabSkeleton />
                            )}
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
                    productId={campaign.target_product_id ?? undefined}
                />
            )}

            {/* Publish Confirmation Dialog */}
            <Dialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Publish Campaign</DialogTitle>
                        <DialogDescription>
                            Publishing this campaign will send notifications to all assigned partners.
                            They will be alerted about their assigned opportunities.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button onClick={confirmPublish} disabled={isPublishing}>
                            {isPublishing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Publish Campaign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unpublish Confirmation Dialog */}
            <Dialog open={showUnpublishConfirm} onOpenChange={setShowUnpublishConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Unpublish Campaign</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to unpublish this campaign? 
                            It will return to draft status and partners will no longer see it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button onClick={confirmUnpublish} disabled={isUnpublishing} variant="destructive">
                            {isUnpublishing ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Unpublish Campaign
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Company Confirmation Dialog */}
            <Dialog open={!!companyToRemove} onOpenChange={(open) => !open && setCompanyToRemove(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove Company</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">{companyToRemove}</span> from this campaign?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Cancel
                        </DialogClose>
                        <Button onClick={confirmRemoveCompany} disabled={isRemovingCompany} variant="destructive">
                            {isRemovingCompany ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Remove Company
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
