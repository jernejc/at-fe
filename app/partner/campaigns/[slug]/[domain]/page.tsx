'use client';

import { use, useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
    ArrowLeft,
    BookOpen,
    Users,
    Zap,
    Info,
    Loader2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    getCampaign,
    getCompany,
    getCompanyPlaybooks,
    getCompanyPlaybook,
    getCompanyExplainability,
    getSignalProvenance,
    getFitBreakdown,
} from '@/lib/api';
import type {
    CampaignRead,
    CompanyRead,
    PlaybookSummary,
    PlaybookRead,
    PlaybookContactResponse,
    CompanyExplainabilityResponse,
    FitScore,
} from '@/lib/schemas';
import type { SignalProvenanceResponse } from '@/lib/schemas/provenance';
import { ProductFitCard } from '@/components/partner/ProductFitCard';
import { PartnerPlaybookTab } from '@/components/partner/PartnerPlaybookTab';
import { PartnerStakeholdersTab } from '@/components/partner/PartnerStakeholdersTab';
import { PartnerSignalsTab } from '@/components/partner/PartnerSignalsTab';
import { OverviewTab } from '@/components/accounts/detail/OverviewTab';
import { KeyStakeholderSheet } from '@/components/accounts/detail/KeyStakeholderSheet';
import { FitBreakdownSheet } from '@/components/accounts/detail/FitBreakdownSheet';
import { SignalProvenanceSheet } from '@/components/accounts/detail/SignalProvenanceSheet';
import { Separator } from '@/components/ui/separator';

interface CompanyDetailPageProps {
    params: Promise<{
        slug: string;
        domain: string;
    }>;
}

type TabValue = 'playbook' | 'stakeholders' | 'signals' | 'overview';

