'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { getCampaigns, getCampaignCompanies, getProducts } from '@/lib/api';
import type { CampaignSummary, MembershipRead, ProductSummary } from '@/lib/schemas';
import { cn } from '@/lib/utils';

interface CampaignWithCompanies {
    campaign: CampaignSummary;
    companies: MembershipRead[];
}

interface OpportunityWithMeta extends MembershipRead {
    campaignName: string;
    campaignSlug: string;
}

type PortalTab = 'overview' | 'opportunities';
type OpportunityStatus = 'new' | 'accepted' | 'rejected';

// Mock stats for demo
const MOCK_STATS = {
    avgFitScore: 78,
    topIndustries: ['Technology', 'Financial Services', 'Healthcare'],
};

const DEMO_PARTNER = {
    name: "TechFlow Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TF&backgroundColor=0ea5e9&textColor=ffffff",
    type: "Technology Partner"
};

export default function PartnerPortalPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<CampaignWithCompanies[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<PortalTab>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Track opportunity status: new, accepted, rejected
    const [opportunityStatus, setOpportunityStatus] = useState<Record<string, OpportunityStatus>>({});

    // Account detail modal
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Get all campaigns
                const campaignsResponse = await getCampaigns();
                const campaignsWithCompanies: CampaignWithCompanies[] = [];

                // Fetch companies for each campaign
                for (const campaign of campaignsResponse.items) {
                    try {
                        const companiesResponse = await getCampaignCompanies(campaign.slug, {
                            page_size: 100,
                        });
                        campaignsWithCompanies.push({
                            campaign,
                            companies: companiesResponse.items,
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
                    if (!seen.has(opp.domain)) {
                        seen.add(opp.domain);
                        initial[opp.domain] = newCount < 5 ? 'new' : 'accepted';
                        newCount++;
                    }
                });
                setOpportunityStatus(initial);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
        // Clear selected domain when component unmounts/mounts to ensure clean state
        setSelectedDomain(null);
    }, []);

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
            if (seen.has(opp.domain)) return false;
            seen.add(opp.domain);
            return true;
        });
    }, [campaigns]);

    // Split by status
    const newOpportunities = useMemo(() =>
        allOpportunities.filter(o => opportunityStatus[o.domain] === 'new'),
        [allOpportunities, opportunityStatus]
    );

    const acceptedOpportunities = useMemo(() =>
        allOpportunities.filter(o => opportunityStatus[o.domain] === 'accepted'),
        [allOpportunities, opportunityStatus]
    );

    // Filtered accepted opportunities (for search)
    const filteredOpportunities = useMemo(() => {
        if (!searchQuery) return acceptedOpportunities;
        const q = searchQuery.toLowerCase();
        return acceptedOpportunities.filter(o =>
            o.company_name?.toLowerCase().includes(q) ||
            o.domain?.toLowerCase().includes(q) ||
            o.industry?.toLowerCase().includes(q) ||
            o.campaignName?.toLowerCase().includes(q)
        );
    }, [acceptedOpportunities, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        return {
            totalOpportunities: acceptedOpportunities.length,
            newOpportunities: newOpportunities.length,
            activeCampaigns: campaigns.length,
            avgFitScore: MOCK_STATS.avgFitScore,
            topIndustries: MOCK_STATS.topIndustries,
        };
    }, [campaigns, acceptedOpportunities.length, newOpportunities.length]);

    const handleAccept = useCallback((domain: string) => {
        setOpportunityStatus(prev => ({ ...prev, [domain]: 'accepted' }));
    }, []);

    const handleReject = useCallback((domain: string) => {
        setOpportunityStatus(prev => ({ ...prev, [domain]: 'rejected' }));
    }, []);

    const handleAcceptAll = useCallback(() => {
        const newStatus = { ...opportunityStatus };
        newOpportunities.forEach(opp => {
            newStatus[opp.domain] = 'accepted';
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

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <div className="px-6 pt-8 pb-0 max-w-[1600px] mx-auto w-full">
                        <div className="flex gap-6 items-start">
                            <div className="flex-1 min-w-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-3 w-full mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                                <img src={DEMO_PARTNER.logo} alt={DEMO_PARTNER.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                                    {DEMO_PARTNER.name}
                                                </h1>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Partner Portal</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-3">
                                        <div className="flex items-center gap-2" title="Total Opportunities">
                                            <Building2 className="w-4 h-4 text-blue-500" />
                                            <span className="text-foreground font-medium">{stats.totalOpportunities}</span>
                                            <span>accepted</span>
                                        </div>

                                        <div className="flex items-center gap-2" title="Average Fit Score">
                                            <TrendingUp className="w-4 h-4 text-indigo-400" />
                                            <span className="text-foreground font-medium">{stats.avgFitScore}%</span>
                                            <span>avg fit</span>
                                        </div>

                                        <div className="flex items-center gap-2" title="Campaigns">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                            <span className="text-foreground font-medium">{stats.activeCampaigns}</span>
                                            <span>campaigns</span>
                                        </div>

                                        <div className="flex items-center gap-2" title="Top Industries">
                                            <Globe className="w-4 h-4 text-slate-400" />
                                            <span className="truncate max-w-[200px]">{stats.topIndustries.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="pt-6">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PortalTab)} className="w-full">
                                <TabsList variant="line" className="w-full justify-start gap-6">
                                    <TabsTrigger value="overview">
                                        <LayoutDashboard className="w-4 h-4" />
                                        Overview
                                        {stats.newOpportunities > 0 && (
                                            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                {stats.newOpportunities}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger value="opportunities">
                                        <Building2 className="w-4 h-4" />
                                        Opportunities
                                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                            {stats.totalOpportunities}
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
                                                    key={opp.domain}
                                                    className="bg-white dark:bg-slate-900 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-4 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all group"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Clickable content area */}
                                                        <button
                                                            onClick={() => handleOpportunityClick(opp.domain)}
                                                            className="flex items-start gap-4 flex-1 min-w-0 text-left"
                                                        >
                                                            {/* Company Logo */}
                                                            <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {opp.logo_base64 ? (
                                                                    <img
                                                                        src={opp.logo_base64.startsWith('data:') ? opp.logo_base64 : `data:image/png;base64,${opp.logo_base64}`}
                                                                        alt=""
                                                                        className="w-8 h-8 object-contain"
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={`https://www.google.com/s2/favicons?domain=${opp.domain}&sz=64`}
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
                                                                    {opp.company_name || opp.domain}
                                                                </span>
                                                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                                    {opp.industry || 'Unknown Industry'}
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                                                                    {opp.employee_count && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Users className="w-3.5 h-3.5" />
                                                                            <span>{opp.employee_count.toLocaleString()}</span>
                                                                        </div>
                                                                    )}
                                                                    {opp.hq_country && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Globe className="w-3.5 h-3.5" />
                                                                            <span>{opp.hq_country}</span>
                                                                        </div>
                                                                    )}
                                                                    {opp.cached_fit_score && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Target className="w-3.5 h-3.5" />
                                                                            <span>{Math.round(opp.cached_fit_score)}% fit</span>
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
                                                                onClick={() => handleReject(opp.domain)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={() => handleAccept(opp.domain)}
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
                                            key={opp.domain}
                                            name={opp.company_name || opp.domain}
                                            domain={opp.domain}
                                            logoBase64={opp.logo_base64}
                                            industry={opp.industry}
                                            employeeCount={opp.employee_count}
                                            hqCountry={opp.hq_country}
                                            fitScore={opp.cached_fit_score ? opp.cached_fit_score / 100 : null}
                                            onClick={() => handleOpportunityClick(opp.domain)}
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
