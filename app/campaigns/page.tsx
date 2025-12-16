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
            <div className="h-screen bg-background overflow-hidden flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-background overflow-hidden flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                    <div className="text-6xl">😔</div>
                    <p className="text-xl font-semibold text-destructive">{error}</p>
                    <Button onClick={() => router.push('/')} size="lg">Go Home</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-background overflow-hidden flex flex-col">
            <Header />

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <FolderKanban className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                <h1 className="text-3xl font-bold">Campaigns</h1>
                            </div>
                            <Button
                                onClick={() => router.push('/')}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Campaign
                            </Button>
                        </div>
                        <p className="text-muted-foreground">
                            Manage your account targeting campaigns
                        </p>
                    </div>

                    {/* Content */}
                    {campaigns.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-12 text-center">
                            <div className="text-6xl mb-4">🎯</div>
                            <h2 className="text-xl font-semibold mb-2">No campaigns yet</h2>
                            <p className="text-muted-foreground mb-6">
                                Get started by creating your first campaign from the accounts list
                            </p>
                            <Button onClick={() => router.push('/')}>
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
            className="group bg-white dark:bg-slate-900 rounded-xl border border-border p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-200 dark:hover:border-blue-800"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {campaign.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full font-medium",
                            campaign.status === 'active' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                            campaign.status === 'draft' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
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
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span>Companies</span>
                    </div>
                    <span className="font-semibold">{campaign.company_count}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>Processed</span>
                    </div>
                    <span className="font-semibold">{campaign.processed_count}</span>
                </div>

                {avgFitScore && (
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>Avg Fit</span>
                        </div>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{avgFitScore}%</span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Owner (if exists) */}
            {campaign.owner && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                        Owner: <span className="font-medium text-foreground">{campaign.owner}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
