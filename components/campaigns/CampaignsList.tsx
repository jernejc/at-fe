'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { getCampaignPartners, getCampaigns, getPartnerAssignedCompanies, getProducts } from '@/lib/api';
import type { CampaignSummary } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import { ProductAssignmentDialog } from './ProductAssignmentDialog';
import { CampaignCardPreview } from './CampaignCardPreview';
import { Loader2, FolderKanban, Plus, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, fadeInUp } from '@/lib/animations';

export function CampaignsList() {
    const router = useRouter();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [unassignedByCampaign, setUnassignedByCampaign] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [assignProductOpen, setAssignProductOpen] = useState(false);
    const [campaignToAssign, setCampaignToAssign] = useState<CampaignSummary | null>(null);

    // Fetch data - note: we intentionally exclude session from dependencies
    // to prevent refetching on window focus (session object reference changes)
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Parallel fetch for products always, and campaigns based on tab
            const productRequest = getProducts(1, 100);


            // For "my" campaigns, we use the own_only filter
            // For "all" campaigns, we fetch everything the user has access to
            const campaignsRequest = activeTab === 'all'
                ? getCampaigns({ page: 1, page_size: 100, sort_by: 'updated_at', sort_order: 'desc' })
                : getCampaigns({
                    page: 1,
                    page_size: 100,
                    sort_by: 'updated_at',
                    sort_order: 'desc',
                    own_only: true
                });

            const [productsData, campaignsData] = await Promise.all([
                productRequest,
                campaignsRequest
            ]);

            setProducts(productsData.items);

            // Handle both paginated response ({ items: [...] }) and direct array ([...])
            const items = Array.isArray(campaignsData) ? campaignsData : campaignsData.items || [];
            setCampaigns(items);

            // Compute unassigned companies per campaign from live partner-company assignments
            const unassignedEntries = await Promise.all(
                items.map(async (campaign) => {
                    try {
                        const partnerAssignments = await getCampaignPartners(campaign.slug);

                        const assignedCompanyIds = new Set<number>();
                        await Promise.all(
                            partnerAssignments.map(async (assignment) => {
                                try {
                                    const companyAssignments = await getPartnerAssignedCompanies(
                                        campaign.slug,
                                        assignment.partner_id
                                    );
                                    companyAssignments.forEach((companyAssignment) => {
                                        assignedCompanyIds.add(companyAssignment.company_id);
                                    });
                                } catch {
                                    // Ignore per-partner failures and continue
                                }
                            })
                        );

                        const unassignedCount = Math.max(campaign.company_count - assignedCompanyIds.size, 0);
                        return [campaign.id, unassignedCount] as const;
                    } catch {
                        // Conservative fallback if assignment data is unavailable
                        return [campaign.id, campaign.company_count] as const;
                    }
                })
            );
            setUnassignedByCampaign(Object.fromEntries(unassignedEntries));

            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Track if we've done initial fetch to prevent refetching on session object changes
    const hasFetchedRef = useRef(false);
    const prevTabRef = useRef(activeTab);

    useEffect(() => {
        // Only fetch on initial load or when activeTab actually changes
        const tabChanged = prevTabRef.current !== activeTab;
        prevTabRef.current = activeTab;
        
        if (session && (!hasFetchedRef.current || tabChanged)) {
            hasFetchedRef.current = true;
            fetchData();
        }
    }, [fetchData, session, activeTab]);

    // Handle new campaign - navigate to wizard
    const handleNewCampaign = (productId: number | null = null) => {
        // Navigate to the create wizard, optionally with product preselection
        const url = productId ? `/campaigns/start?product=${productId}` : '/campaigns/start';
        router.push(url);
    };

    // Handle assign product
    const handleAssignProduct = (campaign: CampaignSummary) => {
        setCampaignToAssign(campaign);
        setAssignProductOpen(true);
    };

    // Handle product assigned
    const handleProductAssigned = async () => {
        setAssignProductOpen(false);
        setCampaignToAssign(null);
        fetchData(); // Refresh list
    };

    const hasNoCampaigns = campaigns.length === 0;

    return (
        <div className="flex flex-col flex-1 gap-8">
            {/* Page Header */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left: Title */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm shrink-0">
                                <FolderKanban className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Campaigns
                                </h1>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Manage your outreach campaigns and track performance
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'my')} className="w-[300px]">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="all">All Campaigns</TabsTrigger>
                                <TabsTrigger value="my">My Campaigns</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="shrink-0">
                            <Button
                                onClick={() => handleNewCampaign()}
                                className="gap-2 h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-black transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                New Campaign
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center h-64"
                >
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </motion.div>
            ) : error ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center justify-center h-64 gap-4"
                >
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{error}</p>
                    <Button onClick={() => window.location.reload()} size="lg" className="rounded-xl">
                        Retry
                    </Button>
                </motion.div>
            ) : hasNoCampaigns ? (
                <motion.div
                    variants={fadeInUp}
                    className="flex flex-1 flex-col items-center justify-center p-12 text-center -mt-10"
                >
                    <Coffee size={50} strokeWidth={1.5} className='mb-5 text-slate-300 dark:text-slate-600'></Coffee>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No campaigns found
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        {activeTab === 'all'
                            ? "Get started by creating your first campaign"
                            : "You haven't created any campaigns yet"}
                    </p>
                    <Button
                        onClick={() => handleNewCampaign()}
                        variant="secondary"
                        size="lg"
                    >
                        Create Campaign
                    </Button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {campaigns.map((campaign) => (
                        <CampaignCardPreview
                            key={campaign.id}
                            campaign={campaign}
                            product={products.find(p => p.id === campaign.target_product_id)}
                            unassignedCompaniesCount={unassignedByCampaign[campaign.id] ?? 0}
                            onAssignProduct={!campaign.target_product_id ? () => handleAssignProduct(campaign) : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Dialogs */}
            <ProductAssignmentDialog
                open={assignProductOpen}
                onOpenChange={setAssignProductOpen}
                campaign={campaignToAssign}
                products={products}
                onProductAssigned={handleProductAssigned}
            />
        </div>
    );
}
