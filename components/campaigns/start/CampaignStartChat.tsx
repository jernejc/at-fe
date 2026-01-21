'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductSummary, WSSearchPhase } from '@/lib/schemas';
import type { UseCampaignStartFlowReturn } from '@/hooks/useCampaignStartFlow';
import { ChatMessage } from './ui/ChatMessage';
import { ChatInput } from './ui/ChatInput';
import { CompaniesCard } from './ui/CompaniesCard';
import { ProductSelector } from './ui/ProductSelector';
import { SearchPhaseIndicator } from '@/components/campaigns/SearchPhaseIndicator';
import { ThinkingStepsSummary } from './ui/ThinkingStepsSummary';
import { SuggestedQueries } from './ui/SuggestedQueries';

interface CampaignStartChatProps {
    products: ProductSummary[];
    flowState: UseCampaignStartFlowReturn;
}

const transition = { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const };

export function CampaignStartChat({ products, flowState }: CampaignStartChatProps) {
    const {
        selectedProduct,
        messages,
        inputValue,
        setInputValue,
        agenticState,
        isSearching,
        companies,
        hasCompanies,
        suggestedQueries,
        handleSubmit,
        handleProductChange,
        handleContinue,
    } = flowState;

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [completedPhases, setCompletedPhases] = useState<WSSearchPhase[]>([]);

    // Show companies panel when searching or when we have results/completed search
    const showCompaniesPanel = isSearching || hasCompanies || agenticState.phase === 'complete';

    // Track completed phases
    useEffect(() => {
        if (agenticState.phase !== 'idle' && agenticState.phase !== 'complete' && agenticState.phase !== 'error') {
            setCompletedPhases(prev => {
                if (!prev.includes(agenticState.phase)) {
                    return [...prev, agenticState.phase];
                }
                return prev;
            });
        }
        // Reset when starting a new search
        if (agenticState.phase === 'connecting') {
            setCompletedPhases([]);
        }
    }, [agenticState.phase]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        console.log(messages);
    }, [messages, agenticState.phase]);

    return (
        <div className="h-full flex flex-col lg:flex-row overflow-hidden">
            {/* Chat area */}
            <motion.div
                layout
                transition={transition}
                className={cn(
                    'flex flex-col min-w-0 transition-all h-full overflow-hidden flex-1'
                )}
            >
                {/* Messages container - scrollable */}
                <div
                    ref={chatContainerRef}
                    className="flex flex-col flex-1 overflow-y-auto px-4 sm:px-6 pt-6 min-h-0"
                >
                    <div className="flex-1 flex flex-col max-w-2xl mx-auto space-y-4">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => {
                                const shouldRender =
                                    message.isSearching ||
                                    message.isProductSelection ||
                                    Boolean(message.content);

                                if (!shouldRender) return null;

                                return (
                                    <div key={message.id}>
                                        {message.isSearching ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="ml-11"
                                            >
                                                <SearchPhaseIndicator
                                                    phase={agenticState.phase}
                                                    showElapsedTime
                                                    intent={agenticState.interpretation?.intent}
                                                    semanticQuery={agenticState.interpretation?.semantic_query}
                                                    keywords={agenticState.interpretation?.keywords}
                                                />
                                            </motion.div>
                                        ) : message.isProductSelection ? (
                                            <ProductSelector
                                                products={products}
                                                selectedProduct={selectedProduct}
                                                onSelect={(product) =>
                                                    handleProductChange(product.id)
                                                }
                                            />
                                        ) : (
                                            <ChatMessage
                                                type={message.type}
                                                content={message.content}
                                            />
                                        )}
                                    </div>
                                );
                            })}


                            {/* Thinking steps summary - shown after all messages when search completes */}
                            {!isSearching && agenticState.phase === 'complete' && completedPhases.length > 0 && (
                                <motion.div
                                    key="thinking-summary"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    className="ml-11"
                                >
                                    <ThinkingStepsSummary
                                        interpretation={agenticState.interpretation}
                                        completedPhases={completedPhases}
                                    />
                                </motion.div>
                            )}

                            {!isSearching && agenticState.phase === 'complete' && (
                                <SuggestedQueries
                                    queries={suggestedQueries}
                                    onClick={handleSubmit}
                                />
                            )}
                        </AnimatePresence>

                        {/* Companies card inline for mobile/tablet */}
                        {showCompaniesPanel && (
                            <div className="lg:hidden mt-4">
                                <CompaniesCard
                                    companies={companies}
                                    totalCount={agenticState.totalResults}
                                    isLoading={isSearching}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input area - fixed at bottom */}
                <div>
                    <ChatInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={handleSubmit}
                        onContinue={handleContinue}
                        suggestedQueries={!isSearching && agenticState.phase === 'complete' ? suggestedQueries : []}
                        showContinue={hasCompanies && !isSearching}
                        disabled={isSearching}
                        placeholder="Describe your ideal customers..."
                        className="max-w-2xl mx-auto w-full"
                    />
                </div>
            </motion.div>

            {/* Companies panel for desktop */}
            <AnimatePresence>
                {showCompaniesPanel && (
                    <motion.div
                        key="companies-panel"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '50%' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={transition}
                        className="w-1/2 hidden lg:block border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-hidden"
                    >
                        <div className="h-full p-6">
                            <CompaniesCard
                                companies={companies}
                                totalCount={agenticState.totalResults}
                                isLoading={isSearching}
                                className="h-full max-h-full"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
