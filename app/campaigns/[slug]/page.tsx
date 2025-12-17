'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCampaign, getCampaignOverview, getCampaignCompanies, getCampaignComparison, deleteCampaign } from '@/lib/api';
import type { CampaignRead, CampaignOverview, MembershipRead, CampaignComparison } from '@/lib/schemas';
import { ArrowLeft, Loader2, Users, FolderKanban, Building2, TrendingUp, ChevronRight, Calendar, Download, Settings, Trash2 } from 'lucide-react';
import { AccountDetail } from '@/components/accounts';
import { CompanyRowCompact, PartnerTab } from '@/components/campaigns';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 mb-6 text-sm text-slate-500 font-medium animate-in fade-in-50 slide-in-from-left-2">
                        <Link href="/campaigns" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                            Campaigns
                        </Link>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{campaign.name}</span>
                    </div>

                    {/* Page Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                        {/* Left: Title & Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/50 shrink-0">
                                    <FolderKanban className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                                            {campaign.name}
                                        </h1>
                                        <Badge variant="secondary" className="capitalize px-2.5 py-0.5 pointer-events-none">
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 ml-1">
                                {campaign.owner && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                            {campaign.owner.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{campaign.owner}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 opacity-70" />
                                    <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                                </div>

                                <div className="hidden sm:block w-px h-3 bg-slate-200 dark:bg-slate-700" />

                                <span><span className="font-medium text-slate-900 dark:text-white">{campaign.company_count}</span> companies</span>

                                {avgFitScore && (
                                    <>
                                        <div className="hidden sm:block w-px h-3 bg-slate-200 dark:bg-slate-700" />
                                        <span>Avg Fit: <span className="font-medium text-green-600 dark:text-green-400">{avgFitScore}%</span></span>
                                    </>
                                )}
                            </div>

                            {campaign.description && (
                                <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                                    {campaign.description}
                                </p>
                            )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 shrink-0 pt-2">
                            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm">
                                <Download className="w-4 h-4" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2 shadow-sm text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/30 dark:hover:bg-red-900/30 dark:text-red-400"
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

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
                            <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0 rounded-none">
                                <TabBtn value="overview"><TrendingUp className="w-4 h-4" /> Overview</TabBtn>
                                <TabBtn value="companies" count={campaign.company_count}><Building2 className="w-4 h-4" /> Companies</TabBtn>
                                <TabBtn value="partners"><Users className="w-4 h-4" /> Partners</TabBtn>
                                <TabBtn value="comparison">Comparison</TabBtn>
                            </TabsList>
                        </div>

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
                                                                    <span
                                                                        key={industry}
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
                                                                    >
                                                                        {industry}
                                                                        <span className="text-slate-400 dark:text-slate-500">{count}</span>
                                                                    </span>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">Top Companies</h3>
                                                </div>
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {overview.top_companies && overview.top_companies.length > 0 ? overview.top_companies.slice(0, 5).map((company, idx) => (
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
