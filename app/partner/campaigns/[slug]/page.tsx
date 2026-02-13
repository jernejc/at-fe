'use client';

import { use, useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Loader2,
    Building2,
    Package,
    Download,
    Calendar,
    ChevronDown,
    FolderInput,
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
    exportCampaignContactsCSV,
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

type SortColumn = 'name' | 'revenue' | 'industry' | 'employee_count' | 'hq_country' | 'status' | 'assigned_at';

const SORT_COLUMN_LABELS: Record<SortColumn, string> = {
    name: 'Company Name',
    revenue: 'Expected Revenue',
    industry: 'Industry',
    employee_count: 'Size',
    hq_country: 'Location',
    status: 'Status',
    assigned_at: 'Date Added',
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

    const [sortColumn, setSortColumn] = useState<SortColumn>('assigned_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [exporting, setExporting] = useState(false);
    const [exportingContacts, setExportingContacts] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                        company: {
                            id: company.company_id,
                            domain: company.domain,
                            name: company.company_name || company.domain,
                            industry: company.industry,
                            employee_count: company.employee_count,
                            hq_city: null,
                            hq_country: company.hq_country,
                            linkedin_id: null,
                            rating_overall: null,
                            logo_url: null,
                            logo_base64: company.logo_base64 ?? null,
                            data_sources: [],
                            data_depth: 'preview' as const,
                            top_contact: null,
                            updated_at: new Date().toISOString(),
                        },
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
            a.download = `${campaign?.name || slug}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const handleExportContacts = async () => {
        setExportingContacts(true);
        try {
            const blob = await exportCampaignContactsCSV(slug);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${campaign?.name || slug}-contacts.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export contacts failed:', error);
        } finally {
            setExportingContacts(false);
        }
    };

    const sortedCompanies = useMemo(() => {
        const sorted = [...companies].sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';

            switch (sortColumn) {
                case 'name':
                    aVal = (a.company.name || '').toLowerCase();
                    bVal = (b.company.name || '').toLowerCase();
                    break;
                case 'revenue':
                    aVal = estimateRevenueValue(a.company.employee_count);
                    bVal = estimateRevenueValue(b.company.employee_count);
                    break;
                case 'industry':
                    aVal = (a.company.industry || '').toLowerCase();
                    bVal = (b.company.industry || '').toLowerCase();
                    break;
                case 'employee_count':
                    aVal = a.company.employee_count || 0;
                    bVal = b.company.employee_count || 0;
                    break;
                case 'hq_country':
                    aVal = (a.company.hq_country || '').toLowerCase();
                    bVal = (b.company.hq_country || '').toLowerCase();
                    break;
                case 'status':
                    aVal = (a.status || '').toLowerCase();
                    bVal = (b.status || '').toLowerCase();
                    break;
                case 'assigned_at':
                    aVal = new Date(a.assigned_at).getTime();
                    bVal = new Date(b.assigned_at).getTime();
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
                    <div className="flex items-center gap-4">
                        <h1 className="flex-1 text-2xl font-bold tracking-tight text-foreground">
                            {campaign.name}
                        </h1>
                        <div className="relative">
                            <Button
                                size="sm"
                                className="h-8 gap-2 border-slate-200 dark:border-slate-700"
                                onClick={() => setExportOpen(!exportOpen)}
                                disabled={exporting || exportingContacts}
                            >
                                {(exporting || exportingContacts) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Export
                                <ChevronDown className="w-3.5 h-3.5" />
                            </Button>

                            {exportOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden py-1">
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => { setExportOpen(false); handleExport(); }}
                                        >
                                            Companies
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full px-3 py-2 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            onClick={() => { setExportOpen(false); handleExportContacts(); }}
                                        >
                                            Contacts
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={() => { /* demo — no handler yet */ }}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-2 border-slate-200 dark:border-slate-700"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FolderInput />
                            Import
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
                                        <SelectItem value="name">Company Name</SelectItem>
                                        <SelectItem value="revenue">Expected Revenue</SelectItem>
                                        <SelectItem value="industry">Industry</SelectItem>
                                        <SelectItem value="employee_count">Size</SelectItem>
                                        <SelectItem value="hq_country">Location</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="assigned_at">Date Added</SelectItem>
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
                            {sortedCompanies.map((assignment) => (
                                <CompanyRowCompact
                                    key={assignment.id}
                                    logoUrl={assignment.company.logo_url || (assignment.company.logo_base64 ? `data:image/png;base64,${assignment.company.logo_base64}` : null)}
                                    name={assignment.company.name || 'Unknown Company'}
                                    domain={assignment.company.domain}
                                    industry={assignment.company.industry}
                                    employeeCount={assignment.company.employee_count}
                                    hqCountry={assignment.company.hq_country}
                                    // revenue={estimateRevenue(assignment.company.employee_count)}
                                    status={assignment.status}
                                    isNew={isNewOpportunity(assignment)}
                                    onClick={() => router.push(`/partner/campaigns/${slug}/${assignment.company.domain}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
