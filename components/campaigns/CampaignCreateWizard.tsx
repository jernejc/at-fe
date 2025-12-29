'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign, getCompanies } from '@/lib/api';
import type { CampaignFilterUI, ProductSummary, Partner, CompanyFilters, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Check,
    ChevronDown,
    ChevronRight,
    Users,
    Loader2,
    Search,
    Building2,
    MapPin,
    X,
    ArrowLeft,
    Star,
    Briefcase,
    Cpu,
    ShoppingBag,
    Gauge,
    Wand2,
    MousePointerClick,
    Clock,
} from 'lucide-react';
import { DEFAULT_CAMPAIGN_PARTNERS } from '@/components/partners/mockPartners';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AccountDetail } from '@/components/accounts';

interface CampaignCreateWizardProps {
    products: ProductSummary[];
    preselectedProductId?: number | null;
}

type Step = 'details' | 'audience' | 'review';

function filtersToCompanyFilters(filters: CampaignFilterUI[], productId?: number | null): CompanyFilters {
    const companyFilters: CompanyFilters = { page: 1, page_size: 20 };
    if (productId) companyFilters.product_id = productId;

    for (const filter of filters) {
        switch (filter.type) {
            case 'industry': companyFilters.industry = filter.value; break;
            case 'country': companyFilters.country = filter.value; break;
            case 'size_min': companyFilters.min_employees = parseInt(filter.value) || undefined; break;
            case 'size_max': companyFilters.max_employees = parseInt(filter.value) || undefined; break;
        }
    }
    return companyFilters;
}

