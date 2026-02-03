'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthUser } from '@/hooks/useAuthUser';
import {
    Loader2,
    Building2,
    Users,
    Target,
    LayoutDashboard,
    ChevronRight,
    TrendingUp,
    Globe,
    Search,
    Check,
    X,
    Sparkles,
    CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AccountDetail } from '@/components/accounts';
import { CompanyRowCompact } from '@/components/campaigns/CompanyRowCompact';
import { ProductSection } from '@/components/campaigns/ProductSection';
import { PartnerPortalHeader } from '@/components/partner/PartnerPortalHeader';
import { getCampaigns, getPartnerAssignedCompanies, getProducts, getPartner } from '@/lib/api';
import type { CampaignSummary, PartnerCompanyAssignmentWithCompany, ProductSummary, PartnerRead } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface CampaignWithCompanies {
    campaign: CampaignSummary;
    companies: PartnerCompanyAssignmentWithCompany[];
}

interface OpportunityWithMeta extends PartnerCompanyAssignmentWithCompany {
    campaignName: string;
    campaignSlug: string;
}

type PortalTab = 'overview' | 'opportunities';
type OpportunityStatus = 'new' | 'accepted' | 'rejected';



export function PartnerDashboard() {
    const router = useRouter();
    // Use useAuthUser hook as the source of truth for claims
    const { user, loading: authLoading } = useAuthUser();
    
    const [partner, setPartner] = useState<PartnerRead | null>(null);
    const [campaigns, setCampaigns] = useState<CampaignWithCompanies[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<PortalTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Track opportunity status: new, accepted, rejected
    const [opportunityStatus, setOpportunityStatus] = useState<Record<string, OpportunityStatus>>({});

    // Account detail modal
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Get partner info from auth hook
    const partnerId = user?.partnerId;
    const partnerName = user?.partnerName;

    useEffect(() => {
        async function fetchData() {
            // Wait for auth to load
            if (authLoading) return;
            if (!partnerId) {
                setDataLoading(false);
                return;
            }

            try {
                setDataLoading(true);

                // Fetch partner details
                try {
                    const partnerData = await getPartner(partnerId);
                    setPartner(partnerData);
                } catch (e) {
                    console.error('Failed to fetch partner:', e);
                }

                // Get all campaigns
                const campaignsResponse = await getCampaigns();
                const campaignsWithCompanies: CampaignWithCompanies[] = [];

                // Fetch partner-assigned companies for each campaign
                for (const campaign of campaignsResponse.items) {
                    try {
                        const companies = await getPartnerAssignedCompanies(campaign.slug, partnerId);
                        campaignsWithCompanies.push({
                            campaign,
                            companies,
                        });
                    } catch (e) {
                        console.error(`Failed to fetch companies for ${campaign.slug}:`, e);
                        campaignsWithCompanies.push({
                            campaign,
                            companies: [],
                        });
                    }
                }

                setCampaigns(campaignsWithCompanies);

                // Fetch products
                try {
                    const productsResponse = await getProducts();
                    setProducts(productsResponse.items);
                } catch (e) {
                    console.error('Failed to fetch products:', e);
                }

                // Initialize status - first 5 unique companies are "new", rest are "accepted"
                const seen = new Set<string>();
                const allOpps = campaignsWithCompanies.flatMap(c => c.companies);
                const initial: Record<string, OpportunityStatus> = {};
                let newCount = 0;
                allOpps.forEach(opp => {
                    if (!seen.has(opp.company_domain)) {
                        seen.add(opp.company_domain);
                        initial[opp.company_domain] = newCount < 5 ? 'new' : 'accepted';
                        newCount++;
                    }
                });
                setOpportunityStatus(initial);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setDataLoading(false);
            }
        }

        fetchData();
        // Clear selected domain when component unmounts/mounts to ensure clean state
        setSelectedDomain(null);
    }, [partnerId, authLoading]);

    // All opportunities flattened and deduplicated by domain
    const allOpportunities = useMemo(() => {
        const seen = new Set<string>();
        return campaigns.flatMap(c =>
            c.companies.map(co => ({
                ...co,
                campaignName: c.campaign.name,
                campaignSlug: c.campaign.slug,
            }))
        ).filter(opp => {
            if (seen.has(opp.company_domain)) return false;
            seen.add(opp.company_domain);
            return true;
        });
    }, [campaigns]);

    // Split by status
    const newOpportunities = useMemo(() =>
        allOpportunities.filter(o => opportunityStatus[o.company_domain] === 'new'),
        [allOpportunities, opportunityStatus]
    );

    const acceptedOpportunities = useMemo(() =>
        allOpportunities.filter(o => opportunityStatus[o.company_domain] === 'accepted'),
        [allOpportunities, opportunityStatus]
    );

    // Filtered accepted opportunities (for search)
    const filteredOpportunities = useMemo(() => {
        if (!searchQuery) return acceptedOpportunities;
        const q = searchQuery.toLowerCase();
        return acceptedOpportunities.filter(o =>
            o.company_name?.toLowerCase().includes(q) ||
            o.company_domain?.toLowerCase().includes(q) ||
            o.company_industry?.toLowerCase().includes(q) ||
            o.campaignName?.toLowerCase().includes(q)
        );
    }, [acceptedOpportunities, searchQuery]);

    // Stats
    /*
    const stats = useMemo(() => {
        return {
            totalOpportunities: acceptedOpportunities.length,
            newOpportunities: newOpportunities.length,
            activeCampaigns: campaigns.length,
            avgFitScore: MOCK_STATS.avgFitScore,
            topIndustries: MOCK_STATS.topIndustries,
        };
    }, [campaigns, acceptedOpportunities.length, newOpportunities.length]);
    */

    const handleAccept = useCallback((domain: string) => {
        setOpportunityStatus(prev => ({ ...prev, [domain]: 'accepted' }));
    }, []);

    const handleReject = useCallback((domain: string) => {
        setOpportunityStatus(prev => ({ ...prev, [domain]: 'rejected' }));
    }, []);

    const handleAcceptAll = useCallback(() => {
        const newStatus = { ...opportunityStatus };
        newOpportunities.forEach(opp => {
            newStatus[opp.company_domain] = 'accepted';
        });
        setOpportunityStatus(newStatus);
    }, [opportunityStatus, newOpportunities]);

    const handleOpportunityClick = useCallback((domain: string) => {
        setSelectedDomain(domain);
        setDetailOpen(true);
    }, []);

    const closeDetail = useCallback(() => {
        setDetailOpen(false);
        setSelectedDomain(null);
    }, []);

    if (authLoading || dataLoading) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <div className="px-6 pt-8 pb-6 max-w-[1600px] mx-auto w-full">
                        {/* Header using shared component */}
                            <PartnerPortalHeader
                                partner={partner}
                                partnerName={partnerName ?? undefined}
                                opportunities={allOpportunities}
                                campaigns={campaigns.map(c => c.campaign)}
                                newOpportunitiesCount={newOpportunities.length}
                                isPDM={false}
                                onCRMConnect={() => {
                                    // TODO: Open CRM connection modal
                                    console.log('CRM Connect clicked');
                                }}
                            />

                        {/* Tabs */}
                        <div className="pt-6">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PortalTab)} className="w-full">
                                <TabsList variant="line" className="w-full justify-start gap-6">
                                    <TabsTrigger value="overview">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Overview
                                        {newOpportunities.length > 0 && (
                                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                {newOpportunities.length}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="opportunities">
                                        <Building2 className="w-4 h-4" />
                                        Opportunities
                                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {acceptedOpportunities.length}
                                        </span>
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <Tabs value={activeTab} className="w-full">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            <div className="space-y-8">
                                {/* New Opportunities Section */}
                                {newOpportunities.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-amber-500" />
                                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                                    New Opportunities
                                                </h2>
                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                    {newOpportunities.length} pending
                                                </Badge>
                                            </div>
                                            <Button
                                                onClick={handleAcceptAll}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Accept All
                                            </Button>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Review and accept opportunities to add them to your pipeline.
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {newOpportunities.map((opp) => (
                                                <div
                                                    key={opp.company_domain}
                                                    className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-4 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Clickable content area */}
                                                        <button
                                                            onClick={() => handleOpportunityClick(opp.company_domain)}
                                                            className="flex items-start gap-4 flex-1 min-w-0 text-left"
                                                        >
                                                            {/* Company Logo */}
                                                            <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {opp.company_logo_url ? (
                                                                    <img
                                                                        src={opp.company_logo_url}
                                                                        alt=""
                                                                        className="w-8 h-8 object-contain"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={`https://www.google.com/s2/favicons?domain=${opp.company_domain}&sz=64`}
                                                                        alt=""
                                                                        className="w-7 h-7 object-contain"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                                        }}
                                                                    />
                                                                )}
                                                            </div>

                                                            {/* Company Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block">
                                                                    {opp.company_name || opp.company_domain}
                                                                </span>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    {opp.company_industry || 'Unknown Industry'}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                                                                    {opp.company_employee_count && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Users className="w-3.5 h-3.5" />
                                                                            <span>{opp.company_employee_count.toLocaleString()}</span>
                                                                        </div>
                                                                    )}
                                                                    {opp.company_hq_country && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Globe className="w-3.5 h-3.5" />
                                                                            <span>{opp.company_hq_country}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>

                                                        {/* Actions */}
                                                        <div className="flex gap-2 shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                                                                onClick={() => handleReject(opp.company_domain)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={() => handleAccept(opp.company_domain)}
                                                            >
                                                                <Check className="w-4 h-4 mr-1" />
                                                                Accept
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Campaigns grouped by Product */}
                                <div className="space-y-6">
                                    {(() => {
                                        // Group campaigns by product
                                        const grouped = new Map<number | null, CampaignWithCompanies[]>();
                                        campaigns.forEach(cwc => {
                                            const productId = cwc.campaign.target_product_id;
                                            if (!grouped.has(productId)) {
                                                grouped.set(productId, []);
                                            }
                                            grouped.get(productId)!.push(cwc);
                                        });

                                        // Flatten entries for rendering and filter out unassigned (null product)
                                        const entries = Array.from(grouped.entries())
                                            .filter(([productId]) => productId !== null)
                                            .sort((a, b) => {
                                                // Find product name
                                                const pA = products.find(p => p.id === a[0]);
                                                const pB = products.find(p => p.id === b[0]);
                                                return (pA?.name || '').localeCompare(pB?.name || '');
                                            });

                                        if (entries.length === 0) {
                                            return (
                                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                                                    <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                                    <p className="text-slate-600 dark:text-slate-400">
                                                        No campaigns available.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return entries.map(([productId, productCampaigns]) => {
                                            // Map to CampaignSummary with corrected company_count
                                            const mappedCampaigns: CampaignSummary[] = productCampaigns.map(pc => ({
                                                ...pc.campaign,
                                                company_count: pc.companies.length // Overwrite with assigned count
                                            }));

                                            const product = productId ? products.find(p => p.id === productId) || null : null;

                                            return (
                                                <ProductSection
                                                    key={productId ?? 'null'}
                                                    product={product}
                                                    campaigns={mappedCampaigns}
                                                    onCampaignClick={(campaign) => router.push(`/partner-portal/${campaign.slug}`)}
                                                    defaultExpanded={true}
                                                />
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Opportunities Tab */}
                        <TabsContent value="opportunities" className="mt-0 animate-in fade-in-50">
                            {/* Search */}
                            <div className="mb-4">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search opportunities..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Opportunities Grid */}
                            {filteredOpportunities.length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-12 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {acceptedOpportunities.length === 0
                                            ? "No accepted opportunities yet. Accept opportunities from the Overview tab."
                                            : "No opportunities match your search."}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredOpportunities.map((opp) => (
                                        <CompanyRowCompact
                                            key={opp.company_domain}
                                            name={opp.company_name || opp.company_domain}
                                            domain={opp.company_domain}
                                            logoUrl={opp.company_logo_url}
                                            industry={opp.company_industry}
                                            employeeCount={opp.company_employee_count}
                                            hqCountry={opp.company_hq_country}
                                            onClick={() => handleOpportunityClick(opp.company_domain)}
                                            variant="card"
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Account Detail Modal */}
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
