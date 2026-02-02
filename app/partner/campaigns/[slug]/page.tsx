'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Loader2,
    Building2,
    Package,
    Download,
    Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyRowCompact } from '@/components/campaigns/CompanyRowCompact';
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn, getProductBadgeTheme, getProductTextColor, isNewOpportunity } from '@/lib/utils';
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

type SortColumn = 'company_name' | 'revenue' | 'company_industry' | 'company_employee_count' | 'company_hq_country' | 'status' | 'created_at';

const SORT_COLUMN_LABELS: Record<SortColumn, string> = {
    company_name: 'Company Name',
    revenue: 'Expected Revenue',
    company_industry: 'Industry',
    company_employee_count: 'Size',
    company_hq_country: 'Location',
    status: 'Status',
    created_at: 'Date Added',
};

const SORT_DIRECTION_LABELS: Record<'asc' | 'desc', string> = {
    asc: 'Ascending',
    desc: 'Descending',
};

export default function PartnerCampaignDetailPage({ params }: CampaignDetailPageProps) {
    const { slug } = use(params);
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();

    const [campaign, setCampaign] = useState<CampaignRead | null>(null);
    const [companies, setCompanies] = useState<PartnerCompanyAssignmentWithCompany[]>([]);
    const [product, setProduct] = useState<{ id: number; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const [sortColumn, setSortColumn] = useState<SortColumn>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [exporting, setExporting] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partnerId = (session?.user as any)?.partner_id as number | undefined || 1;

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

                // Fetch product
                if (campaignData.target_product_id) {
                    try {
                        const productData = await getProduct(campaignData.target_product_id);
                        setProduct(productData);
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
                        created_at: company.created_at,
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

    return (
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
                {/* Header */}
                <div className="space-y-3">
                    {/* Product Pill */}
                    {product ? (
                        <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full w-fit border transition-colors",
                            getProductBadgeTheme(product.id).bg,
                            getProductBadgeTheme(product.id).text,
                            getProductBadgeTheme(product.id).border
                        )}>
                            <Package className={cn("w-3 h-3", getProductTextColor(product.id))} strokeWidth={2.5} />
                            <span className="truncate max-w-[150px]">{product.name}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full w-fit border border-slate-200 dark:border-slate-700">
                            <Package className="w-3 h-3 text-slate-400" strokeWidth={2.5} />
                            Unassigned
                        </div>
                    )}

                    {/* Title Row */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {campaign.name}
                        </h1>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 border-slate-200 dark:border-slate-700"
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            {exporting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Export
                        </Button>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{companies.length} Companies</span>
                        </div>
                    </div>
                </div>

                {/* <CampaignCRMAnalytics /> */}

                {/* Company Table */}
                <div className='space-y-4 mt-15'>
                    <div className="flex items-center justify-between">
                        <h2 className='font-medium text-lg'>Companies</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Sort by</span>
                                <Select value={sortColumn} onValueChange={(value) => setSortColumn(value as SortColumn)}>
                                    <SelectTrigger className="w-[160px] h-8 text-xs">
                                        <span>{SORT_COLUMN_LABELS[sortColumn]}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="company_name">Company Name</SelectItem>
                                        <SelectItem value="revenue">Expected Revenue</SelectItem>
                                        <SelectItem value="company_industry">Industry</SelectItem>
                                        <SelectItem value="company_employee_count">Size</SelectItem>
                                        <SelectItem value="company_hq_country">Location</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="created_at">Date Added</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Order</span>
                                <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as 'asc' | 'desc')}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <span>{SORT_DIRECTION_LABELS[sortDirection]}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="asc">Ascending</SelectItem>
                                        <SelectItem value="desc">Descending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    {sortedCompanies.length === 0 ? (
                        <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                            No companies found
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {sortedCompanies.map((company) => (
                                <CompanyRowCompact
                                    key={company.id}
                                    logoUrl={company.company_logo_url}
                                    name={company.company_name || 'Unknown Company'}
                                    domain={company.company_domain}
                                    industry={company.company_industry}
                                    employeeCount={company.company_employee_count}
                                    hqCountry={company.company_hq_country}
                                    revenue={estimateRevenue(company.company_employee_count)}
                                    status={company.status}
                                    isNew={isNewOpportunity(company.created_at)}
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
