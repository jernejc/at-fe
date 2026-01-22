'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAgenticSearch, type AgenticSearchState } from './useAgenticSearch';
import type { ProductSummary, WSCompanyResult, PartnerSummary, WSPartnerSuggestion } from '@/lib/schemas';
import type { CampaignStep } from '@/components/campaigns/start/ui/StepProgressIndicator';
import { getPartners, bulkAssignPartners, bulkAssignCompaniesToPartner } from '@/lib/api/partners';
import { createCampaign, addCompaniesBulk } from '@/lib/api/campaigns';
import { generateRandomCampaignName } from '@/lib/utils';

export type CreatePhase = 'naming' | 'ready' | 'creating';

export interface ChatMessage {
    id: string;
    type: 'user' | 'system';
    content: string;
    timestamp: Date;
    isProductSelection?: boolean;
    isSearching?: boolean;
    isStage2Transition?: boolean;
    isStage3Transition?: boolean;
}

export interface UseCampaignStartFlowOptions {
    products: ProductSummary[];
    preselectedProductId: number | null;
    selectRandomProduct: (products: ProductSummary[]) => ProductSummary | null;
}

export interface UseCampaignStartFlowReturn {
    // Step management
    currentStep: CampaignStep;
    setCurrentStep: (step: CampaignStep) => void;

    // Product selection
    selectedProduct: ProductSummary | null;
    setSelectedProduct: (product: ProductSummary | null) => void;

    // Chat state
    messages: ChatMessage[];
    inputValue: string;
    setInputValue: (value: string) => void;

    // Search state
    searchHistory: string[];
    agenticState: AgenticSearchState;
    isSearching: boolean;

    // Companies
    companies: WSCompanyResult[];
    hasCompanies: boolean;

    // Partners
    partnerSuggestions: WSPartnerSuggestion[];
    allPartners: PartnerSummary[];
    selectedPartnerIds: Set<string>;
    selectedPartners: (PartnerSummary | WSPartnerSuggestion)[];
    loadingPartners: boolean;

    // Suggested queries
    suggestedQueries: string[];

    // Split view state (for desktop)
    isSplitView: boolean;

    // Create phase state
    createPhase: CreatePhase | null;
    campaignName: string;
    setCampaignName: (name: string) => void;
    isSaving: boolean;
    createError: string | null;

    // Actions
    handleSubmit: (query?: string) => void;
    handleProductChange: (productId: number) => void;
    handleContinue: () => void;
    handlePartnerToggle: (partnerId: string) => void;
    handleFinalizePartners: () => void;
    handleNameSubmit: () => void;
    handleCreateCampaign: () => void;
    resetChat: () => void;
}

