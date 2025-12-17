'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createCampaign, getCompanies } from '@/lib/api';
import type { CampaignFilterUI, CampaignDraft, Partner } from '@/lib/schemas/campaign';
import type { CompanySummary } from '@/lib/schemas';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Loader2, Search, ChevronDown, ChevronUp, X, Pencil, Check, Building2, Users, MapPin, Briefcase, Globe, ArrowRight } from 'lucide-react';
import { CompanyRowCompact } from './CompanyRowCompact';
import { PartnerSelection } from './PartnerSelection';

// Simple keyword matching for natural language parsing
const INDUSTRY_KEYWORDS = ['tech', 'technology', 'software', 'saas', 'healthcare', 'health', 'finance', 'financial', 'retail', 'manufacturing', 'education', 'media', 'energy'];
const SIZE_KEYWORDS = ['enterprise', 'startup', 'small', 'medium', 'large', 'smb'];
const COUNTRY_KEYWORDS = ['us', 'usa', 'united states', 'uk', 'germany', 'france', 'canada', 'australia'];

function parseNaturalLanguage(input: string): CampaignFilterUI | null {
    const lower = input.toLowerCase().trim();

    // Parse "50+ employees" or "1000 employees"
    const sizeMatch = lower.match(/(\d+)\+?\s*(employees?)?/);
    if (sizeMatch) {
        return {
            id: crypto.randomUUID(),
            type: 'size_min',
            value: sizeMatch[1],
            displayLabel: `${parseInt(sizeMatch[1]).toLocaleString()}+ employees`
        };
    }

    // Keyword matching for size
    if (SIZE_KEYWORDS.some(k => lower.includes(k))) {
        if (lower.includes('enterprise') || lower.includes('large')) {
            return { id: crypto.randomUUID(), type: 'size_min', value: '1000', displayLabel: 'Enterprise (1000+)' };
        }
        if (lower.includes('startup') || lower.includes('small')) {
            return { id: crypto.randomUUID(), type: 'size_max', value: '100', displayLabel: 'Startup (< 100)' };
        }
        if (lower.includes('smb') || lower.includes('medium')) {
            return { id: crypto.randomUUID(), type: 'size_min', value: '50', displayLabel: 'SMB (50-500)' };
        }
    }

    // Keyword matching for industry
    for (const industry of INDUSTRY_KEYWORDS) {
        if (lower.includes(industry)) {
            const displayName = industry.charAt(0).toUpperCase() + industry.slice(1);
            return { id: crypto.randomUUID(), type: 'industry', value: displayName, displayLabel: displayName };
        }
    }

    // Keyword matching for country
    for (const country of COUNTRY_KEYWORDS) {
        if (lower.includes(country)) {
            let displayName = country;
            if (country === 'us' || country === 'usa' || country === 'united states') displayName = 'United States';
            else if (country === 'uk') displayName = 'United Kingdom';
            else displayName = country.charAt(0).toUpperCase() + country.slice(1);

            return { id: crypto.randomUUID(), type: 'country', value: displayName, displayLabel: displayName };
        }
    }

    // Fallback to generic query if long enough
    if (input.trim().length > 2) {
        return { id: crypto.randomUUID(), type: 'natural_query', value: input.trim(), displayLabel: input.trim() };
    }

    return null;
}

// Dropdown options
const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Media', 'Energy'];
const SIZE_OPTIONS = [
    { label: 'Startup (1-50)', value: '50', type: 'size_max' as const },
    { label: 'Small (50-200)', value: '50', type: 'size_min' as const },
    { label: 'Medium (200-1000)', value: '200', type: 'size_min' as const },
    { label: 'Enterprise (1000+)', value: '1000', type: 'size_min' as const },
];
const COUNTRY_OPTIONS = ['United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia'];

interface CampaignBuilderProps {
    initialDomains?: string[];
}

