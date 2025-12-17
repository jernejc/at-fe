'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { createCampaign, getCompanies } from '@/lib/api';
import type { CampaignFilterUI, CampaignDraft } from '@/lib/schemas/campaign';
import type { CompanySummary } from '@/lib/schemas';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { Loader2, Search, ChevronDown, ChevronUp, X, Pencil, Check, Building2, Users, MapPin, Briefcase, Globe, ArrowRight } from 'lucide-react';

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
    const [saving, setSaving] = useState(false);

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

    return (
        <div className="h-screen bg-[#F8F9FB] dark:bg-slate-950 overflow-hidden flex flex-col font-sans">
            <Header />

            <main className="flex-1 flex flex-col justify-center pb-[10vh]">
                <div className="w-full max-w-2xl mx-auto px-6">

                    {/* Minimal Title */}
                    <div className="mb-6 text-center">
                        <h1 className="text-xl font-medium text-slate-900 dark:text-white">New Campaign</h1>
                    </div>

                    {/* Search Container - Centered Focus */}
                    <div ref={containerRef} className={cn(
                        "relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 overflow-visible z-20 p-2",
                        isFocused && "shadow-[0_0_0_2px_rgba(59,130,246,0.1)] border-slate-300 dark:border-slate-700"
                    )}>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
                            {/* Filter Pills */}
                            {hasFilters && (
                                <div className="px-2 flex flex-wrap gap-2 mb-1">
                                    {draft.filters.map(filter => (
                                        <span
                                            key={filter.id}
                                            className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                                        >
                                            {filter.displayLabel}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFilter(filter.id)}
                                                className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
                                className="w-full bg-transparent text-lg text-slate-900 dark:text-white placeholder:text-slate-400 font-medium px-4 py-3 min-h-[60px] outline-none resize-none rounded-lg font-sans"
                            />

                            {/* Bottom Toolbar */}
                            <div className="flex items-center justify-between px-2 pt-2">
                                {/* Left: Filter Icons */}
                                <div className="flex items-center gap-1">
                                    {FILTER_BUTTONS.map(filter => (
                                        <div key={filter.key} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setOpenDropdown(openDropdown === filter.key ? null : filter.key)}
                                                className={cn(
                                                    "p-2.5 rounded-lg transition-all",
                                                    openDropdown === filter.key
                                                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                )}
                                                title={filter.label}
                                            >
                                                <filter.icon className="w-5 h-5" strokeWidth={2} />
                                            </button>

                                            {/* Dropdown */}
                                            {openDropdown === filter.key && (
                                                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                                                    <div className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                                                        Select {filter.label}
                                                    </div>
                                                    <div className="max-h-64 overflow-y-auto py-1">
                                                        {filter.options.map(opt => (
                                                            <button
                                                                type="button"
                                                                key={opt.label}
                                                                onClick={() => addFilter({ id: crypto.randomUUID(), type: opt.type, value: opt.value, displayLabel: opt.label })}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                                                            >
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
                                        "p-2.5 rounded-xl transition-all duration-200 flex items-center gap-2",
                                        input.trim()
                                            ? "bg-stone-400 text-white hover:bg-stone-500 shadow-sm"
                                            : "bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                                    )}
                                >
                                    <Search className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Stats Card - Refined Layout with Integrated Button */}
                    {(hasFilters || !loadingCompanies) && (
                        <div className="mt-8 animate-in fade-in-50 duration-500">
                            {/* Main Card with Action */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setShowCompanyList(!showCompanyList)}
                                    className="flex-1 flex items-center gap-4 hover:opacity-80 transition-opacity text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                                    </div>

                                    <div>
                                        <div className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            {loadingCompanies ? '...' : stats.count} companies
                                            <ChevronDown className={cn(
                                                "w-4 h-4 text-slate-400 transition-transform duration-200",
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
                                        onClick={handleCreateCampaign}
                                        disabled={saving}
                                        className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Start Campaign"}
                                        {!saving && <ArrowRight className="w-4 h-4 ml-2 opacity-50" />}
                                    </Button>
                                )}
                            </div>

                            {/* Expandable Company List - Detached */}
                            {showCompanyList && (
                                <div className="mt-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    {matchingCompanies.slice(0, 10).map(company => (
                                        <div key={company.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-slate-900 dark:text-white text-sm truncate">{company.name}</div>
                                                <div className="text-xs text-slate-500 truncate mt-0.5">{company.domain}</div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500 shrink-0 ml-4">
                                                {company.industry && (
                                                    <span className="truncate max-w-[100px] text-right">
                                                        {company.industry}
                                                    </span>
                                                )}
                                                {company.employee_count && (
                                                    <span className="tabular-nums pl-4 w-[70px] text-right">
                                                        {company.employee_count.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {matchingCompanies.length > 10 && (
                                        <div className="px-5 py-3 text-xs text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                                            +{matchingCompanies.length - 10} more
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
