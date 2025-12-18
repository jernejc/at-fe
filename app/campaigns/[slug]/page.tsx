'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCampaign, getCampaignOverview, getCampaignCompanies, getCampaignComparison, deleteCampaign } from '@/lib/api';
import type { CampaignRead, CampaignOverview, MembershipRead, CampaignComparison } from '@/lib/schemas';
import { ArrowLeft, Loader2, Building2, TrendingUp, ChevronRight, Download, Settings, Trash2, Calendar, Target, Activity } from 'lucide-react';
import { AccountDetail } from '@/components/accounts';
import { CompanyRowCompact, PartnerTab } from '@/components/campaigns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/ui/Header';
import { AddCompanyButton } from '@/components/campaigns/AddCompanyButton';
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

    // Color helper for fit scores
    const getFitColor = (range: string) => {
        const start = parseInt(range.split('-')[0]);
        if (start >= 80) return 'bg-emerald-500 dark:bg-emerald-500';
        if (start >= 60) return 'bg-green-500 dark:bg-green-500';
        if (start >= 40) return 'bg-yellow-500 dark:bg-yellow-500';
        if (start >= 20) return 'bg-orange-500 dark:bg-orange-500';
        return 'bg-red-500 dark:bg-red-500';
    };

    const [overview, setOverview] = useState<CampaignOverview | null>(null);
    const [companies, setCompanies] = useState<MembershipRead[]>([]);
    const [comparison, setComparison] = useState<CampaignComparison | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Account Detail Popover State
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

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

    const [isDeleting, setIsDeleting] = useState(false);

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

    const avgFitScore = campaign.avg_fit_score ? Math.round(campaign.avg_fit_score * 100) : null;
    const progressPercent = Math.round((campaign.processed_count / Math.max(campaign.company_count, 1)) * 100);

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                {/* Header matching AccountDetailHeader style */}
                <div className="relative overflow-hidden group border-b border-border/60 bg-white dark:bg-slate-900">
                    {/* Subtle background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/30 dark:from-slate-900/80 dark:via-slate-900/50 dark:to-blue-900/10 pointer-events-none" />

                    <div className="relative px-6 pt-12 pb-0 max-w-[1600px] mx-auto w-full">
                        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href="/campaigns" className="hover:text-foreground transition-colors">Campaigns</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="font-medium text-foreground">{campaign.name}</span>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="flex-1 min-w-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                            {campaign.name}
                                        </h1>
                                        <Badge variant="secondary" className="capitalize px-2 py-0.5 pointer-events-none">
                                            {campaign.status}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-blue-500" />
                                            <span className="text-foreground font-medium">{campaign.company_count}</span>
                                            <span>companies</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-emerald-500" />
                                            <span className="text-foreground font-medium">{progressPercent}%</span>
                                            <span>analyzed</span>
                                        </div>
                                        {avgFitScore && (
                                            <div className="flex items-center gap-2">
                                                <Target className="w-4 h-4 text-amber-500" />
                                                <span className="text-foreground font-medium">{avgFitScore}%</span>
                                                <span>avg fit</span>
                                            </div>
                                        )}
                                    </div>

                                    {campaign.description && (
                                        <p className="text-sm text-muted-foreground pt-4 max-w-3xl leading-relaxed">
                                            {campaign.description}
                                        </p>
                                    )}
                                </div>
                                {/* Removed the separate pills div */}
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-3 shrink-0 pt-1">
                                <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-white dark:bg-slate-900">
                                    <Download className="w-4 h-4" />
                                    Export
                                </Button>
                                <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-white dark:bg-slate-900">
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 gap-2 shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/30 dark:hover:bg-red-900/30 dark:text-red-400 bg-white dark:bg-slate-900"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Delete
                                </Button>
                            </div>
                        </div>

                        {/* Tabs - Centered with clean underline style inside the header block */}
                        <div className="pt-8">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <div className="w-full border-b border-border">
                                    <TabsList variant="line" className="w-full justify-start gap-8">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="companies">
                                            Companies
                                            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                {campaign.company_count}
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger value="partners">Partners</TabsTrigger>
                                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                                    </TabsList>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-[1600px] mx-auto px-6 py-8">
                    {/* Tabs content wrappers */}
                    <Tabs value={activeTab} className="w-full">
                        {/* We moved TabsList to the header, so we just render content here */}

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-0 animate-in fade-in-50">
                            {overview && (
                                <div className="space-y-6">
                                    {/* Hero Section */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                        <div className="p-6 pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Campaign Progress</h3>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {overview.processed_count} of {overview.company_count} companies analyzed
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{progressPercent}%</div>
                                                    {avgFitScore && (
                                                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                                            Avg fit: <span className="font-semibold text-slate-700 dark:text-slate-300">{avgFitScore}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Main content - Two column layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                        {/* Left column - Top Companies */}
                                        <div className="lg:col-span-3 space-y-6">
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">Top Companies</h3>
                                                </div>
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {overview.top_companies && overview.top_companies.length > 0 ? overview.top_companies.slice(0, 10).map((company, idx) => (
                                                        <CompanyRowCompact
                                                            key={company.id}
                                                            name={company.company_name || company.domain}
                                                            domain={company.domain}
                                                            rank={idx + 1}
                                                            fitScore={company.cached_fit_score}
                                                            logoBase64={company.logo_base64}
                                                            onClick={() => handleCompanyClick(company.domain)}
                                                            className="cursor-pointer"
                                                        />
                                                    )) : (
                                                        <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                                                            No companies yet. Add one to get started!
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>

                                        {/* Right column - Stats sidebar */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Industry Breakdown */}
                                            {overview.industry_breakdown && Object.keys(overview.industry_breakdown).length > 0 && (
                                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Industries</h3>
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(overview.industry_breakdown)
                                                                .filter(([_, count]) => count > 0)
                                                                .sort((a, b) => b[1] - a[1])
                                                                .slice(0, 8)
                                                                .map(([industry, count]) => (
                                                                    <Badge
                                                                        key={industry}
                                                                        className="px-3 py-1.5 font-semibold text-slate-500 whitespace-nowrap bg-slate-50 border border-slate-100 hover:bg-slate-100 h-auto"
                                                                    >
                                                                        {industry}
                                                                        <span className="text-slate-400 dark:text-slate-500">{count}</span>
                                                                    </Badge>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fit Distribution */}
                                            {overview.fit_distribution && Object.values(overview.fit_distribution).some(v => v > 0) && (
                                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Fit Distribution</h3>
                                                    </div>
                                                    <div className="p-5 space-y-4">
                                                        {Object.entries(overview.fit_distribution)
                                                            .filter(([key]) => key !== 'unscored')
                                                            .sort((a, b) => {
                                                                const aStart = parseInt(a[0].split('-')[0]);
                                                                const bStart = parseInt(b[0].split('-')[0]);
                                                                return bStart - aStart;
                                                            })
                                                            .map(([range, count]) => {
                                                                const total = Object.values(overview.fit_distribution).reduce((sum, val) => sum + val, 0) - (overview.fit_distribution.unscored || 0);
                                                                const percentage = total > 0 ? (count / total) * 100 : 0;
                                                                const colorClass = getFitColor(range);

                                                                return (
                                                                    <div key={range} className="space-y-1.5">
                                                                        <div className="flex items-center justify-between text-xs">
                                                                            <span className="font-medium text-slate-700 dark:text-slate-300">{range}% Match</span>
                                                                            <span className="text-slate-500 dark:text-slate-400">{count} companies</span>
                                                                        </div>
                                                                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                            <div
                                                                                className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
                                                                                style={{ width: `${percentage}%` }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        {overview.fit_distribution.unscored > 0 && (
                                                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between text-xs">
                                                                        <span className="font-medium text-slate-500 dark:text-slate-400">Unscored</span>
                                                                        <span className="text-slate-400 dark:text-slate-500">{overview.fit_distribution.unscored} companies</span>
                                                                    </div>
                                                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-slate-300 dark:bg-slate-600 rounded-full"
                                                                            style={{
                                                                                width: `${(overview.fit_distribution.unscored / Object.values(overview.fit_distribution).reduce((sum, val) => sum + val, 0)) * 100}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}


                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        {/* Companies Tab */}
                        <TabsContent value="companies" className="mt-0 animate-in fade-in-50">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <div className="mb-4">
                                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">Companies in Campaign</h2>
                                </div>
                                {companies.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-2">
                                        {companies.map((membership) => (
                                            <CompanyRowCompact
                                                key={membership.id}
                                                name={membership.company_name || membership.domain}
                                                domain={membership.domain}
                                                industry={membership.industry}
                                                employeeCount={membership.employee_count}
                                                hqCountry={membership.hq_country}
                                                segment={membership.segment}
                                                fitScore={membership.cached_fit_score}
                                                logoBase64={membership.logo_base64}
                                                onClick={() => handleCompanyClick(membership.domain)}
                                                className="cursor-pointer"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                                        <p>No companies in this campaign yet</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <AddCompanyButton slug={slug} onCompanyAdded={refreshData} className="h-12 bg-white dark:bg-slate-900 border-dashed" />
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

                        {/* Partners Tab */}
                        <TabsContent value="partners" className="mt-0 animate-in fade-in-50">
                            <PartnerTab campaignSlug={slug} />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Account Detail Popover */}
            {
                selectedDomain && (
                    <AccountDetail
                        domain={selectedDomain}
                        open={detailOpen}
                        onClose={() => setDetailOpen(false)}
                    />
                )
            }
        </div >
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
