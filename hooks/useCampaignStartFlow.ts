'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAgenticSearch, type AgenticSearchState } from './useAgenticSearch';
import type { ProductSummary, WSCompanyResult } from '@/lib/schemas';
import type { CampaignStep } from '@/components/campaigns/start/ui/StepProgressIndicator';

export interface ChatMessage {
    id: string;
    type: 'user' | 'system';
    content: string;
    timestamp: Date;
    isProductSelection?: boolean;
    isSearching?: boolean;
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

    // Suggested queries
    suggestedQueries: string[];

    // Split view state (for desktop)
    isSplitView: boolean;

    // Actions
    handleSubmit: (query?: string) => void;
    handleProductChange: (productId: number) => void;
    handleContinue: () => void;
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
    const isSplitView = hasCompanies;

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
    }, [products, searchHistory, search]);

    const handleContinue = useCallback(() => {
        setCurrentStep('partners');
    }, []);

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

        // Suggested queries
        suggestedQueries,

        // Split view
        isSplitView,

        // Actions
        handleSubmit,
        handleProductChange,
        handleContinue,
        resetChat,
    };
}