function CompanyDetailPageContent({ slug, domain }: { slug: string; domain: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL state for tabs
    const activeTab = (searchParams.get('tab') as TabValue) || 'playbook';

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tab);
        router.replace(`${pathname}?${params.toString()}`);
    };

    // Data state
    const [campaign, setCampaign] = useState<CampaignRead | null>(null);
    const [company, setCompany] = useState<CompanyRead | null>(null);
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>([]);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [explainability, setExplainability] = useState<CompanyExplainabilityResponse | null>(null);
    const [loading, setLoading] = useState(true);

    // Sheet state
    const [selectedStakeholder, setSelectedStakeholder] = useState<PlaybookContactResponse | null>(null);
    const [stakeholderSheetOpen, setStakeholderSheetOpen] = useState(false);
    const [selectedFit, setSelectedFit] = useState<FitScore | null>(null);
    const [fitSheetOpen, setFitSheetOpen] = useState(false);
    const [fitLoading, setFitLoading] = useState(false);
    const [selectedSignal, setSelectedSignal] = useState<SignalProvenanceResponse | null>(null);
    const [signalSheetOpen, setSignalSheetOpen] = useState(false);
    const [signalLoading, setSignalLoading] = useState(false);

    const decodedDomain = decodeURIComponent(domain);

    // Fetch all required data
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // Fetch campaign, company, playbooks, and explainability in parallel
                const [campaignData, companyData, playbooksData, explainabilityData] = await Promise.all([
                    getCampaign(slug),
                    getCompany(decodedDomain),
                    getCompanyPlaybooks(decodedDomain),
                    getCompanyExplainability(decodedDomain),
                ]);

                setCampaign(campaignData);
                setCompany(companyData.company);
                setPlaybooks(playbooksData.playbooks);
                setExplainability(explainabilityData);

                // Fetch playbook detail for the target product
                if (campaignData.target_product_id) {
                    const targetPlaybook = playbooksData.playbooks.find(
                        p => p.product_id === campaignData.target_product_id
                    );
                    if (targetPlaybook) {
                        const detail = await getCompanyPlaybook(decodedDomain, targetPlaybook.id);
                        setPlaybookDetail(detail);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch company data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [slug, decodedDomain]);

    // Get the product fit for the campaign's target product
    const productFit = useMemo(() => {
        if (!explainability || !campaign?.target_product_id) return null;
        return explainability.fits_summary.find(
            f => f.product_id === campaign.target_product_id
        ) || null;
    }, [explainability, campaign?.target_product_id]);

    // Get stakeholders from playbook detail
    const stakeholders = useMemo(() => {
        return playbookDetail?.contacts || [];
    }, [playbookDetail]);

    // Get the product name for the campaign's target product
    const productName = useMemo(() => {
        return productFit?.product_name || null;
    }, [productFit]);

    // Handlers
    const handlePlaybookGenerated = (playbook: PlaybookRead) => {
        setPlaybookDetail(playbook);
    };

    const handleSelectStakeholder = (contact: PlaybookContactResponse) => {
        setSelectedStakeholder(contact);
        setStakeholderSheetOpen(true);
    };

    const handleSelectFit = async () => {
        if (!productFit || !campaign?.target_product_id) return;

        setFitLoading(true);
        setFitSheetOpen(true);

        try {
            const fitDetail = await getFitBreakdown(decodedDomain, campaign.target_product_id);
            setSelectedFit(fitDetail);
        } catch (error) {
            console.error('Failed to fetch fit breakdown:', error);
        } finally {
            setFitLoading(false);
        }
    };

    const handleSelectSignal = async (signalId: number) => {
        setSignalLoading(true);
        setSignalSheetOpen(true);

        try {
            const signalDetail = await getSignalProvenance(decodedDomain, signalId);
            setSelectedSignal(signalDetail);
        } catch (error) {
            console.error('Failed to fetch signal provenance:', error);
        } finally {
            setSignalLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </main>
        );
    }

    if (!company || !campaign) {
        return (
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <button
                        onClick={() => router.push(`/partner/campaigns/${slug}`)}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Campaign
                    </button>
                    <p className="text-slate-500 dark:text-slate-400">Company not found</p>
                </div>
            </main>
        );
    }

    const logoUrl = company.logo_base64
        ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
        : company.logo_url;

    return (
        <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-6 py-6">
                {/* Back Button */}
                <button
                    onClick={() => router.push(`/partner/campaigns/${slug}`)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Campaign
                </button>

                {/* Company Header */}
                <div className="flex items-center gap-4 mb-6">
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt={company.name}
                            className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 dark:border-slate-700"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {company.name}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {company.domain}
                        </p>
                    </div>
                </div>

                {/* Product Fit Card - Above Tabs */}
                {productFit && (
                    <div className="mb-8">
                        <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Product Fit
                        </h3>
                        <ProductFitCard fit={productFit} onClick={handleSelectFit} />
                    </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="gap-0">
                    <TabsList variant="line" className="gap-5">
                        <TabsTrigger value="playbook" className="gap-1.5">
                            <BookOpen className="w-4 h-4" />
                            Playbook
                        </TabsTrigger>
                        <TabsTrigger value="stakeholders" className="gap-1.5">
                            <Users className="w-4 h-4" />
                            Stakeholders
                        </TabsTrigger>
                        <TabsTrigger value="signals" className="gap-1.5">
                            <Zap className="w-4 h-4" />
                            Signals
                        </TabsTrigger>
                        <TabsTrigger value="overview" className="gap-1.5">
                            <Info className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                    </TabsList>

                    <Separator className="mb-8"></Separator>

                    <TabsContent value="playbook">
                        {campaign.target_product_id && (
                            <PartnerPlaybookTab
                                domain={decodedDomain}
                                productId={campaign.target_product_id}
                                playbooks={playbooks}
                                productName={productName || undefined}
                                onPlaybookGenerated={handlePlaybookGenerated}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="stakeholders">
                        <PartnerStakeholdersTab
                            contacts={stakeholders}
                            onSelectStakeholder={handleSelectStakeholder}
                        />
                    </TabsContent>

                    <TabsContent value="signals">
                        {explainability && (
                            <PartnerSignalsTab
                                explainability={explainability}
                                onSelectSignal={handleSelectSignal}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="overview">
                        <OverviewTab company={company} />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Sheets */}
            <KeyStakeholderSheet
                open={stakeholderSheetOpen}
                onOpenChange={setStakeholderSheetOpen}
                contact={selectedStakeholder}
            />

            <FitBreakdownSheet
                open={fitSheetOpen}
                onOpenChange={setFitSheetOpen}
                fit={selectedFit}
                isLoading={fitLoading}
            />

            <SignalProvenanceSheet
                open={signalSheetOpen}
                onOpenChange={setSignalSheetOpen}
                signal={selectedSignal}
                isLoading={signalLoading}
            />
        </main>
    );
}

export default function CompanyDetailPage({ params }: CompanyDetailPageProps) {
    const { slug, domain } = use(params);

    return (
        <Suspense fallback={
            <main className="flex-1 overflow-y-auto">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </main>
        }>
            <CompanyDetailPageContent slug={slug} domain={domain} />
        </Suspense>
    );
}
