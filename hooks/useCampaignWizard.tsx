'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaign, getCompanies, getPartners, bulkAssignPartners, bulkAssignCompaniesToPartner, suggestPartnersForCompanies } from '@/lib/api';
import type { CampaignFilterUI, ProductSummary, Partner, CompanyFilters, CompanySummary, CompanySummaryWithFit, PartnerSuggestion, WSCompanyResult, WSPartnerSuggestion } from '@/lib/schemas';
import { useAgenticSearch } from '@/hooks/useAgenticSearch';
import { Check, Loader2, Package } from 'lucide-react';

export type ConversationStep =
    | 'welcome'
    | 'product'
    | 'name'
    | 'audience'
    | 'preview'
    | 'partners'
    | 'review'
    | 'creating';

export interface Message {
    id: string;
    type: 'system' | 'user';
    content: React.ReactNode;
    timestamp: Date;
}

function filtersToCompanyFilters(filters: CampaignFilterUI[], productId?: number | null): CompanyFilters {
    const companyFilters: CompanyFilters = {
        page: 1,
        page_size: 20,
        sort_by: 'combined_score',
        sort_order: 'desc'
    };
    if (productId) companyFilters.product_id = productId;

    for (const filter of filters) {
        switch (filter.type) {
            case 'industry': companyFilters.industry = filter.value; break;
            case 'country': companyFilters.country = filter.value; break;
            case 'size_min': companyFilters.min_employees = parseInt(filter.value) || undefined; break;
            case 'size_max': companyFilters.max_employees = parseInt(filter.value) || undefined; break;
            case 'fit_min': companyFilters.min_fit_score = parseInt(filter.value) || undefined; break;
        }
    }
    return companyFilters;
}