export function CampaignCreateWizard({ products, preselectedProductId }: CampaignCreateWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('details');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Details
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [productId, setProductId] = useState<number | null>(preselectedProductId || null);
    const [productOpen, setProductOpen] = useState(false);

    // Step 2: Audience
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<CampaignFilterUI[]>([]);
    const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
    const [filterInputValue, setFilterInputValue] = useState('');

    // Company preview
    const [previewCompanies, setPreviewCompanies] = useState<(CompanySummary | CompanySummaryWithFit)[]>([]);
    const [previewTotal, setPreviewTotal] = useState<number>(0);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [showCount, setShowCount] = useState(5);

    // Account detail
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Step 3: Partners
    const [partners] = useState<Partner[]>(DEFAULT_CAMPAIGN_PARTNERS);
    const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<string>>(new Set());
    const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual' | 'skip'>('auto');

    const selectedProduct = products.find(p => p.id === productId);
    const canProceedFromDetails = name.trim() && productId;
    const hasAudience = searchQuery.trim() || filters.length > 0;

    const fetchCompanyPreview = useCallback(async () => {
        if (!hasAudience) {
            setPreviewCompanies([]);
            setPreviewTotal(0);
            return;
        }
        setLoadingPreview(true);
        try {
            const result = await getCompanies(filtersToCompanyFilters(filters, productId));
            setPreviewCompanies(result.items);
            setPreviewTotal(result.total);
        } catch {
            setPreviewCompanies([]);
            setPreviewTotal(0);
        } finally {
            setLoadingPreview(false);
        }
    }, [filters, productId, hasAudience]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentStep === 'audience') fetchCompanyPreview();
        }, 400);
        return () => clearTimeout(timer);
    }, [filters, productId, currentStep, fetchCompanyPreview, searchQuery]);

    const addFilter = (type: string, value: string) => {
        if (!value.trim()) return;
        const labels: Record<string, string> = {
            industry: 'Industry',
            country: 'Country',
            size_min: 'Min employees',
            size_max: 'Max employees',
            fit_min: 'Min fit score',
        };
        const newFilter: CampaignFilterUI = {
            id: `${type}-${Date.now()}`,
            type: type as CampaignFilterUI['type'],
            value: value.trim(),
            displayLabel: `${labels[type] || type}: ${value.trim()}`,
        };
        setFilters([...filters, newFilter]);
        setActiveFilterType(null);
        setFilterInputValue('');
    };

    const handleCreate = async () => {
        if (!name.trim() || !productId) return;
        setCreating(true);
        setError(null);

        const allFilters = searchQuery.trim()
            ? [{ id: 'search', type: 'natural_query' as const, value: searchQuery, displayLabel: searchQuery }, ...filters]
            : filters;

        try {
            const campaign = await createCampaign({
                name: name.trim(),
                description: description.trim() || undefined,
                target_product_id: productId,
                target_criteria: { filters: allFilters },
            });
            router.push(`/campaigns/${campaign.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create campaign');
            setCreating(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
            {/* Header with Breadcrumb Steps */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/campaigns')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    {/* Breadcrumb Steps */}
                    <div className="flex items-center">
                        {[
                            { id: 'details', label: 'Details' },
                            { id: 'audience', label: 'Audience' },
                            { id: 'review', label: 'Partners' },
                        ].map((step, index, arr) => {
                            const stepIndex = arr.findIndex(s => s.id === currentStep);
                            const isComplete = index < stepIndex;
                            const isCurrent = index === stepIndex;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <button
                                        onClick={() => {
                                            if (isComplete) setCurrentStep(step.id as Step);
                                        }}
                                        disabled={!isComplete}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors",
                                            isCurrent && "font-medium text-slate-900 dark:text-white",
                                            isComplete && "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer",
                                            !isCurrent && !isComplete && "text-slate-400 cursor-default"
                                        )}
                                    >
                                        {isComplete && <Check className="w-3.5 h-3.5 text-slate-400" />}
                                        {step.label}
                                    </button>
                                    {index < arr.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-1" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="w-9" /> {/* Spacer */}
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Step 1: Details */}
                {currentStep === 'details' && (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Campaign details
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Name your campaign and select a product
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Product</label>
                                <div className="relative">
                                    <button
                                        onClick={() => setProductOpen(!productOpen)}
                                        className="w-full h-10 px-3 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                    >
                                        <span className={selectedProduct ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                                            {selectedProduct?.name || "Select product"}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </button>
                                    {productOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setProductOpen(false)} />
                                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1">
                                                {products.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => { setProductId(p.id); setProductOpen(false); }}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50",
                                                            productId === p.id && "bg-slate-100 dark:bg-slate-700"
                                                        )}
                                                    >
                                                        {p.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Campaign name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Q1 Enterprise Outreach"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description <span className="text-slate-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentStep('audience')}
                            disabled={!canProceedFromDetails}
                            className="w-full h-10 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Step 2: Audience */}
                {currentStep === 'audience' && (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                                Define audience
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">
                                Search for companies or add filters
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search companies... e.g., 'B2B SaaS in healthcare'"
                                className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Active Filters */}
                        {filters.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                {filters.map(f => (
                                    <span key={f.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm">
                                        {f.displayLabel}
                                        <button onClick={() => setFilters(filters.filter(x => x.id !== f.id))} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Add Filters */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Add filter:</span>
                            <div className="flex items-center gap-2">
                                {['industry', 'country', 'size_min', 'fit_min'].map(type => {
                                    const config: Record<string, { label: string; icon: React.ReactNode; placeholder: string }> = {
                                        industry: { label: 'Industry', icon: <Building2 className="w-3.5 h-3.5" />, placeholder: 'e.g., Technology' },
                                        country: { label: 'Country', icon: <MapPin className="w-3.5 h-3.5" />, placeholder: 'e.g., United States' },
                                        size_min: { label: 'Min Size', icon: <Users className="w-3.5 h-3.5" />, placeholder: 'e.g., 100' },
                                        fit_min: { label: 'Min Fit', icon: <Star className="w-3.5 h-3.5" />, placeholder: 'e.g., 70' },
                                    };
                                    const c = config[type];
                                    const isActive = activeFilterType === type;

                                    return (
                                        <div key={type} className="relative">
                                            <button
                                                onClick={() => setActiveFilterType(isActive ? null : type)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                                                    isActive
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                                                )}
                                            >
                                                {c.icon}
                                                {c.label}
                                            </button>

                                            {isActive && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => { setActiveFilterType(null); setFilterInputValue(''); }} />
                                                    <div className="absolute z-20 top-full left-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 min-w-[200px]">
                                                        <input
                                                            autoFocus
                                                            value={filterInputValue}
                                                            onChange={(e) => setFilterInputValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && filterInputValue.trim()) {
                                                                    addFilter(type, filterInputValue);
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    setActiveFilterType(null);
                                                                    setFilterInputValue('');
                                                                }
                                                            }}
                                                            placeholder={c.placeholder}
                                                            className="w-full h-9 px-3 rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <div className="flex justify-end mt-2">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => addFilter(type, filterInputValue)}
                                                                disabled={!filterInputValue.trim()}
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Continue Button */}
                        <button
                            onClick={() => setCurrentStep('review')}
                            disabled={!hasAudience}
                            className="w-full h-10 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                        >
                            Continue with {previewTotal.toLocaleString()} companies
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Company Preview */}
                        {hasAudience && (
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Preview
                                    </span>
                                    {loadingPreview ? (
                                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                                    ) : (
                                        <span className="text-sm text-slate-500">{previewTotal.toLocaleString()} companies</span>
                                    )}
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    {previewCompanies.length > 0 ? (
                                        <>
                                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {previewCompanies.slice(0, showCount).map((company) => (
                                                    <CompanyRowCompact
                                                        key={company.domain}
                                                        name={company.name}
                                                        domain={company.domain}
                                                        industry={company.industry}
                                                        fitScore={'combined_score' in company ? company.combined_score : null}
                                                        logoBase64={company.logo_base64}
                                                        onClick={() => { setSelectedDomain(company.domain); setDetailOpen(true); }}
                                                        className="cursor-pointer"
                                                    />
                                                ))}
                                            </div>
                                            {previewTotal > showCount && (
                                                <button
                                                    onClick={() => setShowCount(showCount + 10)}
                                                    className="w-full px-4 py-2.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    Show more
                                                </button>
                                            )}
                                        </>
                                    ) : !loadingPreview && (
                                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                                            No companies match
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Partners */}
                {currentStep === 'review' && (
                    <div className="max-w-xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Assign partners</h1>
                            <p className="text-sm text-slate-500 mt-1">Choose partners and how to distribute companies</p>
                        </div>

                        {/* Assignment Mode - Card options */}
                        <div className="space-y-2 pb-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assignment mode</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        id: 'auto',
                                        label: 'Auto-assign',
                                        description: 'AI distributes accounts based on partner expertise and capacity',
                                        icon: Wand2
                                    },
                                    {
                                        id: 'manual',
                                        label: 'Manual',
                                        description: 'You assign accounts to partners after campaign creation',
                                        icon: MousePointerClick
                                    },
                                    {
                                        id: 'skip',
                                        label: 'Skip for now',
                                        description: 'Create campaign without partner assignments',
                                        icon: Clock
                                    },
                                ].map(mode => {
                                    const isSelected = assignmentMode === mode.id;
                                    const Icon = mode.icon;
                                    return (
                                        <button
                                            key={mode.id}
                                            onClick={() => setAssignmentMode(mode.id as 'auto' | 'manual' | 'skip')}
                                            className={cn(
                                                "flex flex-col items-center text-center p-4 rounded-xl border transition-all",
                                                isSelected
                                                    ? "bg-slate-50 dark:bg-slate-800/50 border-slate-900 dark:border-slate-400 ring-1 ring-slate-900 dark:ring-slate-400"
                                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors",
                                                isSelected
                                                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "text-sm font-medium transition-colors",
                                                isSelected
                                                    ? "text-slate-900 dark:text-white"
                                                    : "text-slate-700 dark:text-slate-300"
                                            )}>
                                                {mode.label}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                                                {mode.description}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Partners List */}
                        {assignmentMode !== 'skip' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Select partners {selectedPartnerIds.size > 0 && <span className="text-slate-400 font-normal">({selectedPartnerIds.size} selected)</span>}
                                    </label>
                                    <button
                                        onClick={() => {
                                            if (selectedPartnerIds.size === partners.length) {
                                                setSelectedPartnerIds(new Set());
                                            } else {
                                                setSelectedPartnerIds(new Set(partners.map(p => p.id)));
                                            }
                                        }}
                                        className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline transition-colors"
                                    >
                                        {selectedPartnerIds.size === partners.length ? 'Deselect all' : 'Select all'}
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {partners.map((partner) => {
                                        const isSelected = selectedPartnerIds.has(partner.id);
                                        const TypeIcon = partner.type === 'consulting' ? Briefcase : partner.type === 'technology' ? Cpu : ShoppingBag;
                                        const typeLabel = partner.type === 'consulting' ? 'Consulting' : partner.type === 'technology' ? 'Technology' : 'Reseller';

                                        return (
                                            <button
                                                key={partner.id}
                                                onClick={() => {
                                                    const next = new Set(selectedPartnerIds);
                                                    if (isSelected) next.delete(partner.id);
                                                    else next.add(partner.id);
                                                    setSelectedPartnerIds(next);
                                                }}
                                                className={cn(
                                                    "w-full rounded-xl border p-4 text-left transition-all duration-150",
                                                    isSelected
                                                        ? "bg-slate-50 dark:bg-slate-800/50 border-slate-900 dark:border-slate-400 ring-1 ring-slate-900 dark:ring-slate-400"
                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Checkbox */}
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                        isSelected
                                                            ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white"
                                                            : "border-slate-300 dark:border-slate-600"
                                                    )}>
                                                        {isSelected && <Check className="w-3 h-3 text-white dark:text-slate-900" />}
                                                    </div>

                                                    {/* Logo */}
                                                    <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {partner.logo_url ? (
                                                            <img
                                                                src={partner.logo_url}
                                                                alt=""
                                                                className="w-6 h-6 object-contain"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                                {partner.name.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Partner Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                                {partner.name}
                                                            </span>
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                                                partner.type === 'consulting' && "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
                                                                partner.type === 'technology' && "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
                                                                partner.type === 'reseller' && "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                                                            )}>
                                                                <TypeIcon className="w-3 h-3" />
                                                                {typeLabel}
                                                            </span>
                                                            {partner.match_score && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                                    <Gauge className="w-3 h-3" />
                                                                    {partner.match_score}% match
                                                                </span>
                                                            )}
                                                        </div>
                                                        {partner.description && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                                {partner.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 dark:text-slate-500">
                                                            {partner.industries && partner.industries.length > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <Building2 className="w-3.5 h-3.5" />
                                                                    {partner.industries.slice(0, 2).join(', ')}
                                                                </span>
                                                            )}
                                                            {partner.capacity && (
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3.5 h-3.5" />
                                                                    {partner.capacity - (partner.assigned_count || 0)} available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="w-full h-11 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Create Campaign
                        </button>
                    </div>
                )}
            </div>

            {selectedDomain && (
                <AccountDetail domain={selectedDomain} open={detailOpen} onClose={() => setDetailOpen(false)} />
            )}
        </div>
    );
}
