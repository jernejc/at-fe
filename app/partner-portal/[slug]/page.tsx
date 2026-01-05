'use client';

import { use, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Loader2,
    ArrowLeft,
    Building2,
    Calendar,
    MessageSquare,
    Clock,
    ExternalLink,
    Search,
    Mail,
    Phone,
    Users,
    Linkedin,
    CheckSquare,
} from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/button';
import { AccountDetail } from '@/components/accounts';
import {
    getCampaign,
    getPartners,
    getCampaignPartners,
    getPartnerAssignedCompanies,
    getCampaignCompanies,
} from '@/lib/api';
import type {
    CampaignRead,
    PartnerSummary,
    PartnerAssignmentSummary,
    PartnerCompanyAssignmentWithCompany,
} from '@/lib/schemas';
import { cn } from '@/lib/utils';

// Demo partner ID
const DEMO_PARTNER_ID = 1;

interface CampaignDetailPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// Mock outreach status for demo
type OutreachStatus = 'action_item' | 'email' | 'call' | 'meet_in_person' | 'linkedin';

interface OpportunityWithStatus extends PartnerCompanyAssignmentWithCompany {
    outreach_status: OutreachStatus;
}

const STATUS_CONFIG: Record<OutreachStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    action_item: { label: 'Action Item', color: 'text-amber-600', bgColor: 'bg-amber-50 dark:bg-amber-900/30', icon: CheckSquare },
    email: { label: 'Email', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800', icon: Mail },
    call: { label: 'Call', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30', icon: Phone },
    meet_in_person: { label: 'Meet in Person', color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/30', icon: Users },
    linkedin: { label: 'LinkedIn', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-900/30', icon: Linkedin },
};

export default function PartnerCampaignDetailPage({ params }: CampaignDetailPageProps) {
    const { slug } = use(params);
    const router = useRouter();

    const [campaign, setCampaign] = useState<CampaignRead | null>(null);
    const [partner, setPartner] = useState<PartnerSummary | null>(null);
    const [partnerAssignment, setPartnerAssignment] = useState<PartnerAssignmentSummary | null>(null);
    const [opportunities, setOpportunities] = useState<OpportunityWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OutreachStatus | 'all'>('all');

    // Account detail modal
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Fetch campaign details
                const campaignData = await getCampaign(slug);
                setCampaign(campaignData);

                // Get partner
                const partnersResponse = await getPartners();
                const foundPartner = partnersResponse.items.find(p => p.id === DEMO_PARTNER_ID) || partnersResponse.items[0];
                setPartner(foundPartner || null);

                if (!foundPartner) {
                    setLoading(false);
                    return;
                }

                // Get partner assignment details
                const campaignPartners = await getCampaignPartners(slug);
                const assignment = campaignPartners.find(p => p.partner_id === foundPartner.id);
                setPartnerAssignment(assignment || null);

                // Get assigned companies
                let assignments: PartnerCompanyAssignmentWithCompany[] = [];
                try {
                    assignments = await getPartnerAssignedCompanies(slug, foundPartner.id);
                } catch (e) {
                    console.log('Failed to fetch assignments, falling back to campaign companies', e);
                }

                // Fallback: If no assignments, fetch all campaign companies for demo
                if (assignments.length === 0) {
                    const companiesResponse = await getCampaignCompanies(slug, { page_size: 100 });

                    // Map MembershipRead to PartnerCompanyAssignmentWithCompany
                    assignments = companiesResponse.items.map((company, index) => ({
                        id: company.company_id, // Use company_id as mock assignment ID
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

                // Add mock outreach status
                const statuses: OutreachStatus[] = ['action_item', 'email', 'call', 'meet_in_person', 'linkedin'];
                const oppsWithStatus: OpportunityWithStatus[] = assignments.map((a, i) => ({
                    ...a,
                    outreach_status: statuses[i % statuses.length], // Rotate through statuses for demo
                }));

                setOpportunities(oppsWithStatus);
            } catch (error) {
                console.error('Failed to fetch campaign data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [slug]);

    const handleBack = useCallback(() => {
        router.push('/partner-portal');
    }, [router]);

    const handleOpportunityClick = useCallback((domain: string) => {
        setSelectedDomain(domain);
        setDetailOpen(true);
    }, []);

    const closeDetail = useCallback(() => {
        setDetailOpen(false);
        setSelectedDomain(null);
    }, []);

    // Filter opportunities
    const filteredOpportunities = useMemo(() => {
        return opportunities.filter(opp => {
            const matchesSearch = !searchQuery ||
                opp.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                opp.company_domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                opp.company_industry?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || opp.outreach_status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [opportunities, searchQuery, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const byStatus = opportunities.reduce((acc, opp) => {
            acc[opp.outreach_status] = (acc[opp.outreach_status] || 0) + 1;
            return acc;
        }, {} as Record<OutreachStatus, number>);

        return {
            total: opportunities.length,
            action_item: byStatus.action_item || 0,
            email: byStatus.email || 0,
            call: byStatus.call || 0,
            meet_in_person: byStatus.meet_in_person || 0,
            linkedin: byStatus.linkedin || 0,
        };
    }, [opportunities]);

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

    if (!campaign) {
        return (
            <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Campaign not found</p>
                    <Button onClick={handleBack}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 overflow-y-auto">
                {/* Campaign Header */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <div className="max-w-[1600px] mx-auto px-6 py-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </button>



                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {campaign.name}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    {campaign.description || 'Enterprise opportunities assigned to you'}
                                </p>

                                {/* PDM Notes */}
                                {partnerAssignment?.role_in_campaign && (
                                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">
                                            Notes from your PDM:
                                        </p>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                            {partnerAssignment.role_in_campaign}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center justify-center px-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[110px] shadow-sm">
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.total}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Total</p>
                                </div>

                                <div className="flex flex-col items-center justify-center px-4 py-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-900/30 min-w-[110px] shadow-sm">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-0.5">
                                        <CheckSquare className="w-4 h-4" />
                                        <p className="text-2xl font-bold">{stats.action_item}</p>
                                    </div>
                                    <p className="text-xs font-medium text-amber-700/80 dark:text-amber-400/80 uppercase tracking-wider">Action Items</p>
                                </div>

                                <div className="flex flex-col items-center justify-center px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 min-w-[100px] shadow-sm">
                                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 mb-0.5">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <p className="text-2xl font-bold">{stats.email}</p>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</p>
                                </div>

                                <div className="flex flex-col items-center justify-center px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30 min-w-[100px] shadow-sm">
                                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-0.5">
                                        <Phone className="w-4 h-4" />
                                        <p className="text-2xl font-bold">{stats.call}</p>
                                    </div>
                                    <p className="text-xs font-medium text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider">Call</p>
                                </div>

                                <div className="flex flex-col items-center justify-center px-4 py-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-900/30 min-w-[110px] shadow-sm">
                                    <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 mb-0.5">
                                        <Users className="w-4 h-4" />
                                        <p className="text-2xl font-bold">{stats.meet_in_person}</p>
                                    </div>
                                    <p className="text-xs font-medium text-purple-700/80 dark:text-purple-400/80 uppercase tracking-wider">In Person</p>
                                </div>

                                <div className="flex flex-col items-center justify-center px-4 py-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30 min-w-[100px] shadow-sm">
                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
                                        <Linkedin className="w-4 h-4" />
                                        <p className="text-2xl font-bold">{stats.linkedin}</p>
                                    </div>
                                    <p className="text-xs font-medium text-blue-700/80 dark:text-blue-400/80 uppercase tracking-wider">LinkedIn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="max-w-[1600px] mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search opportunities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                                    statusFilter === 'all'
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                )}
                            >
                                All
                            </button>
                            {(Object.entries(STATUS_CONFIG) as [OutreachStatus, typeof STATUS_CONFIG[OutreachStatus]][]).map(([status, config]) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5",
                                        statusFilter === status
                                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    )}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Opportunities Table */}
                <div className="max-w-[1600px] mx-auto px-6 pb-8">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <div className="col-span-4">Company</div>
                            <div className="col-span-2">Industry</div>
                            <div className="col-span-1 text-right">Size</div>
                            <div className="col-span-2">Location</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Table Body */}
                        {filteredOpportunities.length === 0 ? (
                            <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                                No opportunities match your criteria
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredOpportunities.map((opp) => {
                                    const statusConfig = STATUS_CONFIG[opp.outreach_status];
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <button
                                            key={opp.id}
                                            onClick={() => handleOpportunityClick(opp.company_domain)}
                                            className="w-full grid grid-cols-12 gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group"
                                        >
                                            {/* Company */}
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                                    {opp.company_logo_url ? (
                                                        <img
                                                            src={opp.company_logo_url}
                                                            alt={opp.company_name || ''}
                                                            className="w-6 h-6 object-contain"
                                                        />
                                                    ) : (
                                                        <Building2 className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                        {opp.company_name || opp.company_domain}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {opp.company_domain}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Industry */}
                                            <div className="col-span-2 flex items-center">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                                    {opp.company_industry || '-'}
                                                </span>
                                            </div>

                                            {/* Size */}
                                            <div className="col-span-1 flex items-center justify-end">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                                                    {opp.company_employee_count?.toLocaleString() || '-'}
                                                </span>
                                            </div>

                                            {/* Location */}
                                            <div className="col-span-2 flex items-center">
                                                <span className="text-sm text-slate-600 dark:text-slate-300 truncate">
                                                    {opp.company_hq_country || '-'}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="col-span-2 flex items-center">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                    statusConfig.bgColor,
                                                    statusConfig.color
                                                )}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig.label}
                                                </span>
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-1 flex items-center justify-end">
                                                <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Account Detail Modal */}
            {selectedDomain && (
                <AccountDetail
                    domain={selectedDomain}
                    open={detailOpen}
                    onClose={closeDetail}
                />
            )}
        </div>
    );
}