export function useCampaignStartFlow({
    products,
    preselectedProductId,
    selectRandomProduct,
}: UseCampaignStartFlowOptions): UseCampaignStartFlowReturn {
    // Step management
    const [currentStep, setCurrentStep] = useState<CampaignStep>('audience');

    // Product selection
    const initialProduct = useMemo(() => {
        if (preselectedProductId) {
            return products.find(p => p.id === preselectedProductId) || selectRandomProduct(products);
        }
        return selectRandomProduct(products);
    }, [products, preselectedProductId, selectRandomProduct]);

    const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(initialProduct);

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const initialMessages: ChatMessage[] = [];

        if (initialProduct) {
            initialMessages.push({
                id: 'system-product-intro',
                type: 'system',
                content: '',
                timestamp: new Date(),
                isProductSelection: true,
            });
        }

        initialMessages.push({
            id: 'system-audience-prompt',
            type: 'system',
            content: `${initialProduct ? `I've pre-selected **${initialProduct.name}** for this campaign. You can change it above if needed.\n` : ''}
                Now, let's describe your target audience or the type of companies you\'re looking for.`,
            timestamp: new Date(),
        });

        return initialMessages;
    });

    const [inputValue, setInputValue] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    // Agentic search hook
    const { state: agenticState, search, reset: resetSearch, isSearching } = useAgenticSearch({
        onComplete: (state) => {
            // Update messages to reflect search completion
            setMessages(prev => prev.map(msg =>
                msg.isSearching ? { ...msg, isSearching: false } : msg
            ));
        },
    });

    // Derived state
    const companies = agenticState.companies;
    const hasCompanies = companies.length > 0;
    const suggestedQueries = agenticState.suggestedQueries;
    const partnerSuggestions = agenticState.partnerSuggestions;
    const isSplitView = hasCompanies;

    // Partner-related state
    const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<string>>(new Set());
    const [allPartners, setAllPartners] = useState<PartnerSummary[]>([]);
    const [loadingPartners, setLoadingPartners] = useState(false);
    const hasAutoSelectedPartnersRef = useRef(false);

    // Create phase state
    const [createPhase, setCreatePhase] = useState<CreatePhase | null>(null);
    const [campaignName, setCampaignName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Router for navigation
    const router = useRouter();

    // Computed: selected partners array for display
    const selectedPartners = useMemo(() => {
        const partners: (PartnerSummary | WSPartnerSuggestion)[] = [];
        selectedPartnerIds.forEach(slug => {
            // Check suggested partners first
            const suggested = partnerSuggestions.find(p => p.slug === slug);
            if (suggested) {
                partners.push(suggested);
                return;
            }
            // Then check all partners
            const fromAll = allPartners.find(p => p.slug === slug);
            if (fromAll) {
                partners.push(fromAll);
            }
        });
        return partners;
    }, [selectedPartnerIds, partnerSuggestions, allPartners]);

    // Auto-select suggested partners when entering partners step
    useEffect(() => {
        if (currentStep === 'partners' && partnerSuggestions.length > 0 && !hasAutoSelectedPartnersRef.current) {
            const initialSelected = new Set(
                partnerSuggestions.map(s => s.slug)
            );
            setSelectedPartnerIds(initialSelected);
            hasAutoSelectedPartnersRef.current = true;
        }
    }, [currentStep, partnerSuggestions]);

    // Reset auto-selection ref when leaving partners step
    useEffect(() => {
        if (currentStep !== 'partners') {
            hasAutoSelectedPartnersRef.current = false;
        }
    }, [currentStep]);

    // Fetch all partners when entering partners step
    useEffect(() => {
        if (currentStep === 'partners') {
            setLoadingPartners(true);
            getPartners({ page_size: 50 })
                .then(res => {
                    setAllPartners(res.items);

                    // Fallback: if no suggested partners, auto-select top 3 from all partners
                    if (partnerSuggestions.length === 0 && res.items.length > 0 && !hasAutoSelectedPartnersRef.current) {
                        const fallbackIds = res.items.slice(0, 3).map(p => p.slug);
                        setSelectedPartnerIds(new Set(fallbackIds));
                        hasAutoSelectedPartnersRef.current = true;
                    }
                })
                .catch(console.error)
                .finally(() => setLoadingPartners(false));
        }
    }, [currentStep, partnerSuggestions.length]);

    // Handlers
    const handleSubmit = useCallback((query?: string) => {
        const queryToSubmit = query || inputValue.trim();
        if (!queryToSubmit) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: queryToSubmit,
            timestamp: new Date(),
        };

        // Add system searching message
        const searchingMessage: ChatMessage = {
            id: `searching-${Date.now()}`,
            type: 'system',
            content: '',
            timestamp: new Date(),
            isSearching: true,
        };

        setMessages(prev => [...prev, userMessage, searchingMessage]);
        setInputValue('');

        // Update search history and create combined query
        const newHistory = [...searchHistory, queryToSubmit];
        setSearchHistory(newHistory);

        // Join queries with markdown separator for multi-turn
        const combinedQuery = newHistory.length > 1
            ? newHistory.join('\n\n---\n\n**Update:**\n')
            : queryToSubmit;

        // Trigger search
        search(combinedQuery, {
            product_id: selectedProduct?.id,
            include_partner_suggestions: true,
            entity_types: ['companies', 'partners'],
            limit: 20,
        });
    }, [inputValue, searchHistory, selectedProduct, search]);

    const handleProductChange = useCallback((productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            setSelectedProduct(product);

            // Re-run search if we have existing queries
            if (searchHistory.length > 0) {
                // Reset to clear previous results and show loading state
                resetSearch();

                const combinedQuery = searchHistory.length > 1
                    ? searchHistory.join('\n\n---\n\n**Update:**\n')
                    : searchHistory[0];

                search(combinedQuery, {
                    product_id: product.id,
                    include_partner_suggestions: true,
                    entity_types: ['companies', 'partners'],
                    limit: 20,
                });
            }
        }
    }, [products, searchHistory, search, resetSearch]);

    const handleContinue = useCallback(() => {
        // Add transition message
        const transitionMessage: ChatMessage = {
            id: `system-partners-${Date.now()}`,
            type: 'system',
            content: `Found **${companies.length} companies** matching your criteria. I've identified **${partnerSuggestions.length} partner${partnerSuggestions.length !== 1 ? 's' : ''}** that are great fits for reaching these companies.`,
            timestamp: new Date(),
            isStage2Transition: true,
        };
        setMessages(prev => [...prev, transitionMessage]);
        setCurrentStep('partners');
    }, [companies.length, partnerSuggestions.length]);

    const handlePartnerToggle = useCallback((partnerId: string) => {
        setSelectedPartnerIds(prev => {
            const next = new Set(prev);
            if (next.has(partnerId)) {
                next.delete(partnerId);
            } else {
                next.add(partnerId);
            }
            return next;
        });
    }, []);

    const handleFinalizePartners = useCallback(() => {
        // Add transition message
        const transitionMessage: ChatMessage = {
            id: `system-create-${Date.now()}`,
            type: 'system',
            content: `**${companies.length} companies** and **${selectedPartnerIds.size} partner${selectedPartnerIds.size !== 1 ? 's' : ''}** selected. Now let's name your campaign.`,
            timestamp: new Date(),
            isStage3Transition: true,
        };
        setMessages(prev => [...prev, transitionMessage]);
        setCurrentStep('create');
        setCreatePhase('naming');
        setCampaignName(generateRandomCampaignName());
    }, [companies.length, selectedPartnerIds.size]);

    const handleNameSubmit = useCallback(() => {
        if (!campaignName.trim()) return;

        // Add user message with the campaign name
        const userMessage: ChatMessage = {
            id: `user-name-${Date.now()}`,
            type: 'user',
            content: campaignName.trim(),
            timestamp: new Date(),
        };

        // Add system confirmation message
        const systemMessage: ChatMessage = {
            id: `system-ready-${Date.now()}`,
            type: 'system',
            content: `All set and ready to create **"${campaignName.trim()}"**!`,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage, systemMessage]);
        setCreatePhase('ready');
    }, [campaignName]);

    const handleCreateCampaign = useCallback(async () => {
        if (!campaignName.trim() || !selectedProduct) return;

        setIsSaving(true);
        setCreateError(null);
        setCreatePhase('creating');

        try {
            // 1. Create the campaign
            const campaign = await createCampaign({
                name: campaignName.trim(),
                target_product_id: selectedProduct.id,
            });

            // 2. Add companies to the campaign
            const domains = companies.map(c => c.domain);
            if (domains.length > 0) {
                await addCompaniesBulk(campaign.slug, domains);
            }

            // 3. Get partner IDs from selected partner slugs
            const partnerIds: number[] = [];
            selectedPartnerIds.forEach(slug => {
                const suggested = partnerSuggestions.find(p => p.slug === slug);
                if (suggested) {
                    partnerIds.push(suggested.partner_id);
                    return;
                }
                const fromAll = allPartners.find(p => p.slug === slug);
                if (fromAll) {
                    partnerIds.push(fromAll.id);
                }
            });

            // 4. Assign partners to the campaign
            if (partnerIds.length > 0) {
                await bulkAssignPartners(campaign.slug, partnerIds);

                // 5. Round-robin distribute companies to partners
                // Get company IDs from the companies list
                const companyIds = companies.map(c => c.company_id);

                if (companyIds.length > 0 && partnerIds.length > 0) {
                    // Distribute companies round-robin to partners
                    const companiesPerPartner: Map<number, number[]> = new Map();
                    partnerIds.forEach(id => companiesPerPartner.set(id, []));

                    companyIds.forEach((companyId, index) => {
                        const partnerId = partnerIds[index % partnerIds.length];
                        companiesPerPartner.get(partnerId)!.push(companyId);
                    });

                    // Assign companies to each partner
                    for (const [partnerId, partnerCompanyIds] of companiesPerPartner) {
                        if (partnerCompanyIds.length > 0) {
                            await bulkAssignCompaniesToPartner(campaign.slug, partnerId, partnerCompanyIds);
                        }
                    }
                }
            }

            // 6. Navigate to the campaign detail page
            router.push(`/campaigns/${campaign.slug}`);
        } catch (error) {
            console.error('Failed to create campaign:', error);
            setCreateError(error instanceof Error ? error.message : 'Failed to create campaign. Please try again.');
            setCreatePhase('ready');
        } finally {
            setIsSaving(false);
        }
    }, [campaignName, selectedProduct, companies, selectedPartnerIds, partnerSuggestions, allPartners, router]);

    const resetChat = useCallback(() => {
        setMessages([
            {
                id: 'system-product-intro',
                type: 'system',
                content: selectedProduct
                    ? `I've pre-selected **${selectedProduct.name}** for this campaign. You can change it if needed.`
                    : 'Select a product for your campaign.',
                timestamp: new Date(),
                isProductSelection: true,
            },
            {
                id: 'system-audience-prompt',
                type: 'system',
                content: 'Describe your target audience or the type of companies you\'re looking for.',
                timestamp: new Date(),
            },
        ]);
        setSearchHistory([]);
        setInputValue('');
        resetSearch();
    }, [selectedProduct, resetSearch]);

    return {
        // Step management
        currentStep,
        setCurrentStep,

        // Product selection
        selectedProduct,
        setSelectedProduct,

        // Chat state
        messages,
        inputValue,
        setInputValue,

        // Search state
        searchHistory,
        agenticState,
        isSearching,

        // Companies
        companies,
        hasCompanies,

        // Partners
        partnerSuggestions,
        allPartners,
        selectedPartnerIds,
        selectedPartners,
        loadingPartners,

        // Suggested queries
        suggestedQueries,

        // Split view
        isSplitView,

        // Create phase state
        createPhase,
        campaignName,
        setCampaignName,
        isSaving,
        createError,

        // Actions
        handleSubmit,
        handleProductChange,
        handleContinue,
        handlePartnerToggle,
        handleFinalizePartners,
        handleNameSubmit,
        handleCreateCampaign,
        resetChat,
    };
}
