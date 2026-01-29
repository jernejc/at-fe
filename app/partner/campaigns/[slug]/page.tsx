'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Loader2,
    ArrowLeft,
    Building2,
    Users,
    DollarSign,
    Package,
    Clock,
    ChevronUp,
    ChevronDown,
    CircleDot,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/partner/StatCard';
import { CompanyRow } from '@/components/partner/CompanyRow';
import { CampaignCRMAnalytics } from '@/components/partner/analytics';
import {
    getCampaign,
    getPartner,
    getPartnerAssignedCompanies,
    getCampaignCompanies,
    getProduct,
    exportCampaignCSV,
} from '@/lib/api';
import type {
    CampaignRead,
    PartnerCompanyAssignmentWithCompany,
} from '@/lib/schemas';

interface CampaignDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

function formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
}

function estimateRevenue(employeeCount: number | null): string {
    const employees = employeeCount || 0;
    if (employees > 10000) return '$500K';
    if (employees > 1000) return '$150K';
    if (employees > 100) return '$50K';
    return '$15K';
}

function estimateRevenueValue(employeeCount: number | null): number {
    const employees = employeeCount || 0;
    if (employees > 10000) return 500000;
    if (employees > 1000) return 150000;
    if (employees > 100) return 50000;
    return 15000;
}

function isNew(createdAt: string): boolean {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return new Date(createdAt).getTime() > sevenDaysAgo;
}

type SortColumn = 'company_name' | 'revenue' | 'company_industry' | 'company_employee_count' | 'company_hq_country' | 'status' | 'created_at';

const SORT_HEADERS: { label: string; column: SortColumn; colSpan: string }[] = [
    { label: 'Company Info', column: 'company_name', colSpan: 'col-span-3' },
    { label: 'Expected Revenue', column: 'revenue', colSpan: 'col-span-2' },
    { label: 'Industry', column: 'company_industry', colSpan: 'col-span-2' },
    { label: 'Size', column: 'company_employee_count', colSpan: 'col-span-1 text-right' },
    { label: 'Location', column: 'company_hq_country', colSpan: 'col-span-2' },
    { label: 'Status', column: 'status', colSpan: 'col-span-2' },
];

