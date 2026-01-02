'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    WSSearchPhase,
    WSSearchRequest,
    WSSearchInterpretation,
    WSCompanyResult,
    WSPartnerResult,
    WSPartnerSuggestion,
    WSSearchInsights,
    WSSearchMessage,
    WSInterestFrequency,
} from '@/lib/schemas';

/**
 * Get WebSocket URL from environment or derive from API URL
 * 
 * Configuration:
 * - NEXT_PUBLIC_WS_URL: Explicit WebSocket URL (e.g., ws://localhost:8000)
 * - NEXT_PUBLIC_API_URL: Falls back to deriving WS URL from this (http→ws, https→wss)
 * - Defaults to ws://localhost:8000 if neither is set
 */
function getWSUrl(): string {
    if (process.env.NEXT_PUBLIC_WS_URL) {
        return process.env.NEXT_PUBLIC_WS_URL;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Convert http(s) to ws(s)
    return apiUrl.replace(/^http(s)?:/, 'ws$1:');
}

export interface AgenticSearchState {
    phase: WSSearchPhase;
    interpretation: WSSearchInterpretation | null;
    companies: WSCompanyResult[];
    partners: WSPartnerResult[];
    partnerSuggestions: WSPartnerSuggestion[];
    insights: WSSearchInsights | null;
    totalResults: number;
    partnerResults: number;
    searchTimeMs: number;
    error: string | null;
    requestId: string | null;
    suggestedQueries: string[];
    refinementTips: string[];
    interestSummary: WSInterestFrequency[];
}

export interface UseAgenticSearchOptions {
    onCompanyResult?: (company: WSCompanyResult) => void;
    onPartnerResult?: (partner: WSPartnerResult) => void;
    onPartnerSuggestion?: (suggestion: WSPartnerSuggestion) => void;
    onPhaseChange?: (phase: WSSearchPhase) => void;
    onComplete?: (state: AgenticSearchState) => void;
    onError?: (error: string) => void;
}

export interface UseAgenticSearchReturn {
    state: AgenticSearchState;
    search: (query: string, options?: Partial<WSSearchRequest>) => void;
    reset: () => void;
    cancel: () => void;
    isSearching: boolean;
    isConnected: boolean;
}

const initialState: AgenticSearchState = {
    phase: 'idle',
    interpretation: null,
    companies: [],
    partners: [],
    partnerSuggestions: [],
    insights: null,
    totalResults: 0,
    partnerResults: 0,
    searchTimeMs: 0,
    error: null,
    requestId: null,
    suggestedQueries: [],
    refinementTips: [],
    interestSummary: [],
};

export function useAgenticSearch(options: UseAgenticSearchOptions = {}): UseAgenticSearchReturn {
    const [state, setState] = useState<AgenticSearchState>(initialState);
    const [isConnected, setIsConnected] = useState(false);
    
    const wsRef = useRef<WebSocket | null>(null);
    const optionsRef = useRef(options);
    optionsRef.current = options;

    // Cleanup WebSocket on unmount
    useEffect(() => {
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, []);

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data) as WSSearchMessage;

            switch (data.type) {
                case 'ack':
                    setState(prev => ({
                        ...prev,
                        requestId: data.request_id,
                        phase: 'connecting',
                    }));
                    break;

                case 'result': {
                    const phase = data.phase;
                    
                    // Update phase
                    setState(prev => {
                        if (prev.phase !== phase) {
                            optionsRef.current.onPhaseChange?.(phase);
                        }
                        return { ...prev, phase };
                    });

                    // Handle phase-specific data
                    if (phase === 'interpreting' && data.interpretation) {
                        setState(prev => ({
                            ...prev,
                            interpretation: data.interpretation!,
                        }));
                    } else if (phase === 'results') {
                        if (data.company) {
                            setState(prev => ({
                                ...prev,
                                companies: [...prev.companies, data.company!],
                            }));
                            optionsRef.current.onCompanyResult?.(data.company);
                        }
                        if (data.partner && 'entity_type' in data.partner && data.partner.entity_type === 'partner') {
                            const partnerResult = data.partner as WSPartnerResult;
                            setState(prev => ({
                                ...prev,
                                partners: [...prev.partners, partnerResult],
                            }));
                            optionsRef.current.onPartnerResult?.(partnerResult);
                        }
                    } else if (phase === 'partner_suggestion' && data.partner) {
                        const suggestion = data.partner as WSPartnerSuggestion;
                        setState(prev => ({
                            ...prev,
                            partnerSuggestions: [...prev.partnerSuggestions, suggestion],
                        }));
                        optionsRef.current.onPartnerSuggestion?.(suggestion);
                    } else if (phase === 'suggestions_complete') {
                        setState(prev => ({
                            ...prev,
                            interestSummary: data.based_on_interests || [],
                        }));
                    } else if (phase === 'insights' && data.insights) {
                        setState(prev => ({
                            ...prev,
                            insights: data.insights!,
                        }));
                    }
                    break;
                }

                case 'error':
                    setState(prev => ({
                        ...prev,
                        phase: 'error',
                        error: data.message,
                    }));
                    optionsRef.current.onError?.(data.message);
                    wsRef.current?.close();
                    break;

                case 'complete':
                    setState(prev => {
                        const newState: AgenticSearchState = {
                            ...prev,
                            phase: 'complete',
                            totalResults: data.total_results,
                            partnerResults: data.partner_results,
                            partnerSuggestions: data.partner_suggestions || prev.partnerSuggestions,
                            searchTimeMs: data.search_time_ms,
                            suggestedQueries: data.suggested_queries || [],
                            refinementTips: data.refinement_tips || [],
                            interestSummary: data.partner_suggestion_summary?.based_on_interests || prev.interestSummary,
                        };
                        optionsRef.current.onComplete?.(newState);
                        return newState;
                    });
                    wsRef.current?.close();
                    break;
            }
        } catch (err) {
            console.error('Failed to parse WebSocket message:', err);
        }
    }, []);

    const search = useCallback((query: string, searchOptions?: Partial<WSSearchRequest>) => {
        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Reset state
        setState({
            ...initialState,
            phase: 'connecting',
        });

        const wsUrl = getWSUrl();
        const ws = new WebSocket(`${wsUrl}/ws/search`);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            
            const request: WSSearchRequest = {
                query,
                entity_types: searchOptions?.entity_types || ['companies', 'partners'],
                limit: searchOptions?.limit || 20,
                include_partner_suggestions: searchOptions?.include_partner_suggestions ?? true,
                partner_suggestion_limit: searchOptions?.partner_suggestion_limit || 5,
                context: searchOptions?.context || {},
                request_id: searchOptions?.request_id || `search-${Date.now()}`,
            };

            ws.send(JSON.stringify(request));
        };

        ws.onmessage = handleMessage;

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setState(prev => ({
                ...prev,
                phase: 'error',
                error: 'Connection error. Please try again.',
            }));
            setIsConnected(false);
        };

        ws.onclose = () => {
            setIsConnected(false);
            wsRef.current = null;
        };
    }, [handleMessage]);

    const reset = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setState(initialState);
        setIsConnected(false);
    }, []);

    const cancel = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setState(prev => ({
            ...prev,
            phase: 'idle',
        }));
        setIsConnected(false);
    }, []);

    const isSearching = state.phase !== 'idle' && 
                        state.phase !== 'complete' && 
                        state.phase !== 'error';

    return {
        state,
        search,
        reset,
        cancel,
        isSearching,
        isConnected,
    };
}

