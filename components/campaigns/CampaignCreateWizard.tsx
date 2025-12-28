'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign, getCompanies, getProductCandidates } from '@/lib/api';
import type { CampaignFilterUI, ProductSummary, Partner, CompanyFilters, CompanySummary, CompanySummaryWithFit } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    Check,
    ChevronRight,
    ChevronLeft,
    Filter,
    Users,
    Loader2,
    Search,
    Building2,
    MapPin,
    Globe,
    Plus,
    X,
    FileText,
    Package,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DEFAULT_CAMPAIGN_PARTNERS } from '@/components/partners/mockPartners';
import { CompanyRowCompact } from './CompanyRowCompact';
import { AccountDetail } from '@/components/accounts';

interface CampaignCreateWizardProps {
    products: ProductSummary[];
    preselectedProductId?: number | null;
}

type Step = 'details' | 'filters' | 'partners';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'details', label: 'Campaign Details', icon: <FileText className="w-4 h-4" /> },
    { id: 'filters', label: 'Define Audience', icon: <Filter className="w-4 h-4" /> },
    { id: 'partners', label: 'Assign Partners', icon: <Users className="w-4 h-4" /> },
];

const FILTER_OPTIONS: { type: CampaignFilterUI['type']; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { type: 'natural_query', label: 'Search Query', icon: <Search className="w-4 h-4" />, placeholder: 'e.g., "B2B SaaS companies"' },
    { type: 'industry', label: 'Industry', icon: <Building2 className="w-4 h-4" />, placeholder: 'e.g., Technology, Healthcare' },
    { type: 'size_min', label: 'Min Employees', icon: <Users className="w-4 h-4" />, placeholder: 'e.g., 100' },
    { type: 'size_max', label: 'Max Employees', icon: <Users className="w-4 h-4" />, placeholder: 'e.g., 5000' },
    { type: 'country', label: 'Country', icon: <MapPin className="w-4 h-4" />, placeholder: 'e.g., United States' },
    { type: 'domain_list', label: 'Specific Domains', icon: <Globe className="w-4 h-4" />, placeholder: 'e.g., acme.com, example.com' },
];

// Convert CampaignFilterUI array to CompanyFilters for API
function filtersToCompanyFilters(filters: CampaignFilterUI[], productId?: number | null): CompanyFilters {
    const companyFilters: CompanyFilters = {
        page: 1,
        page_size: 10,
    };

    if (productId) {
        companyFilters.product_id = productId;
    }

    for (const filter of filters) {
        switch (filter.type) {
            case 'industry':
                companyFilters.industry = filter.value;
                break;
            case 'country':
                companyFilters.country = filter.value;
                break;
            case 'size_min':
                companyFilters.min_employees = parseInt(filter.value) || undefined;
                break;
            case 'size_max':
                companyFilters.max_employees = parseInt(filter.value) || undefined;
                break;
            // natural_query and domain_list handled separately
        }
    }

    return companyFilters;
}