export function CampaignBuilder({ initialDomains = [] }: CampaignBuilderProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [draft, setDraft] = useState<CampaignDraft>({
        name: 'Untitled Campaign',
        description: '',
        filters: [],
    });

    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [currentStep, setCurrentStep] = useState<'filters' | 'partners'>('filters');
    const [saving, setSaving] = useState(false);

    // Track if the UI has "moved up" to show results/searching
    const [hasExpanded, setHasExpanded] = useState(false);

    // Toggle company list visibility
    const [showCompanyList, setShowCompanyList] = useState(false);

    // Mock company data (replace with real API)
    const [allCompanies, setAllCompanies] = useState<CompanySummary[]>([]);
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
            if (isEditingName && nameInputRef.current && !nameInputRef.current.contains(e.target as Node)) {
                setIsEditingName(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditingName]);

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

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const filter = parseNaturalLanguage(input);

        if (filter) {
            setDraft(prev => ({
                ...prev,
                filters: [...prev.filters, filter],
            }));
            setInput('');
        }
    };

    const addFilter = (filter: CampaignFilterUI) => {
        setDraft(prev => ({
            ...prev,
            filters: [...prev.filters, filter],
        }));
        setOpenDropdown(null);
    };

    const handleRemoveFilter = (filterId: string) => {
        setDraft(prev => ({
            ...prev,
            filters: prev.filters.filter(f => f.id !== filterId),
        }));
    };

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

    const FILTER_BUTTONS = [
        { key: 'industry', label: 'Industry', icon: Briefcase, options: INDUSTRY_OPTIONS.map(o => ({ label: o, value: o, type: 'industry' as const })) },
        { key: 'size', label: 'Size', icon: Users, options: SIZE_OPTIONS },
        { key: 'country', label: 'Location', icon: Globe, options: COUNTRY_OPTIONS.map(o => ({ label: o, value: o, type: 'country' as const })) },
    ];

    // Only show results view if there are active filters. 
    // This prevents the UI from sliding up automatically just because the default company list loads.
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
        <div className="min-h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-x-hidden flex flex-col font-sans relative selection:bg-blue-100 dark:selection:bg-blue-900/30">
            {/* Ambient Background - Subtle & Professional */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-50/50 dark:bg-blue-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-in fade-in duration-1000" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70 animate-in fade-in duration-1000 delay-300" />
            </div>

            <div className="relative z-10 w-full">
                <Header />
            </div>

            <main className={cn(
                "relative z-10 flex-1 flex flex-col items-center w-full transition-all duration-700 ease-in-out",
                isLayoutExpanded ? "pt-12" : "pt-[30vh]" // Dynamic padding instead of flexbox centering
            )}>
                <div className="w-full max-w-2xl mx-auto px-6 transition-all duration-700">

                    {/* Step Indicator */}
                    {hasResults && (
                        <div className="flex items-center justify-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4">
                            <div className={cn("h-1.5 rounded-full transition-all duration-500", currentStep === 'filters' ? "w-8 bg-blue-600" : "w-2 bg-blue-200 dark:bg-blue-900")} />
                            <div className={cn("h-1.5 rounded-full transition-all duration-500", currentStep === 'partners' ? "w-8 bg-blue-600" : "w-2 bg-blue-200 dark:bg-blue-900")} />
                        </div>
                    )}

                    {currentStep === 'partners' ? (
                        <div className="w-full">
                            {/* Back Button */}
                            <button
                                onClick={() => setCurrentStep('filters')}
                                className="mb-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                            >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                                Back to filters
                            </button>

                            <PartnerSelection
                                selectedPartners={draft.partners || []}
                                onSelectionChange={(partners) => setDraft(prev => ({ ...prev, partners }))}
                            />

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={handleCreateCampaign}
                                    disabled={saving}
                                    className="h-11 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow shadow-slate-900/20 transition-all whitespace-nowrap"
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
                            {/* Minimal Title - Fades out when searching to reduce noise */}
                            <div className={cn(
                                "text-center transition-all duration-500 overflow-hidden",
                                isLayoutExpanded ? "h-0 opacity-0 mb-0" : "h-auto opacity-100 mb-8"
                            )}>
                                <h2 className="text-base font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                    Describe your ideal company profile.
                                </h2>
                            </div>

                            {/* Search Container */}
                            <div ref={containerRef} className={cn(
                                "relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 overflow-visible z-20 p-2",
                                isFocused
                                    ? "border-blue-500 shadow-sm" // Clean single border wrapper
                                    : "border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/20"
                            )}>

                                <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
                                    {/* Filter Pills */}
                                    {hasFilters && (
                                        <div className="px-2 flex flex-wrap gap-2 mb-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                                            {draft.filters.map(filter => (
                                                <span
                                                    key={filter.id}
                                                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 font-medium"
                                                >
                                                    {filter.displayLabel}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFilter(filter.id)}
                                                        className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input Area */}
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        placeholder="Search by industry, location, size, or keywords..."
                                        className="w-full bg-transparent text-xl text-slate-900 dark:text-white placeholder:text-slate-400/80 font-medium px-4 py-2 min-h-[60px] outline-none border-none focus:ring-0 focus:outline-none resize-none rounded-lg font-sans"
                                    />

                                    {/* Bottom Toolbar */}
                                    <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                                        {/* Left: Filter Icons */}
                                        <div className="flex items-center gap-1">
                                            {FILTER_BUTTONS.map(filter => (
                                                <div key={filter.key} className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpenDropdown(openDropdown === filter.key ? null : filter.key)}
                                                        className={cn(
                                                            "p-2.5 rounded-xl transition-all duration-200 group",
                                                            openDropdown === filter.key
                                                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                        )}
                                                        title={filter.label}
                                                    >
                                                        <filter.icon className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2} />
                                                    </button>

                                                    {/* Dropdown */}
                                                    {openDropdown === filter.key && (
                                                        <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                                                            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                                                                Select {filter.label}
                                                            </div>
                                                            <div className="max-h-72 overflow-y-auto py-1 custom-scrollbar">
                                                                {filter.options.map(opt => (
                                                                    <button
                                                                        type="button"
                                                                        key={opt.label}
                                                                        onClick={() => addFilter({ id: crypto.randomUUID(), type: opt.type, value: opt.value, displayLabel: opt.label })}
                                                                        className="w-full px-4 py-3 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 group"
                                                                    >
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                                                                        {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Right: Search Button */}
                                        <button
                                            type="submit"
                                            disabled={!input.trim()}
                                            className={cn(
                                                "h-10 px-4 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium",
                                                input.trim()
                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 hover:scale-105 shadow-lg shadow-slate-900/20"
                                                    : "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                                            )}
                                        >
                                            <Search className="w-4 h-4" strokeWidth={2.5} />
                                            <span>Search</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Stats Card - Refined Layout with Integrated Button */}
                            <div className={cn(
                                "transition-all duration-700 ease-out",
                                hasResults ? "opacity-100 translate-y-0 mt-6" : "opacity-0 translate-y-10 mt-0 pointer-events-none"
                            )}>
                                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-800/60 p-1 shadow-sm">
                                    <div className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50">
                                        <button
                                            onClick={() => setShowCompanyList(!showCompanyList)}
                                            className="flex-1 flex items-center gap-4 hover:opacity-80 transition-opacity text-left group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                            </div>

                                            <div>
                                                <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {loadingCompanies ? '...' : stats.count} companies
                                                    <ChevronDown className={cn(
                                                        "w-4 h-4 text-slate-400 transition-transform duration-300",
                                                        showCompanyList && "rotate-180"
                                                    )} />
                                                </div>
                                                {stats.count > 0 && (
                                                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                                        <span>{stats.totalEmployees.toLocaleString()} employees</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span>{stats.countries} countries</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Primary Action - Always Visible */}
                                        {hasFilters && stats.count > 0 && (
                                            <Button
                                                onClick={handleMainAction}
                                                disabled={saving}
                                                className="h-11 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow shadow-slate-900/20 transition-all whitespace-nowrap"
                                            >
                                                {saving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    "Next: Assign Partners"
                                                )}
                                                {!saving && <ArrowRight className="w-4 h-4 ml-2 opacity-50" />}
                                            </Button>
                                        )}
                                    </div>

                                    {/* Expandable Company List - Detached */}
                                    {showCompanyList && (
                                        <div className="mt-2 text-slate-600 dark:text-slate-400 animate-in slide-in-from-top-4 fade-in duration-300 origin-top">
                                            <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl overflow-hidden backdrop-blur-sm">
                                                {matchingCompanies.slice(0, 10).map(company => (
                                                    <CompanyRowCompact
                                                        key={company.id}
                                                        name={company.name}
                                                        domain={company.domain}
                                                        logoUrl={company.logo_url}
                                                        logoBase64={company.logo_base64}
                                                        industry={company.industry}
                                                        employeeCount={company.employee_count}
                                                    />
                                                ))}
                                                {matchingCompanies.length > 10 && (
                                                    <div className="px-5 py-4 text-sm font-medium text-center text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                                                        +{matchingCompanies.length - 10} more companies match your criteria
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>
        </div>
    );
}
