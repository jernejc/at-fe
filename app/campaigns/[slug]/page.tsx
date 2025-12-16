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
            <div className="h-screen bg-background overflow-hidden flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="h-screen bg-background overflow-hidden flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                    <div className="text-6xl">😔</div>
                    <p className="text-xl font-semibold text-destructive">{error || 'Campaign not found'}</p>
                    <Button onClick={() => router.push('/')} size="lg">Go Home</Button>
                </div>
            </div>
        );
    }

    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;
    const progressPercent = Math.round((campaign.processed_count / Math.max(campaign.company_count, 1)) * 100);

    return (
        <div className="h-screen bg-background overflow-hidden flex flex-col">
            <Header />

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    {/* Page Header */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/campaigns')}
                            className="mb-4 -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Campaigns
                        </Button>

                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <FolderKanban className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    <h1 className="text-3xl font-bold">{campaign.name}</h1>
                                </div>
                                {campaign.description && (
                                    <p className="text-muted-foreground text-lg">{campaign.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
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
                                            <span>Avg Fit: <span className="font-semibold text-blue-600 dark:text-blue-400">{avgFitScore}%</span></span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="border-b border-border mb-6">
                            <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0 rounded-none">
                                <TabBtn value="overview"><TrendingUp className="w-4 h-4" /> Overview</TabBtn>
                                <TabBtn value="companies" count={campaign.company_count}><Building2 className="w-4 h-4" /> Companies</TabBtn>
                                <TabBtn value="comparison">Comparison</TabBtn>
                            </TabsList>
                        </div>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            {overview && (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            icon={<Building2 className="w-5 h-5" />}
                                            label="Total Companies"
                                            value={overview.company_count}
                                        />
                                        <StatCard
                                            icon={<Zap className="w-5 h-5" />}
                                            label="Processed"
                                            value={overview.processed_count}
                                            sublabel={`${progressPercent}% complete`}
                                        />
                                        <StatCard
                                            icon={<Award className="w-5 h-5" />}
                                            label="Avg Fit Score"
                                            value={avgFitScore ? `${avgFitScore}%` : 'N/A'}
                                        />
                                        <StatCard
                                            icon={<Target className="w-5 h-5" />}
                                            label="Progress"
                                            value={`${progressPercent}%`}
                                            showProgress
                                            progressPercent={progressPercent}
                                        />
                                    </div>

                                    {/* Top Companies */}
                                    {overview.top_companies && overview.top_companies.length > 0 && (
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                Top Performing Companies
                                            </h3>
                                            <div className="space-y-2">
                                                {overview.top_companies.map((company, idx) => (
                                                    <div
                                                        key={company.id}
                                                        className="group flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-border"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                                    {company.company_name}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">{company.domain}</div>
                                                            </div>
                                                        </div>
                                                        {company.cached_fit_score && (
                                                            <div className="text-right">
                                                                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                                    {Math.round(company.cached_fit_score * 100)}%
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">Fit Score</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Analytics Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Fit Distribution */}
                                        {overview.fit_distribution && Object.values(overview.fit_distribution).some(v => v > 0) && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
                                                <h3 className="text-lg font-semibold mb-4">Fit Score Distribution</h3>
                                                <div className="space-y-3">
                                                    {Object.entries(overview.fit_distribution)
                                                        .filter(([key]) => key !== 'unscored')
                                                        .sort((a, b) => {
                                                            const aStart = parseInt(a[0].split('-')[0]);
                                                            const bStart = parseInt(b[0].split('-')[0]);
                                                            return bStart - aStart; // High to low
                                                        })
                                                        .map(([range, count]) => {
                                                            const total = Object.values(overview.fit_distribution).reduce((sum, val) => sum + val, 0);
                                                            const percentage = total > 0 ? (count / total) * 100 : 0;

                                                            return (
                                                                <div key={range} className="space-y-1">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="font-medium">{range}%</span>
                                                                        <span className="text-muted-foreground">{count} companies</span>
                                                                    </div>
                                                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    {overview.fit_distribution.unscored > 0 && (
                                                        <div className="pt-2 border-t border-border space-y-1">
                                                            <div className="flex items-center justify-between text-sm">
                                                                <span className="font-medium text-muted-foreground">Unscored</span>
                                                                <span className="text-muted-foreground">{overview.fit_distribution.unscored} companies</span>
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

                                        {/* Industry Breakdown */}
                                        {overview.industry_breakdown && Object.keys(overview.industry_breakdown).length > 0 && (
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
                                                <h3 className="text-lg font-semibold mb-4">Industry Breakdown</h3>
                                                <div className="space-y-3">
                                                    {Object.entries(overview.industry_breakdown)
                                                        .filter(([_, count]) => count > 0)
                                                        .sort((a, b) => b[1] - a[1]) // Sort by count descending
                                                        .slice(0, 8) // Show top 8
                                                        .map(([industry, count]) => {
                                                            const total = Object.values(overview.industry_breakdown).reduce((sum, val) => sum + val, 0);
                                                            const percentage = total > 0 ? (count / total) * 100 : 0;

                                                            return (
                                                                <div key={industry} className="space-y-1">
                                                                    <div className="flex items-center justify-between text-sm">
                                                                        <span className="font-medium truncate flex-1">{industry}</span>
                                                                        <span className="text-muted-foreground ml-2">{count}</span>
                                                                    </div>
                                                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
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
                                </div>
                            )}
                        </TabsContent>

                        {/* Companies Tab */}
                        <TabsContent value="companies" className="mt-0 animate-in fade-in-50">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6">
                                <h2 className="text-xl font-semibold mb-4">Companies in Campaign</h2>
                                {companies.length > 0 ? (
                                    <div className="space-y-2">
                                        {companies.map((membership) => (
                                            <div
                                                key={membership.id}
                                                className="group flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-border"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {membership.company_name || membership.domain}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                                                        <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                                                            {membership.segment}
                                                        </span>
                                                    )}
                                                    {membership.cached_fit_score !== null && (
                                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 min-w-[48px] text-right">
                                                            {Math.round(membership.cached_fit_score * 100)}%
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <div className="text-4xl mb-2">📭</div>
                                        <p>No companies in this campaign yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Comparison Tab */}
                        <TabsContent value="comparison" className="mt-0 animate-in fade-in-50">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-border overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <h2 className="text-xl font-semibold">Company Comparison</h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Side-by-side analysis of target accounts
                                    </p>
                                </div>
                                {comparison && comparison.companies.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Company</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Industry</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Size</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Location</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Fit Score</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Top Signals</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {comparison.companies.map((company, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium">{company.name || company.domain}</div>
                                                            <div className="text-sm text-muted-foreground">{company.domain}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">{company.industry || '—'}</td>
                                                        <td className="px-6 py-4 text-sm font-medium">{company.employee_count?.toLocaleString() || '—'}</td>
                                                        <td className="px-6 py-4 text-sm">{company.hq_country || '—'}</td>
                                                        <td className="px-6 py-4">
                                                            {company.fit_score !== null ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                                    {Math.round(company.fit_score * 100)}%
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {company.top_signals.slice(0, 3).map((signal, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs rounded"
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
                                    <div className="text-center py-12 text-muted-foreground">
                                        <div className="text-4xl mb-2">📊</div>
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
                "group relative flex items-center gap-2 pb-3 pt-2 px-1 rounded-none font-medium text-sm bg-transparent hover:text-foreground",
                "text-muted-foreground data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform"
            )}
        >
            {children}
            {count !== undefined && count > 0 && (
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    "bg-muted text-muted-foreground",
                    "group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:bg-blue-900/20 dark:group-data-[state=active]:text-blue-300"
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
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="text-blue-600 dark:text-blue-400">{icon}</div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">{label}</div>
            <div className="text-3xl font-bold tabular-nums">{value}</div>
            {sublabel && (
                <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>
            )}
            {showProgress && progressPercent !== undefined && (
                <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}
        </div>
    );
}
