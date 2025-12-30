'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaigns, getProducts } from '@/lib/api';
import type { CampaignSummary } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import { ProductSection } from './ProductSection';
import { ProductAssignmentDialog } from './ProductAssignmentDialog';
import { Loader2, FolderKanban, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CampaignsList() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dialog states
    const [assignProductOpen, setAssignProductOpen] = useState(false);
    const [campaignToAssign, setCampaignToAssign] = useState<CampaignSummary | null>(null);

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            try {
                const [campaignsData, productsData] = await Promise.all([
                    getCampaigns({ page: 1, page_size: 100, sort_by: 'updated_at', sort_order: 'desc' }),
                    getProducts(1, 100),
                ]);
                setCampaigns(campaignsData.items);
                setProducts(productsData.items);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Group campaigns by product
    const groupedCampaigns = useMemo(() => {
        const groups: Map<number | null, CampaignSummary[]> = new Map();

        // Initialize with all products (even empty ones)
        products.forEach(p => groups.set(p.id, []));
        groups.set(null, []); // Unassigned group

        // Distribute campaigns
        campaigns.forEach(campaign => {
            const productId = campaign.target_product_id;
            const existing = groups.get(productId) || [];
            groups.set(productId, [...existing, campaign]);
        });

        return groups;
    }, [campaigns, products]);

    // Get product by ID
    const getProduct = (productId: number | null): ProductSummary | null => {
        if (productId === null) return null;
        return products.find(p => p.id === productId) || null;
    };

    // Handle new campaign - navigate to wizard
    const handleNewCampaign = (productId: number | null = null) => {
        // Navigate to the create wizard, optionally with product preselection
        const url = productId ? `/campaigns/new?product=${productId}` : '/campaigns/new';
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
        // Refresh campaigns
        try {
            const campaignsData = await getCampaigns({ page: 1, page_size: 100, sort_by: 'updated_at', sort_order: 'desc' });
            setCampaigns(campaignsData.items);
        } catch (err) {
            console.error('Error refreshing campaigns:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{error}</p>
                <Button onClick={() => window.location.reload()} size="lg">
                    Retry
                </Button>
            </div>
        );
    }

    // Get unassigned campaigns
    const unassignedCampaigns = groupedCampaigns.get(null) || [];

    // Get products with campaigns (sorted by most recent campaign activity)
    const productsWithCampaigns = products
        .filter(p => (groupedCampaigns.get(p.id) || []).length > 0)
        .sort((a, b) => {
            const aCampaigns = groupedCampaigns.get(a.id) || [];
            const bCampaigns = groupedCampaigns.get(b.id) || [];
            const aLatest = aCampaigns[0]?.updated_at || '';
            const bLatest = bCampaigns[0]?.updated_at || '';
            return bLatest.localeCompare(aLatest);
        });

    // Get products without campaigns
    const productsWithoutCampaigns = products.filter(p => (groupedCampaigns.get(p.id) || []).length === 0);

    const hasNoCampaigns = campaigns.length === 0;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                {/* Left: Title */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/50 shrink-0">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Workloads
                            </h1>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} across {products.length} product{products.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0 pt-2">
                    <Button
                        onClick={() => handleNewCampaign()}
                        className="gap-2 h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        New Campaign
                    </Button>
                </div>
            </div>

            {/* Empty State */}
            {hasNoCampaigns ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        No workloads yet
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                        Create your first campaign to start targeting accounts
                    </p>
                    <Button
                        onClick={() => handleNewCampaign()}
                        className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all"
                    >
                        Create Campaign
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Unassigned Campaigns (show first if any) */}
                    {unassignedCampaigns.length > 0 && (
                        <ProductSection
                            product={null}
                            campaigns={unassignedCampaigns}
                            onAssignProduct={handleAssignProduct}
                            defaultExpanded={true}
                        />
                    )}

                    {/* Products with Campaigns */}
                    {productsWithCampaigns.map((product) => (
                        <ProductSection
                            key={product.id}
                            product={product}
                            campaigns={groupedCampaigns.get(product.id) || []}
                            onNewCampaign={handleNewCampaign}
                            defaultExpanded={true}
                        />
                    ))}

                    {/* Products without Campaigns (collapsed) */}
                    {productsWithoutCampaigns.map((product) => (
                        <ProductSection
                            key={product.id}
                            product={product}
                            campaigns={[]}
                            onNewCampaign={handleNewCampaign}
                            defaultExpanded={false}
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
