'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaign, getCampaignOverview, getCampaignCompanies, getCampaignComparison, deleteCampaign } from '@/lib/api';
import type { CampaignRead, CampaignOverview, MembershipRead, CampaignComparison } from '@/lib/schemas';
import { Loader2 } from 'lucide-react';
import { AccountDetail } from '@/components/accounts';
import { CampaignHeader, OverviewTab, CompaniesTab, ComparisonTab, PartnerTab } from '@/components/campaigns';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/Header';
import { Tabs, TabsContent } from '@/components/ui/tabs';

interface CampaignPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function CampaignPage({ params }: CampaignPageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const [campaign, setCampaign] = useState<CampaignRead | null>(null);
    const [overview, setOverview] = useState<CampaignOverview | null>(null);
    const [companies, setCompanies] = useState<MembershipRead[]>([]);
    const [comparison, setComparison] = useState<CampaignComparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Account Detail Popover State
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Delete state
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCompanyClick = (domain: string) => {
        setSelectedDomain(domain);
        setDetailOpen(true);
    };

    const refreshData = async () => {
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
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteCampaign(slug);
            router.push('/campaigns');
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            alert('Failed to delete campaign');
            setIsDeleting(false);
        }
    };

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
                />

                {/* Content Area */}
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    <Tabs value={activeTab} className="w-full">
                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            {overview && (
                                <OverviewTab
                                    overview={overview}
                                    companies={companies}
                                    onCompanyClick={handleCompanyClick}
                                    onManagePartners={() => setActiveTab('partners')}
                                />
                            )}
                        </TabsContent>

                        {/* Companies Tab */}
                        <TabsContent value="companies" className="mt-0 animate-in fade-in-50">
                            <CompaniesTab
                                slug={slug}
                                productId={campaign.target_product_id ?? undefined}
                                companies={companies}
                                onCompanyClick={handleCompanyClick}
                                onCompanyAdded={refreshData}
                            />
                        </TabsContent>

                        {/* Comparison Tab */}
                        <TabsContent value="comparison" className="mt-0 animate-in fade-in-50">
                            <ComparisonTab comparison={comparison} />
                        </TabsContent>

                        {/* Partners Tab */}
                        <TabsContent value="partners" className="mt-0 animate-in fade-in-50">
                            <PartnerTab campaignSlug={slug} onCompanyClick={handleCompanyClick} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Account Detail Popover */}
            {selectedDomain && (
                <AccountDetail
                    domain={selectedDomain}
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                />
            )}
        </div>
    );
}
