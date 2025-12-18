'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createCampaign, getCompanies } from '@/lib/api';
import type { CampaignFilterUI, CampaignDraft } from '@/lib/schemas/campaign';
import type { CompanySummary } from '@/lib/schemas';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { PartnerSelection } from './builder/PartnerSelection';
import { SearchInput } from './builder/SearchInput';
import { StatsCard } from './builder/StatsCard';
import { AccountDetail } from '@/components/accounts';

interface CampaignBuilderProps {
    initialDomains?: string[];
}

export function CampaignBuilder({ initialDomains = [] }: CampaignBuilderProps) {
    const router = useRouter();

    const [draft, setDraft] = useState<CampaignDraft>({
        name: 'Untitled Campaign',
        description: '',
        filters: [],
    });

    const [currentStep, setCurrentStep] = useState<'filters' | 'partners'>('filters');
    const [saving, setSaving] = useState(false);

    // Track if the UI has "moved up" to show results/searching
    const [hasExpanded, setHasExpanded] = useState(false);

    // Mock company data (replace with real API)
    const [allCompanies, setAllCompanies] = useState<CompanySummary[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    // Account Detail Popover State
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleCompanyClick = (domain: string) => {
        setSelectedDomain(domain);
        setDetailOpen(true);
    };

    // Load companies
    useEffect(() => {
        async function loadCompanies() {
            try {
                const result = await getCompanies({ page: 1, page_size: 100 });
                setAllCompanies(result.items);
            } catch (err) {
                console.error('Failed to load companies:', err);
            } finally {
                setLoadingCompanies(false);
            }
        }
        loadCompanies();
    }, []);

    // Initialize with domain list if provided
    useEffect(() => {
        if (initialDomains.length > 0) {
            setDraft(prev => ({
                ...prev,
                filters: [{
                    id: crypto.randomUUID(),
                    type: 'domain_list',
                    value: initialDomains.join(','),
                    displayLabel: `${initialDomains.length} selected companies`,
                }],
            }));
        }
    }, [initialDomains]);

    // Apply filters to companies
    const matchingCompanies = useMemo(() => {
        if (draft.filters.length === 0) return allCompanies;

        return allCompanies.filter(company => {
            return draft.filters.every(filter => {
                switch (filter.type) {
                    case 'industry':
                        return company.industry?.toLowerCase().includes(filter.value.toLowerCase());
                    case 'size_min':
                        return (company.employee_count || 0) >= parseInt(filter.value);
                    case 'size_max':
                        return (company.employee_count || 0) <= parseInt(filter.value);
                    case 'country':
                        return company.hq_country?.toLowerCase().includes(filter.value.toLowerCase());
                    case 'domain_list':
                        const domains = filter.value.split(',').map(d => d.trim().toLowerCase());
                        return domains.includes(company.domain.toLowerCase());
                    case 'natural_query':
                        const query = filter.value.toLowerCase();
                        return (
                            company.name.toLowerCase().includes(query) ||
                            company.industry?.toLowerCase().includes(query) ||
                            company.hq_country?.toLowerCase().includes(query) ||
                            company.domain.toLowerCase().includes(query)
                        );
                    default:
                        return true;
                }
            });
        });
    }, [allCompanies, draft.filters]);

    // Compute stats
    const stats = useMemo(() => {
        const companies = matchingCompanies;
        const countries = new Set(companies.map(c => c.hq_country).filter(Boolean));
        const totalEmployees = companies.reduce((sum, c) => sum + (c.employee_count || 0), 0);

        return {
            count: companies.length,
            countries: countries.size,
            totalEmployees: totalEmployees,
        };
    }, [matchingCompanies]);

    const handleCreateCampaign = async () => {
        let finalName = draft.name;

        // Auto-generate name if untitled
        if (!finalName.trim() || finalName === 'Untitled Campaign') {
            const parts = [];
            const industries = draft.filters.find(f => f.type === 'industry')?.value;
            const country = draft.filters.find(f => f.type === 'country')?.value;
            const size = draft.filters.find(f => f.type === 'size_min' || f.type === 'size_max');

            if (industries) parts.push(industries);
            else parts.push('Companies');

            if (country) parts.push(`in ${country}`);

            if (size) {
                if (size.type === 'size_min') parts.push(`(${size.value}+ employees)`);
                else parts.push(`(<${size.value} employees)`);
            }

            finalName = parts.length > 0 ? parts.join(' ') : `Campaign ${new Date().toLocaleDateString()}`;
        }

        setSaving(true);
        try {
            const domains = matchingCompanies.map(c => c.domain);

            const campaign = await createCampaign({
                name: finalName,
                description: draft.description || undefined,
                domains: domains,
                target_criteria: { filters: draft.filters },
            });

            router.push(`/campaigns/${campaign.slug}`);
        } catch (err) {
            console.error('Failed to create campaign:', err);
            alert('Failed to create campaign: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const hasFilters = draft.filters.length > 0;

    // Only show results view if there are active filters. 
    const hasResults = hasFilters;

    // Latch the expanded state: once it moves up, it stays up
    useEffect(() => {
        if (hasResults) {
            setHasExpanded(true);
        }
    }, [hasResults]);

    const isLayoutExpanded = hasResults || hasExpanded;

    // Handle "Next" or "Create" action
    const handleMainAction = () => {
        if (currentStep === 'filters') {
            setCurrentStep('partners');
        } else {
            handleCreateCampaign();
        }
    };

    return (
        <div className="min-h-screen bg-background overflow-x-hidden flex flex-col font-sans relative selection:bg-primary/20">
            {/* Ambient Background - Subtle & Professional */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-in fade-in duration-1000" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-gray-200/30 dark:bg-gray-800/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-50 animate-in fade-in duration-1000 delay-300" />
            </div>

            <div className="relative z-10 w-full">
                <Header />
            </div>

            <main className={cn(
                "relative flex-1 flex flex-col items-center w-full transition-all duration-700 ease-in-out",
                isLayoutExpanded ? "pt-12" : "pt-[30vh]" // Dynamic padding instead of flexbox centering
            )}>
                <div className="w-full max-w-2xl mx-auto px-6 transition-all duration-700">

                    {/* Step Indicator */}
                    {hasResults && (
                        <div className="flex items-center justify-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4">
                            <div className={cn("h-1.5 rounded-full transition-all duration-500", currentStep === 'filters' ? "w-8 bg-primary" : "w-2 bg-primary/20")} />
                            <div className={cn("h-1.5 rounded-full transition-all duration-500", currentStep === 'partners' ? "w-8 bg-primary" : "w-2 bg-primary/20")} />
                        </div>
                    )}

                    {currentStep === 'partners' ? (
                        <div className="w-full">
                            {/* Back Button */}
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentStep('filters')}
                                className="mb-4 gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to filters
                            </Button>

                            <PartnerSelection
                                selectedPartners={draft.partners || []}
                                onSelectionChange={(partners) => setDraft(prev => ({ ...prev, partners }))}
                            />

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={handleCreateCampaign}
                                    disabled={saving}
                                    className="h-11 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all whitespace-nowrap"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        "Launch Campaign"
                                    )}
                                    {!saving && <ArrowRight className="w-4 h-4 ml-2 opacity-50" />}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={cn(
                                "text-center transition-all duration-500 overflow-hidden",
                                isLayoutExpanded ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-8"
                            )}>
                                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                                    Define your Audience
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                                    Use natural language or filters to identify your ideal customer profile.
                                </p>
                            </div>

                            {/* Search Container */}
                            <SearchInput
                                filters={draft.filters}
                                onFiltersChange={(filters) => setDraft(prev => ({ ...prev, filters }))}
                                onSearch={() => { }} // Handle additional search actions if needed
                            />

                            {/* Stats Card - Refined Layout with Integrated Button */}
                            <div className={cn(
                                "transition-all duration-700 ease-out",
                                hasResults ? "opacity-100 translate-y-0 mt-6" : "opacity-0 translate-y-10 mt-0 pointer-events-none"
                            )}>
                                {hasFilters && stats.count > 0 && (
                                    <StatsCard
                                        stats={stats}
                                        loadingCompanies={loadingCompanies}
                                        matchingCompanies={matchingCompanies}
                                        onMainAction={handleMainAction}
                                        saving={saving}
                                        mainActionLabel="Next: Assign Partners"
                                        onCompanyClick={handleCompanyClick}
                                    />
                                )}
                            </div>
                        </>
                    )}

                </div>
            </main>

            {/* Account Detail Popover */}
            {selectedDomain && (
                <AccountDetail
                    domain={selectedDomain}
                    open={detailOpen}
                    onClose={() => setDetailOpen(false)}
                />
            )}
        </div>
    );
}
