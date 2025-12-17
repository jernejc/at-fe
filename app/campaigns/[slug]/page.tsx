'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCampaign, getCampaignOverview, getCampaignCompanies, getCampaignComparison } from '@/lib/api';
import type { CampaignRead, CampaignOverview, MembershipRead, CampaignComparison } from '@/lib/schemas';
import { ArrowLeft, Loader2, TrendingUp, Users, FolderKanban, Zap, Building2, MapPin, Award, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
            <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
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

    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;
    const progressPercent = Math.round((campaign.processed_count / Math.max(campaign.company_count, 1)) * 100);

    return (
        <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/campaigns')}
                            className="mb-4 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Campaigns
                        </Button>

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <FolderKanban className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                    <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{campaign.name}</h1>
                                </div>
                                {campaign.description && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{campaign.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                                    {campaign.owner && (
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            <span>{campaign.owner}</span>
                                        </div>
                                    )}
                                    <span>•</span>
                                    <span className="font-medium">{campaign.company_count} companies</span>
                                    {avgFitScore && (
                                        <>
                                            <span>•</span>
                                            <span>Avg Fit: <span className="font-semibold text-slate-700 dark:text-slate-300">{avgFitScore}%</span></span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
                            <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0 rounded-none">
                                <TabBtn value="overview"><TrendingUp className="w-4 h-4" /> Overview</TabBtn>
                                <TabBtn value="companies" count={campaign.company_count}><Building2 className="w-4 h-4" /> Companies</TabBtn>
                                <TabBtn value="comparison">Comparison</TabBtn>
                            </TabsList>
                        </div>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            {overview && (
                                <div className="space-y-8">
                                    {/* Hero Stats - Asymmetric Layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Large Progress Card */}
                                        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Campaign Progress</div>
                                                    <div className="text-5xl font-bold text-slate-900 dark:text-white tabular-nums">{progressPercent}%</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                                        {overview.processed_count} of {overview.company_count} companies processed
                                                    </div>
                                                </div>
                                                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                    <Target className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                                                </div>
                                            </div>
                                            <div className="mt-6">
                                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-1000"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Avg Fit Score - Prominent */}
                                        {avgFitScore && (
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
                                                <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Average Fit Score</div>
                                                <div className="text-5xl font-bold text-slate-900 dark:text-white tabular-nums mb-6">{avgFitScore}%</div>
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Award className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Secondary Stats - Compact Row */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{overview.company_count}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Companies</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <Zap className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{overview.processed_count}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Processed</div>
                                                </div>
                                            </div>
                                        </div>

                                        {overview.fit_distribution && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <TrendingUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                                                            {Object.values(overview.fit_distribution).reduce((sum, val) => sum + val, 0) - (overview.fit_distribution.unscored || 0)}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">Scored</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {overview.industry_breakdown && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                                                            {Object.keys(overview.industry_breakdown).filter(k => overview.industry_breakdown[k] > 0).length}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">Industries</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Grid - Asymmetric */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Top Companies - Takes 2 columns */}
                                        {overview.top_companies && overview.top_companies.length > 0 && (
                                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                                <h3 className="text-base font-semibold mb-5 text-slate-900 dark:text-white">
                                                    Top Performing Companies
                                                </h3>
                                                <div className="space-y-3">
                                                    {overview.top_companies.slice(0, 5).map((company, idx) => (
                                                        <div
                                                            key={company.id}
                                                            className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                                        >
                                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="font-medium text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors truncate">
                                                                        {company.company_name}
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{company.domain}</div>
                                                                </div>
                                                            </div>
                                                            {company.cached_fit_score && (
                                                                <div className="text-right shrink-0 ml-4">
                                                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                                                        {Math.round(company.cached_fit_score * 100)}%
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 dark:text-slate-400">Fit Score</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Fit Distribution - Sidebar */}
                                        {overview.fit_distribution && Object.values(overview.fit_distribution).some(v => v > 0) && (
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                                <h3 className="text-base font-semibold mb-5 text-slate-900 dark:text-white">Fit Distribution</h3>
                                                <div className="space-y-4">
                                                    {Object.entries(overview.fit_distribution)
                                                        .filter(([key]) => key !== 'unscored')
                                                        .sort((a, b) => {
                                                            const aStart = parseInt(a[0].split('-')[0]);
                                                            const bStart = parseInt(b[0].split('-')[0]);
                                                            return bStart - aStart;
                                                        })
                                                        .slice(0, 5)
                                                        .map(([range, count]) => {
                                                            const total = Object.values(overview.fit_distribution).reduce((sum, val) => sum + val, 0);
                                                            const percentage = total > 0 ? (count / total) * 100 : 0;

                                                            return (
                                                                <div key={range} className="space-y-2">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="font-medium text-slate-900 dark:text-white">{range}%</span>
                                                                        <span className="text-slate-500 dark:text-slate-400 text-xs">{count}</span>
                                                                    </div>
                                                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-500"
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    {overview.fit_distribution.unscored > 0 && (
                                                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="font-medium text-slate-500 dark:text-slate-400">Unscored</span>
                                                                <span className="text-slate-500 dark:text-slate-400 text-xs">{overview.fit_distribution.unscored}</span>
                                                            </div>
                                                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                                                                    style={{
                                                                        width: `${(overview.fit_distribution.unscored / Object.values(overview.fit_distribution).reduce((sum, val) => sum + val, 0)) * 100}%`
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Industry Breakdown - Full Width */}
                                    {overview.industry_breakdown && Object.keys(overview.industry_breakdown).length > 0 && (
                                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                            <h3 className="text-base font-semibold mb-5 text-slate-900 dark:text-white">Industry Breakdown</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(overview.industry_breakdown)
                                                    .filter(([_, count]) => count > 0)
                                                    .sort((a, b) => b[1] - a[1])
                                                    .slice(0, 8)
                                                    .map(([industry, count]) => {
                                                        const total = Object.values(overview.industry_breakdown).reduce((sum, val) => sum + val, 0);
                                                        const percentage = total > 0 ? (count / total) * 100 : 0;

                                                        return (
                                                            <div key={industry} className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="font-medium truncate flex-1 text-slate-900 dark:text-white">{industry}</span>
                                                                    <span className="text-slate-500 dark:text-slate-400 ml-2 text-xs">{count}</span>
                                                                </div>
                                                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-500"
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Companies Tab */}
                        <TabsContent value="companies" className="mt-0 animate-in fade-in-50">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h2 className="text-base font-semibold mb-4 text-slate-900 dark:text-white">Companies in Campaign</h2>
                                {companies.length > 0 ? (
                                    <div className="space-y-2">
                                        {companies.map((membership) => (
                                            <div
                                                key={membership.id}
                                                className="group flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium mb-1 text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                                                        {membership.company_name || membership.domain}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                                        {membership.industry && (
                                                            <span className="flex items-center gap-1">
                                                                <Building2 className="w-3.5 h-3.5" />
                                                                {membership.industry}
                                                            </span>
                                                        )}
                                                        {membership.employee_count && (
                                                            <span className="flex items-center gap-1">
                                                                <Users className="w-3.5 h-3.5" />
                                                                {membership.employee_count.toLocaleString()}
                                                            </span>
                                                        )}
                                                        {membership.hq_country && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {membership.hq_country}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {membership.segment && (
                                                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
                                                            {membership.segment}
                                                        </span>
                                                    )}
                                                    {membership.cached_fit_score !== null && (
                                                        <div className="text-sm font-bold text-slate-900 dark:text-white min-w-[48px] text-right">
                                                            {Math.round(membership.cached_fit_score * 100)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <p>No companies in this campaign yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Comparison Tab */}
                        <TabsContent value="comparison" className="mt-0 animate-in fade-in-50">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Company Comparison</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Side-by-side analysis of target accounts
                                    </p>
                                </div>
                                {comparison && comparison.companies.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Company</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Industry</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Size</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Location</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Fit Score</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Top Signals</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {comparison.companies.map((company, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-slate-900 dark:text-white">{company.name || company.domain}</div>
                                                            <div className="text-sm text-slate-500 dark:text-slate-400">{company.domain}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{company.industry || '—'}</td>
                                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{company.employee_count?.toLocaleString() || '—'}</td>
                                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{company.hq_country || '—'}</td>
                                                        <td className="px-6 py-4">
                                                            {company.fit_score !== null ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                                    {Math.round(company.fit_score * 100)}%
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 dark:text-slate-500">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {company.top_signals.slice(0, 3).map((signal, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded"
                                                                    >
                                                                        {signal}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <p>No comparison data available</p>
                                        <p className="text-sm mt-1">Process companies to see insights</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

// Tab button matching AccountDetail style
function TabBtn({ value, count, children }: { value: string; count?: number; children: React.ReactNode }) {
    return (
        <TabsTrigger
            value={value}
            className={cn(
                "group relative flex items-center gap-2 pb-3 pt-2 px-1 rounded-none font-medium text-sm bg-transparent hover:text-slate-900 dark:hover:text-slate-100",
                "text-slate-500 dark:text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-slate-900 dark:after:bg-slate-200 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            )}
        >
            {children}
            {count !== undefined && count > 0 && (
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-lg",
                    "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
                    "group-data-[state=active]:bg-slate-900 group-data-[state=active]:text-white dark:group-data-[state=active]:bg-slate-200 dark:group-data-[state=active]:text-slate-900"
                )}>
                    {count}
                </span>
            )}
        </TabsTrigger>
    );
}

// Clean stat card component
function StatCard({ icon, label, value, sublabel, showProgress, progressPercent }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    sublabel?: string;
    showProgress?: boolean;
    progressPercent?: number;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="text-slate-600 dark:text-slate-400">{icon}</div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</div>
            <div className="text-3xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</div>
            {sublabel && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sublabel}</div>
            )}
            {showProgress && progressPercent !== undefined && (
                <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-slate-900 dark:bg-slate-200 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}
        </div>
    );
}