export function CampaignCreateWizard({
    products,
    preselectedProductId,
}: CampaignCreateWizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>('details');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Details
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [productId, setProductId] = useState<number | null>(preselectedProductId || null);

    // Step 2: Filters
    const [filters, setFilters] = useState<CampaignFilterUI[]>([]);
    const [addingFilter, setAddingFilter] = useState(false);
    const [selectedFilterType, setSelectedFilterType] = useState<CampaignFilterUI['type'] | null>(null);
    const [filterValue, setFilterValue] = useState('');

    // Company preview
    const [previewCompanies, setPreviewCompanies] = useState<(CompanySummary | CompanySummaryWithFit)[]>([]);
    const [previewTotal, setPreviewTotal] = useState<number>(0);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Account detail sheet
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const handleCompanyClick = (domain: string) => {
        setSelectedDomain(domain);
        setDetailOpen(true);
    };

    // Step 3: Partners
    const [partners] = useState<Partner[]>(DEFAULT_CAMPAIGN_PARTNERS);
    const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<string>>(new Set());

    // Fetch company preview when filters change
    const fetchCompanyPreview = useCallback(async () => {
        if (filters.length === 0) {
            setPreviewCompanies([]);
            setPreviewTotal(0);
            return;
        }

        setLoadingPreview(true);
        try {
            const companyFilters = filtersToCompanyFilters(filters, productId);
            const result = await getCompanies(companyFilters);
            setPreviewCompanies(result.items);
            setPreviewTotal(result.total);
        } catch (err) {
            console.error('Failed to fetch company preview:', err);
            setPreviewCompanies([]);
            setPreviewTotal(0);
        } finally {
            setLoadingPreview(false);
        }
    }, [filters, productId]);

    useEffect(() => {
        // Debounce the preview fetch
        const timer = setTimeout(() => {
            if (currentStep === 'filters') {
                fetchCompanyPreview();
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, productId, currentStep, fetchCompanyPreview]);

    const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

    const canProceedFromDetails = name.trim() && productId;
    const canProceedFromFilters = filters.length > 0;

    const handleAddFilter = () => {
        if (!selectedFilterType || !filterValue.trim()) return;

        const newFilter: CampaignFilterUI = {
            id: `${selectedFilterType}-${Date.now()}`,
            type: selectedFilterType,
            value: filterValue.trim(),
            displayLabel: `${FILTER_OPTIONS.find(o => o.type === selectedFilterType)?.label}: ${filterValue.trim()}`,
        };

        setFilters([...filters, newFilter]);
        setSelectedFilterType(null);
        setFilterValue('');
        setAddingFilter(false);
    };

    const handleRemoveFilter = (id: string) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    const handleTogglePartner = (partnerId: string) => {
        const newSelected = new Set(selectedPartnerIds);
        if (newSelected.has(partnerId)) {
            newSelected.delete(partnerId);
        } else {
            newSelected.add(partnerId);
        }
        setSelectedPartnerIds(newSelected);
    };

    const handleNext = () => {
        if (currentStep === 'details' && canProceedFromDetails) {
            setCurrentStep('filters');
        } else if (currentStep === 'filters' && canProceedFromFilters) {
            setCurrentStep('partners');
        }
    };

    const handleBack = () => {
        if (currentStep === 'filters') {
            setCurrentStep('details');
        } else if (currentStep === 'partners') {
            setCurrentStep('filters');
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || !productId || filters.length === 0) return;

        setCreating(true);
        setError(null);

        try {
            const campaign = await createCampaign({
                name: name.trim(),
                description: description.trim() || undefined,
                target_product_id: productId,
                target_criteria: { filters },
            });

            // TODO: Save selected partners if needed
            router.push(`/campaigns/${campaign.slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create campaign');
            console.error('Error creating campaign:', err);
            setCreating(false);
        }
    };

    const currentOption = FILTER_OPTIONS.find(o => o.type === selectedFilterType);
    const selectedProduct = products.find(p => p.id === productId);

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Create New Campaign
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Set up your campaign in a few simple steps
                </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mb-12">
                {STEPS.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <StepIndicator
                            step={index + 1}
                            label={step.label}
                            icon={step.icon}
                            isActive={currentStep === step.id}
                            isComplete={currentStepIndex > index}
                        />
                        {index < STEPS.length - 1 && (
                            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-2" />
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Details */}
            {currentStep === 'details' && (
                <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                            Campaign Details
                        </h2>

                        <div className="space-y-5">
                            {/* Product */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Product <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={productId?.toString() || ''}
                                    onValueChange={(value) => setProductId(value ? parseInt(value) : null)}
                                >
                                    <SelectTrigger className="w-full h-11">
                                        <SelectValue>
                                            {selectedProduct ? (
                                                <span className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                    {selectedProduct.name}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">Select a product</span>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                    {product.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">
                                    The product this campaign will promote
                                </p>
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Campaign Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Q1 Enterprise Outreach"
                                    className="h-11"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description <span className="text-slate-400 text-xs">(optional)</span>
                                </label>
                                <Input
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of campaign goals"
                                    className="h-11"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleNext}
                            disabled={!canProceedFromDetails}
                            className="gap-2 h-11 px-6"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Filters */}
            {currentStep === 'filters' && (
                <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Who are you targeting?
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Add filters to define your ideal customer profile. Companies matching these criteria will be included in your campaign.
                        </p>

                        {/* Current Filters */}
                        {filters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {filters.map(filter => (
                                    <div
                                        key={filter.id}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm"
                                    >
                                        <span className="text-blue-700 dark:text-blue-300 font-medium">
                                            {filter.displayLabel}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveFilter(filter.id)}
                                            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Filter UI */}
                        {!addingFilter ? (
                            <Button
                                variant="outline"
                                onClick={() => setAddingFilter(true)}
                                className="gap-2 border-dashed"
                            >
                                <Plus className="w-4 h-4" />
                                Add Filter
                            </Button>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4">
                                {!selectedFilterType ? (
                                    <>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Choose filter type:
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FILTER_OPTIONS.map(option => (
                                                <button
                                                    key={option.type}
                                                    onClick={() => setSelectedFilterType(option.type)}
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors text-left"
                                                >
                                                    <span className="text-slate-400">{option.icon}</span>
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        {option.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setAddingFilter(false)}
                                            className="mt-2"
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-slate-400">{currentOption?.icon}</span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {currentOption?.label}
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={filterValue}
                                            onChange={(e) => setFilterValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddFilter()}
                                            placeholder={currentOption?.placeholder}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            autoFocus
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedFilterType(null);
                                                    setFilterValue('');
                                                }}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleAddFilter}
                                                disabled={!filterValue.trim()}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Company Preview */}
                    {filters.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                        Matching Companies
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {loadingPreview ? 'Searching...' : `${previewTotal} companies match your filters`}
                                    </p>
                                </div>
                                {loadingPreview && (
                                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                )}
                            </div>

                            {previewCompanies.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 -mx-2">
                                    {previewCompanies.slice(0, 5).map((company) => (
                                        <CompanyRowCompact
                                            key={company.domain}
                                            name={company.name}
                                            domain={company.domain}
                                            industry={company.industry}
                                            employeeCount={company.employee_count}
                                            hqCountry={company.hq_country}
                                            fitScore={'combined_score' in company ? company.combined_score : null}
                                            logoBase64={company.logo_base64}
                                            onClick={() => handleCompanyClick(company.domain)}
                                            className="cursor-pointer"
                                        />
                                    ))}
                                    {previewTotal > 5 && (
                                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
                                            + {previewTotal - 5} more companies
                                        </p>
                                    )}
                                </div>
                            ) : !loadingPreview && (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No companies match these filters</p>
                                    <p className="text-xs mt-1">Try adjusting your criteria</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button variant="ghost" onClick={handleBack} className="gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={!canProceedFromFilters}
                            className="gap-2 h-11 px-6"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {filters.length === 0 && (
                        <p className="text-center text-sm text-slate-400">
                            Add at least one filter to continue
                        </p>
                    )}
                </div>
            )}

            {/* Step 3: Partners */}
            {currentStep === 'partners' && (
                <div className="space-y-6 animate-in fade-in-50 slide-in-from-right-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            Select Partners
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Choose partners who will help you reach these accounts. This step is optional - you can assign partners later.
                        </p>

                        {/* Summary */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-4 py-3 mb-6">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">
                                    Campaign: <span className="font-semibold text-slate-900 dark:text-white">{name}</span>
                                </span>
                                {selectedPartnerIds.size > 0 && (
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                        {selectedPartnerIds.size} partner{selectedPartnerIds.size > 1 ? 's' : ''} selected
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Partner Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {partners.map(partner => (
                                <div
                                    key={partner.id}
                                    onClick={() => handleTogglePartner(partner.id)}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl border-2 p-4 transition-all",
                                        selectedPartnerIds.has(partner.id)
                                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center",
                                            selectedPartnerIds.has(partner.id)
                                                ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                        )}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {partner.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {partner.description}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedPartnerIds.has(partner.id) && (
                                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button variant="ghost" onClick={handleBack} className="gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={creating}
                            className="gap-2 h-11 px-6"
                        >
                            {creating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Create Campaign
                        </Button>
                    </div>
                </div>
            )}

            {/* Account Detail Sheet */}
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

function StepIndicator({
    step,
    label,
    icon,
    isActive,
    isComplete,
}: {
    step: number;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    isComplete: boolean;
}) {
    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors",
            isActive && "bg-blue-50 dark:bg-blue-900/20",
            isComplete && "bg-green-50 dark:bg-green-900/20"
        )}>
            <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                isActive && "bg-blue-500 text-white",
                isComplete && "bg-green-500 text-white",
                !isActive && !isComplete && "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            )}>
                {isComplete ? <Check className="w-3.5 h-3.5" /> : step}
            </div>
            <span className={cn(
                "text-sm font-medium hidden sm:inline",
                isActive && "text-blue-700 dark:text-blue-300",
                isComplete && "text-green-700 dark:text-green-300",
                !isActive && !isComplete && "text-slate-500 dark:text-slate-400"
            )}>
                {label}
            </span>
        </div>
    );
}