export default function PartnerCampaignDetailPage({ params }: CampaignDetailPageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    const [campaign, setCampaign] = useState<CampaignRead | null>(null);
    const [companies, setCompanies] = useState<PartnerCompanyAssignmentWithCompany[]>([]);
    const [productName, setProductName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [exporting, setExporting] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnerId = (session?.user as any)?.partner_id as number | undefined;

    useEffect(() => {
        async function fetchData() {
            if (sessionStatus === 'loading') return;
            if (!partnerId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const campaignData = await getCampaign(slug);
                setCampaign(campaignData);

                await getPartner(partnerId);

                // Fetch product name
                if (campaignData.target_product_id) {
                    try {
                        const product = await getProduct(campaignData.target_product_id);
                        setProductName(product.name);
                    } catch {
                        // Product fetch is optional
                    }
                }

                // Get assigned companies
                let assignments: PartnerCompanyAssignmentWithCompany[] = [];
                try {
                    assignments = await getPartnerAssignedCompanies(slug, partnerId);
                } catch {
                    // fallback below
                }

                if (assignments.length === 0) {
                    const companiesResponse = await getCampaignCompanies(slug, { page_size: 100 });
                    assignments = companiesResponse.items.map((company) => ({
                        id: company.company_id,
                        campaign_partner_id: 0,
                        company_id: company.company_id,
                        status: 'active',
                        notes: null,
                        assigned_at: new Date().toISOString(),
                        assigned_by: 'system',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        company_domain: company.domain,
                        company_name: company.company_name,
                        company_industry: company.industry,
                        company_employee_count: company.employee_count,
                        company_hq_country: company.hq_country,
                        company_logo_url: company.logo_base64
                            ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
                            : null,
                    }));
                }

                setCompanies(assignments);
            } catch (error) {
                console.error('Failed to fetch campaign data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [slug, partnerId, sessionStatus]);

    const handleSort = (column: SortColumn) => {
        if (sortColumn === column) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await exportCampaignCSV(slug);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${campaign?.name || slug}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const pipelineValue = useMemo(() => {
        return companies.reduce((sum, c) => sum + estimateRevenueValue(c.company_employee_count), 0);
    }, [companies]);

    const sortedCompanies = useMemo(() => {
        const sorted = [...companies].sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';

            switch (sortColumn) {
                case 'company_name':
                    aVal = (a.company_name || '').toLowerCase();
                    bVal = (b.company_name || '').toLowerCase();
                    break;
                case 'revenue':
                    aVal = estimateRevenueValue(a.company_employee_count);
                    bVal = estimateRevenueValue(b.company_employee_count);
                    break;
                case 'company_industry':
                    aVal = (a.company_industry || '').toLowerCase();
                    bVal = (b.company_industry || '').toLowerCase();
                    break;
                case 'company_employee_count':
                    aVal = a.company_employee_count || 0;
                    bVal = b.company_employee_count || 0;
                    break;
                case 'company_hq_country':
                    aVal = (a.company_hq_country || '').toLowerCase();
                    bVal = (b.company_hq_country || '').toLowerCase();
                    break;
                case 'status':
                    aVal = (a.status || '').toLowerCase();
                    bVal = (b.status || '').toLowerCase();
                    break;
                case 'created_at':
                    aVal = new Date(a.created_at).getTime();
                    bVal = new Date(b.created_at).getTime();
                    break;
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [companies, sortColumn, sortDirection]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Campaign not found</p>
                <Button onClick={() => router.push('/partner')}>Go Back</Button>
            </div>
        );
    }

    const SortIcon = sortDirection === 'asc' ? ChevronUp : ChevronDown;

    return (
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
                {/* Title */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {campaign.name}
                    </h1>
                    <Button onClick={handleExport} disabled={exporting} variant="outline">
                        {exporting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Export CSV
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard
                        icon={DollarSign}
                        iconBgClass="bg-emerald-50 dark:bg-emerald-900/30"
                        label="Pipeline Value"
                        value={formatCurrency(pipelineValue)}
                        valueColorClass="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatCard
                        icon={Building2}
                        iconBgClass="bg-slate-100 dark:bg-slate-800"
                        label="Companies"
                        value={companies.length}
                    />
                    <StatCard
                        icon={Clock}
                        iconBgClass="bg-slate-100 dark:bg-slate-800"
                        label="Deadline"
                        value="—"
                        valueColorClass="text-slate-400"
                    />
                    <StatCard
                        icon={CircleDot}
                        iconBgClass="bg-slate-100 dark:bg-slate-800"
                        label="Status"
                        value={
                            <Badge
                                variant="secondary"
                                className="w-fit text-sm px-3 py-1"
                            >
                                {campaign.status}
                            </Badge>
                        }
                    />
                    <StatCard
                        icon={Package}
                        iconBgClass="bg-slate-100 dark:bg-slate-800"
                        label="Product"
                        value={productName || '—'}
                        valueColorClass={productName ? 'text-slate-900 dark:text-white text-base' : 'text-slate-400'}
                    />
                    <StatCard
                        icon={Users}
                        iconBgClass="bg-indigo-50 dark:bg-indigo-900/30"
                        label="Owner"
                        value={
                            <div className='flex items-center'>
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${campaign.owner || 'google.com'}&sz=64`}
                                    className="w-10 h-10 object-contain"
                                />
                                <span className="text-base font-bold truncate">{campaign.owner || 'google.com'}</span>
                            </div>
                        }
                    />
                </div>

                {/* CRM Insights Section */}
                <CampaignCRMAnalytics />

                {/* Company Table */}
                <div className='space-y-4 mt-15'>
                    <h2 className='font-medium text-lg'>Companies</h2>
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2">
                        {SORT_HEADERS.map((header) => (
                            <button
                                key={header.column}
                                onClick={() => handleSort(header.column)}
                                className={`${header.colSpan} flex items-center gap-1 text-xs uppercase tracking-wider transition-colors ${
                                    sortColumn === header.column
                                        ? 'font-bold text-slate-900 dark:text-white'
                                        : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {header.label}
                                {sortColumn === header.column && (
                                    <SortIcon className="w-3.5 h-3.5" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Table Body */}
                    {sortedCompanies.length === 0 ? (
                        <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                            No companies found
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sortedCompanies.map((company) => (
                                <CompanyRow
                                    key={company.id}
                                    logoUrl={company.company_logo_url}
                                    name={company.company_name}
                                    domain={company.company_domain}
                                    expectedRevenue={estimateRevenue(company.company_employee_count)}
                                    industry={company.company_industry}
                                    employeeCount={company.company_employee_count}
                                    location={company.company_hq_country}
                                    status={company.status}
                                    isNew={isNew(company.created_at)}
                                    onClick={() => router.push(`/partner/campaigns/${slug}/${company.company_domain}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