export function useCampaignWizard(products: ProductSummary[], preselectedProductId?: number | null) {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Conversation state
    const [currentStep, setCurrentStep] = useState<ConversationStep>('welcome');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Campaign data
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [productId, setProductId] = useState<number | null>(preselectedProductId || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<CampaignFilterUI[]>([]);
    const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
    const [filterInputValue, setFilterInputValue] = useState('');

    // Preview data
    const [previewCompanies, setPreviewCompanies] = useState<(CompanySummary | CompanySummaryWithFit)[]>([]);
    const [previewTotal, setPreviewTotal] = useState<number>(0);
    const [loadingPreview, setLoadingPreview] = useState(false);

    // Account detail
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Partners
    const [partners, setPartners] = useState<Partner[]>([]);
    const [suggestedPartners, setSuggestedPartners] = useState<PartnerSuggestion[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<string>>(new Set());
    const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual' | 'skip'>('auto');

    // Agentic search
    const [useAgenticMode, setUseAgenticMode] = useState(true);
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const hasAutoSelectedRef = useRef(false);

    useEffect(() => {
        if (suggestedPartners.length > 0 && !hasAutoSelectedRef.current) {
            const next = new Set(selectedPartnerIds);
            suggestedPartners.forEach(p => next.add(p.partner.slug || String(p.partner.id)));
            setSelectedPartnerIds(next);
            hasAutoSelectedRef.current = true;
        }
    }, [suggestedPartners]);

    const {
        state: agenticState,
        search: triggerAgenticSearch,
        reset: resetAgenticSearch,
        isSearching: isAgenticSearching,
    } = useAgenticSearch({
        onComplete: (state) => {
            // Normalize score: if > 1, it's already 0-100; if <= 1, multiply by 100
            const normalizeScore = (score: number) => score > 1 ? Math.round(score) : Math.round(score * 100);

            // Convert WS companies to preview format
            const wsCompanies: (CompanySummary | CompanySummaryWithFit)[] = state.companies.map(c => ({
                id: c.company_id,
                domain: c.domain,
                name: c.name,
                description: c.description,
                industry: c.industry || null,
                logo_base64: c.logo_base64 || null,
                employee_count: c.employee_count || null,
                combined_score: normalizeScore(c.match_score),
                // Default values for required CompanySummary fields
                hq_city: null,
                hq_country: null,
                linkedin_id: null,
                rating_overall: null,
                logo_url: null,
                data_sources: ['agentic'],
                top_contact: null,
                updated_at: new Date().toISOString(),
            }));
            setPreviewCompanies(wsCompanies);
            setPreviewTotal(state.totalResults);

            // Convert WS partner suggestions
            if (state.partnerSuggestions.length > 0) {
                const wsSuggestions: PartnerSuggestion[] = state.partnerSuggestions.map(s => ({
                    partner: {
                        id: s.partner_id,
                        name: s.name,
                        slug: s.slug,
                        description: s.description,
                        status: 'active' as const,
                        logo_url: s.logo_url || null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    match_score: normalizeScore(s.match_score),
                    match_reasons: s.matched_interests.map(i => i.reasoning).filter(Boolean),
                    industry_overlap: s.matched_interests.map(i => i.interest),
                }));
                setSuggestedPartners(wsSuggestions);

                // Auto-select top 3
                if (wsSuggestions.length > 0) {
                    const topIds = wsSuggestions.slice(0, 3).map(s => s.partner.slug || String(s.partner.id));
                    setSelectedPartnerIds(new Set(topIds));
                }
            }
        },
    });

    const selectedProduct = products.find(p => p.id === productId);
    const hasAudience = searchQuery.trim() || filters.length > 0;

    // Derived state for agentic search
    const isAgenticPhaseActive = agenticState.phase !== 'idle' && agenticState.phase !== 'complete' && agenticState.phase !== 'error';
    const hasAgenticResults = agenticState.companies.length > 0 || agenticState.phase === 'complete';


    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, currentStep, agenticState.phase]);

    // Simulate typing delay then show content
    const addSystemMessage = useCallback((content: React.ReactNode, delay = 800) => {
        setIsTyping(true);
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: `msg-${Date.now()}`,
                    type: 'system',
                    content,
                    timestamp: new Date(),
                }]);
                resolve();
            }, delay);
        });
    }, []);

    const addUserMessage = useCallback((content: React.ReactNode) => {
        setMessages(prev => [...prev, {
            id: `msg-${Date.now()}`,
            type: 'user',
            content,
            timestamp: new Date(),
        }]);
    }, []);

    // Initialize conversation - use ref to prevent duplicate runs in StrictMode
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initConversation = async () => {
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white font-medium text-sm">
                        Let&apos;s create your campaign
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        I&apos;ll help you define your target audience and find the best partners. This should only take a minute.
                    </p>
                </div>,
                600
            );
            setCurrentStep('product');
        };
        initConversation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch company preview - uses agentic search for NL queries, REST for filters
    const fetchCompanyPreview = useCallback(async () => {
        if (!hasAudience) {
            setPreviewCompanies([]);
            setPreviewTotal(0);
            resetAgenticSearch();
            return;
        }

        // Use agentic search for natural language queries
        if (useAgenticMode && searchQuery.trim()) {
            // Clear previous results when starting new search
            setPreviewCompanies([]);
            setPreviewTotal(0);
            triggerAgenticSearch(searchQuery, {
                entity_types: ['companies', 'partners'],
                limit: 20,
                include_partner_suggestions: true,
                partner_suggestion_limit: 5,
                product_id: productId,
            });
            return;
        }

        // Fallback to REST API for filter-only queries
        setLoadingPreview(true);
        try {
            const result = await getCompanies(filtersToCompanyFilters(filters, productId));
            // Sort by fit score descending
            const sorted = [...result.items].sort((a, b) => {
                const scoreA = 'combined_score' in a ? (a.combined_score ?? 0) : 0;
                const scoreB = 'combined_score' in b ? (b.combined_score ?? 0) : 0;
                return scoreB - scoreA;
            });
            setPreviewCompanies(sorted);
            setPreviewTotal(result.total);
        } catch {
            setPreviewCompanies([]);
            setPreviewTotal(0);
        } finally {
            setLoadingPreview(false);
        }
    }, [filters, productId, hasAudience, useAgenticMode, searchQuery, triggerAgenticSearch, resetAgenticSearch]);

    // Debounced search trigger
    useEffect(() => {
        if (currentStep === 'audience' || currentStep === 'preview') {
            // Clear previous debounce
            if (searchDebounceRef.current) {
                clearTimeout(searchDebounceRef.current);
            }

            // Debounce the search
            searchDebounceRef.current = setTimeout(() => {
                fetchCompanyPreview();
            }, useAgenticMode && searchQuery.trim() ? 600 : 400);

            return () => {
                if (searchDebounceRef.current) {
                    clearTimeout(searchDebounceRef.current);
                }
            };
        }
    }, [filters, productId, currentStep, fetchCompanyPreview, searchQuery, useAgenticMode]);

    // Fetch partners on mount
    useEffect(() => {
        async function fetchPartners() {
            setLoadingPartners(true);
            try {
                const response = await getPartners({ page_size: 50 });
                const mappedPartners: Partner[] = response.items.map(p => ({
                    id: p.slug || String(p.id),
                    name: p.name,
                    type: 'consulting' as const,
                    description: p.description || '',
                    status: p.status === 'active' ? 'active' : 'inactive',
                    match_score: 90,
                    logo_url: p.logo_url || undefined,
                    capacity: undefined,
                    assigned_count: 0,
                    industries: [],
                }));
                setPartners(mappedPartners);
            } catch {
                setPartners([]);
            } finally {
                setLoadingPartners(false);
            }
        }
        fetchPartners();
    }, []);

    // Fetch partner suggestions when we have companies
    const fetchPartnerSuggestions = useCallback(async () => {
        if (previewCompanies.length === 0) return;

        setLoadingPartners(true);
        try {
            const domains = previewCompanies.slice(0, 20).map(c => c.domain);
            const suggestions = await suggestPartnersForCompanies(domains, 5);
            setSuggestedPartners(suggestions);

            // Auto-select top 3 suggested partners
            if (suggestions.length > 0) {
                const topPartnerIds = suggestions
                    .slice(0, 3)
                    .map(s => s.partner.slug || String(s.partner.id));
                setSelectedPartnerIds(new Set(topPartnerIds));
            }
        } catch {
            // If the API isn't available, use mock suggestions based on existing partners
            const mockSuggestions: PartnerSuggestion[] = partners.slice(0, 3).map((p, i) => ({
                partner: {
                    id: parseInt(p.id) || i + 1,
                    name: p.name,
                    slug: p.id,
                    description: p.description,
                    status: p.status,
                    logo_url: p.logo_url || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                match_score: 95 - (i * 5),
                match_reasons: ['Industry expertise', 'Regional coverage', 'Past performance'],
                industry_overlap: ['Technology', 'SaaS'],
            }));
            setSuggestedPartners(mockSuggestions);

            if (mockSuggestions.length > 0) {
                const topIds = mockSuggestions.map(s => s.partner.slug || String(s.partner.id));
                setSelectedPartnerIds(new Set(topIds));
            }
        } finally {
            setLoadingPartners(false);
        }
    }, [previewCompanies, partners]);

    // Handle product selection
    const handleProductSelect = async (product: ProductSummary) => {
        setProductId(product.id);
        addUserMessage(
            <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{product.name}</span>
            </div>
        );

        await addSystemMessage(
            <div className="space-y-2">
                <p className="text-slate-900 dark:text-white text-sm">
                    Great choice! Now, what would you like to call this campaign?
                </p>
            </div>,
            500
        );
        setCurrentStep('name');
    };

    // Handle name submission
    const handleNameSubmit = async () => {
        if (!name.trim()) return;

        addUserMessage(<span className="font-medium">{name}</span>);

        await addSystemMessage(
            <div className="space-y-2">
                <p className="text-slate-900 dark:text-white text-sm">
                    Perfect! Now let&apos;s define your target audience.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Describe who you&apos;re looking for in natural language, or use filters to narrow down your search.
                </p>
            </div>,
            600
        );
        setCurrentStep('audience');
    };

    // Handle audience confirmation
    const handleAudienceConfirm = async () => {
        if (!hasAudience) return;

        const audienceDesc = searchQuery.trim()
            ? searchQuery
            : filters.map(f => f.displayLabel).join(', ');

        addUserMessage(
            <div className="space-y-1">
                <span className="font-medium">{audienceDesc}</span>
                <div className="text-sm opacity-80">
                    {previewTotal.toLocaleString()} companies
                </div>
            </div>
        );

        // Check if WebSocket search completed and if we have partner suggestions
        const wsSearchCompleted = agenticState.phase === 'complete';
        const hasWsSuggestions = suggestedPartners.length > 0;

        if (hasWsSuggestions) {
            // We have partners from WebSocket - go straight to partner selection
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm">
                        I&apos;ve found <span className="font-semibold">{suggestedPartners.length}</span> recommended partners for these {previewTotal.toLocaleString()} companies.
                    </p>
                </div>,
                500
            );
            setCurrentStep('partners');
        } else if (wsSearchCompleted && previewCompanies.length > 0) {
            // WebSocket completed but returned no partners - fall back to REST API
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm">
                        Finding the best partners for {previewTotal.toLocaleString()} companies...
                    </p>
                </div>,
                400
            );

            setCurrentStep('partners');

            // Fetch partner suggestions via REST API as fallback
            await fetchPartnerSuggestions();
        } else {
            // No WebSocket search or no companies yet - fetch partners normally
            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm">
                        Finding the best partners for {previewTotal.toLocaleString()} companies...
                    </p>
                </div>,
                400
            );

            setCurrentStep('partners');

            // Fetch partner suggestions via REST API
            await fetchPartnerSuggestions();
        }
    };

    // Handle final creation
    const handleCreate = async () => {
        if (!name.trim() || !productId) return;
        setCreating(true);
        setError(null);
        setCurrentStep('creating');

        addUserMessage(
            <span>Create campaign with {selectedPartnerIds.size} partners</span>
        );

        await addSystemMessage(
            <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your campaign...</span>
            </div>,
            300
        );

        const allFilters = searchQuery.trim()
            ? [{ id: 'search', type: 'natural_query' as const, value: searchQuery, displayLabel: searchQuery }, ...filters]
            : filters;

        try {
            // Extract domains from preview companies to add to the campaign
            const domains = previewCompanies.map(c => c.domain);

            const campaign = await createCampaign({
                name: name.trim(),
                description: description.trim() || undefined,
                target_product_id: productId,
                target_criteria: { filters: allFilters },
                domains,
            });

            // Assign partners
            if (assignmentMode !== 'skip' && selectedPartnerIds.size > 0) {
                try {
                    const partnerResponse = await getPartners({ page_size: 100 });
                    const selectedIds = partnerResponse.items
                        .filter(p => selectedPartnerIds.has(p.slug || String(p.id)))
                        .map(p => p.id);

                    if (selectedIds.length > 0) {
                        await bulkAssignPartners(campaign.slug, selectedIds);

                        // Auto-assign companies to partners using round-robin
                        if (assignmentMode === 'auto') {
                            const companyIds = previewCompanies
                                .map(c => c.id)
                                .filter((id): id is number => typeof id === 'number' && id > 0);

                            if (companyIds.length > 0 && selectedIds.length > 0) {
                                // Create round-robin distribution
                                const partnerToCompanies = new Map<number, number[]>();
                                selectedIds.forEach(id => partnerToCompanies.set(id, []));

                                companyIds.forEach((companyId, index) => {
                                    const partnerIndex = index % selectedIds.length;
                                    const partnerId = selectedIds[partnerIndex];
                                    partnerToCompanies.get(partnerId)!.push(companyId);
                                });

                                // Bulk assign to each partner
                                await Promise.all(
                                    Array.from(partnerToCompanies.entries()).map(
                                        ([partnerId, companyIds]) =>
                                            bulkAssignCompaniesToPartner(campaign.slug, partnerId, companyIds)
                                    )
                                );
                            }
                        }
                    }
                } catch (partnerErr) {
                    console.warn('Failed to assign partners:', partnerErr);
                }
            }

            await addSystemMessage(
                <div className="space-y-2">
                    <p className="text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-500" />
                        Campaign created successfully!
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Redirecting you to your new campaign...
                    </p>
                </div>,
                500
            );

            setTimeout(() => {
                router.push(`/campaigns/${campaign.slug}`);
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create campaign');
            setCreating(false);
            setCurrentStep('review');
        }
    };

    // Add filter helper
    const addFilter = (type: string, value: string) => {
        if (!value.trim()) return;
        const labels: Record<string, string> = {
            industry: 'Industry',
            country: 'Location',
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

    return {
        // State
        currentStep,
        setCurrentStep,
        messages,
        isTyping,
        creating,
        error,
        name,
        setName,
        description,
        setDescription,
        showDescription,
        setShowDescription,
        productId,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        activeFilterType,
        setActiveFilterType,
        filterInputValue,
        setFilterInputValue,
        previewCompanies,
        previewTotal,
        loadingPreview,
        selectedDomain,
        setSelectedDomain,
        detailOpen,
        setDetailOpen,
        partners,
        suggestedPartners,
        loadingPartners,
        selectedPartnerIds,
        setSelectedPartnerIds,
        assignmentMode,
        setAssignmentMode,
        useAgenticMode,
        setUseAgenticMode,
        agenticState,
        isAgenticSearching,
        triggerAgenticSearch,
        scrollRef,

        // Handlers
        handleProductSelect,
        handleNameSubmit,
        handleAudienceConfirm,
        handleCreate,
        addFilter,
        addSystemMessage, // exposed for flexibility if needed by steps, though mostly internal
        addUserMessage,   // exposed for flexibility
        hasAudience,
        isAgenticPhaseActive,
    };
}
