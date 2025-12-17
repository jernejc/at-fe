'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaigns } from '@/lib/api';
import type { CampaignSummary } from '@/lib/schemas';
import { Loader2, FolderKanban, Plus, TrendingUp, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { cn } from '@/lib/utils';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCampaigns() {
            try {
                const data = await getCampaigns({ page: 1, page_size: 100, sort_by: 'updated_at', sort_order: 'desc' });
                setCampaigns(data.items);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load campaigns');
                console.error('Error fetching campaigns:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchCampaigns();
    }, []);

    if (loading) {
        return (
            <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">{error}</p>
                    <Button onClick={() => router.push('/')} size="lg">Go Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <FolderKanban className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Campaigns</h1>
                            </div>
                            <Button
                                onClick={() => router.push('/campaigns/new')}
                                className="gap-2 h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                New Campaign
                            </Button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage your account targeting campaigns
                        </p>
                    </div>

                    {/* Content */}
                    {campaigns.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No campaigns yet</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                Get started by creating your first campaign from the accounts list
                            </p>
                            <Button 
                                onClick={() => router.push('/')}
                                className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all"
                            >
                                Go to Accounts
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campaigns.map((campaign) => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
    const router = useRouter();
    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;
    const progressPercent = Math.round((campaign.processed_count / Math.max(campaign.company_count, 1)) * 100);

    return (
        <div
            onClick={() => router.push(`/campaigns/${campaign.slug}`)}
            className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-all cursor-pointer hover:border-slate-300 dark:hover:border-slate-700"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-1 truncate text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {campaign.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className={cn(
                            "px-2 py-0.5 rounded-lg font-medium",
                            campaign.status === 'active' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
                            campaign.status === 'draft' && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                            campaign.status === 'archived' && "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                        )}>
                            {campaign.status}
                        </span>
                        <span>•</span>
                        <span>{new Date(campaign.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Building2 className="w-4 h-4" />
                        <span>Companies</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{campaign.company_count}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Processed</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">{campaign.processed_count}</span>
                </div>

                {avgFitScore && (
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>Avg Fit</span>
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{avgFitScore}%</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Owner (if exists) */}
            {campaign.owner && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        Owner: <span className="font-medium text-slate-700 dark:text-slate-300">{campaign.owner}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
