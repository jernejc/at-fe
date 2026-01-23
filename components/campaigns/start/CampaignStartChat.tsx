'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProductSummary, WSSearchPhase } from '@/lib/schemas';
import type { UseCampaignStartFlowReturn } from '@/hooks/useCampaignStartFlow';
import type { CampaignStep } from './ui/StepProgressIndicator';
import { ChatMessage } from './ui/ChatMessage';
import { ChatInput } from './ui/ChatInput';
import { CompaniesCard } from './ui/CompaniesCard';
import { PartnersCard } from './ui/PartnersCard';
import { MinimizedCompaniesCard } from './ui/MinimizedCompaniesCard';
import { MinimizedPartnersCard } from './ui/MinimizedPartnersCard';
import { ProductSelector } from './ui/ProductSelector';
import { SearchProgressCard } from './ui/SearchProgressCard';
import { SuggestedQueries } from './ui/SuggestedQueries';
import { GreetingHeader } from './ui/GreetingHeader';
import { AudienceFilterChips } from './ui/AudienceFilterChips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, ChevronRight, Loader2 } from 'lucide-react';

interface CampaignStartChatProps {
    products: ProductSummary[];
    flowState: UseCampaignStartFlowReturn;
    currentStep: CampaignStep;
}

export function CampaignStartChat({ products, flowState, currentStep }: CampaignStartChatProps) {
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
        partnerSuggestions,
        allPartners,
        selectedPartnerIds,
        selectedPartners,
        loadingPartners,
        filters,
        setFilters,
        activeFilterType,
        setActiveFilterType,
        filterInputValue,
        setFilterInputValue,
        addFilter,
        createPhase,
        campaignName,
        setCampaignName,
        isSaving,
        createError,
        handleSubmit,
        handleProductChange,
        handleContinue,
        handlePartnerToggle,
        handleFinalizePartners,
        handleNameSubmit,
        handleCreateCampaign,
    } = flowState;

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [completedPhases, setCompletedPhases] = useState<WSSearchPhase[]>([]);

    // Determine which panel to show based on step
    const isAudienceStep = currentStep === 'audience';
    const isPartnersStep = currentStep === 'partners';
    const isCreateStep = currentStep === 'create';

    // Show companies panel when searching or when we have results/completed search (only on audience step)
    const showCompaniesPanel = isAudienceStep && (isSearching || hasCompanies || agenticState.phase === 'complete');

    // Show partners panel when on partners step (hide on create step)
    const showPartnersPanel = isPartnersStep;

    // Track completed phases - this pattern (updating state when props change) is valid React
    useEffect(() => {
        if (agenticState.phase === 'connecting') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCompletedPhases([]);
        } else if (agenticState.phase !== 'idle' && agenticState.phase !== 'complete' && agenticState.phase !== 'error') {
            setCompletedPhases(prev => {
                if (!prev.includes(agenticState.phase)) {
                    return [...prev, agenticState.phase];
                }
                return prev;
            });
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
            <div
                className={cn(
                    'flex flex-col min-w-0 transition-all h-full overflow-hidden flex-1'
                )}
            >
                {/* Messages container - scrollable */}
                <div
                    ref={chatContainerRef}
                    className="flex flex-col-reverse flex-1 overflow-y-auto px-4 sm:px-8 py-8 min-h-0"
                >
                    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full gap-5">
                        <AnimatePresence initial={false}>
                            {(() => {
                                // Find the index of the stage 2 transition message
                                const stage2TransitionIndex = messages.findIndex(msg => msg.isStage2Transition);
                                const hasStage2Transition = stage2TransitionIndex !== -1;

                                // Find the index of the stage 3 transition message
                                const stage3TransitionIndex = messages.findIndex(msg => msg.isStage3Transition);
                                const hasStage3Transition = stage3TransitionIndex !== -1;

                                // Split messages into pre-stage-2 and stage-2+
                                const preStage2Messages = hasStage2Transition
                                    ? messages.slice(0, stage2TransitionIndex)
                                    : messages;

                                // Stage 2 messages (between stage 2 and stage 3)
                                const stage2EndIndex = hasStage3Transition ? stage3TransitionIndex : messages.length;
                                const stage2Messages = hasStage2Transition
                                    ? messages.slice(stage2TransitionIndex, stage2EndIndex)
                                    : [];

                                // Stage 3 messages (after stage 3 transition)
                                const stage3Messages = hasStage3Transition
                                    ? messages.slice(stage3TransitionIndex)
                                    : [];

                                const renderMessage = (message: typeof messages[0]) => {
                                    const shouldRender =
                                        message.isSearching ||
                                        message.isProductSelection ||
                                        Boolean(message.content);

                                    if (!shouldRender) return null;

                                    return (
                                        <div key={message.id} className='animate-fade-in-up'>
                                            {message.isSearching ? (
                                                <div className="mx-11">
                                                    <SearchProgressCard
                                                        phase={agenticState.phase}
                                                        interpretation={agenticState.interpretation}
                                                        completedPhases={completedPhases}
                                                    />
                                                </div>
                                            ) : message.isProductSelection ? (
                                                <>
                                                    <ChatMessage
                                                        type={message.type}
                                                        content={message.content}
                                                    />

                                                    <ProductSelector
                                                        products={products}
                                                        selectedProduct={selectedProduct}
                                                        onSelect={(product) =>
                                                            handleProductChange(product.id)
                                                        }
                                                        disabled={isPartnersStep || isCreateStep}
                                                        className='mt-4'
                                                    />
                                                </>
                                            ) : (
                                                <ChatMessage
                                                    type={message.type}
                                                    content={message.content}
                                                />
                                            )}
                                        </div>
                                    );
                                };

                                return (
                                    <>
                                        {/* Greeting header */}
                                        <GreetingHeader />

                                        {/* Pre-stage-2 messages */}
                                        {preStage2Messages.map(renderMessage)}

                                        {/* Thinking steps summary - shown after pre-stage-2 messages when search completes */}
                                        {!isSearching && agenticState.phase === 'complete' && completedPhases.length > 0 && (
                                            <div className="mx-11">
                                                <SearchProgressCard
                                                    phase={agenticState.phase}
                                                    interpretation={agenticState.interpretation}
                                                    completedPhases={completedPhases}
                                                />
                                            </div>
                                        )}


                                        

                                        {/* Minimized companies card - shown after thinking summary when we have companies */}
                                        {hasCompanies && hasStage2Transition && (
                                            <motion.div
                                                key="minimized-companies"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mx-11"
                                            >
                                                <MinimizedCompaniesCard companies={companies} />
                                            </motion.div>
                                        )}

                                        {/* Stage 2 messages (including transition message, up to stage 3) */}
                                        {stage2Messages.map(renderMessage)}

                                        {/* Minimized partners card - shown after stage 3 transition */}
                                        {hasStage3Transition && selectedPartners.length > 0 && (
                                            <motion.div
                                                key="minimized-partners"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mx-11"
                                            >
                                                <MinimizedPartnersCard partners={selectedPartners} />
                                            </motion.div>
                                        )}

                                        {/* Stage 3 messages (including transition message) */}
                                        {stage3Messages.map(renderMessage)}
                                    </>
                                );
                            })()}
                        </AnimatePresence>

                        {/* Companies card inline for mobile/tablet - only on audience step */}
                        {showCompaniesPanel && (
                            <div className="lg:hidden mt-4 mx-11">
                                <CompaniesCard
                                    companies={companies}
                                    totalCount={agenticState.totalResults}
                                    isLoading={isSearching}
                                    insights={agenticState.insights}
                                    interestSummary={agenticState.interestSummary}
                                    className='max-h-[500px]'
                                />
                            </div>
                        )}

                        {/* Partners card inline for mobile/tablet - only on partners step */}
                        {showPartnersPanel && (
                            <div className="lg:hidden mt-4 mx-11">
                                <PartnersCard
                                    partnerSuggestions={partnerSuggestions}
                                    allPartners={allPartners}
                                    selectedPartnerIds={selectedPartnerIds}
                                    onToggle={handlePartnerToggle}
                                    isLoading={loadingPartners}
                                    className="max-h-[500px]"
                                />
                            </div>
                        )}

                        {/* Suggested queries - only before stage 2 transition */}
                        {isAudienceStep && !isSearching && agenticState.phase === 'complete' && (
                            <SuggestedQueries
                                queries={suggestedQueries}
                                onClick={handleSubmit}
                            />
                        )}
                    </div>
                </div>

                {/* Input area - fixed at bottom */}
                <div>
                    <AnimatePresence mode="wait">
                        {isAudienceStep && (
                            <motion.div
                                key="audience-input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChatInput
                                    value={inputValue}
                                    onChange={setInputValue}
                                    onSubmit={handleSubmit}
                                    onContinue={handleContinue}
                                    suggestedQueries={!isSearching && agenticState.phase === 'complete' ? suggestedQueries : []}
                                    showContinue={hasCompanies && !isSearching}
                                    disabled={isSearching}
                                    placeholder="Describe your ideal customers..."
                                    className="max-w-3xl mx-auto w-full"
                                />

                                {/* Filter chips */}
                                <AudienceFilterChips
                                    filters={filters}
                                    setFilters={setFilters}
                                    activeFilterType={activeFilterType}
                                    setActiveFilterType={setActiveFilterType}
                                    filterInputValue={filterInputValue}
                                    setFilterInputValue={setFilterInputValue}
                                    addFilter={addFilter}
                                    disabled={isSearching}
                                />
                            </motion.div>
                        )}

                        {isPartnersStep && (
                            <motion.div
                                key="partners-continue"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="pb-6 px-11 max-w-3xl mx-auto w-full"
                            >
                                <Button
                                    onClick={handleFinalizePartners}
                                    className="w-full"
                                    size="xl"
                                    disabled={selectedPartnerIds.size === 0}
                                >
                                    Finalize partners
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </motion.div>
                        )}

                        {/* Create step - naming phase */}
                        {isCreateStep && createPhase === 'naming' && (
                            <motion.div
                                key="create-naming"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="pb-6 px-11 max-w-3xl mx-auto w-full"
                            >
                                <div className="relative">
                                    <Input
                                        value={campaignName}
                                        onChange={(e) => setCampaignName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && campaignName.trim()) {
                                                handleNameSubmit();
                                            }
                                        }}
                                        placeholder="Campaign name"
                                        autoFocus
                                        className="pr-12 py-3.25 pl-4 min-h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600"
                                    />
                                    <Button
                                        onClick={handleNameSubmit}
                                        disabled={!campaignName.trim()}
                                        size="icon"
                                        className={cn(
                                            'absolute right-2 bottom-2 h-8 w-8 rounded-lg',
                                            !campaignName.trim() && 'opacity-50'
                                        )}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Create step - ready phase */}
                        {isCreateStep && createPhase === 'ready' && (
                            <motion.div
                                key="create-ready"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="pb-6 px-11 max-w-3xl mx-auto w-full space-y-3"
                            >
                                {createError && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                                        {createError}
                                    </div>
                                )}
                                <Button
                                    onClick={handleCreateCampaign}
                                    className="w-full"
                                    size="xl"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create campaign'
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {/* Create step - creating phase */}
                        {isCreateStep && createPhase === 'creating' && (
                            <motion.div
                                key="create-creating"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                                className="pb-6 px-11 max-w-3xl mx-auto w-full"
                            >
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Creating your campaign...
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Side panel for desktop - stable container maintains width during transitions */}
            <AnimatePresence>
                {(showCompaniesPanel || showPartnersPanel) && (
                    <motion.div
                        key="side-panel-container"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: '50%' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="w-1/2 hidden lg:block overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {/* Companies panel - shown on audience step */}
                            {showCompaniesPanel && (
                                <motion.div
                                    key="companies-panel"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full p-6"
                                >
                                    <CompaniesCard
                                        companies={companies}
                                        totalCount={agenticState.totalResults}
                                        isLoading={isSearching}
                                        insights={agenticState.insights}
                                        interestSummary={agenticState.interestSummary}
                                        className="h-full max-h-full"
                                    />
                                </motion.div>
                            )}

                            {/* Partners panel - shown on partners step */}
                            {showPartnersPanel && (
                                <motion.div
                                    key="partners-panel"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full p-6"
                                >
                                    <PartnersCard
                                        partnerSuggestions={partnerSuggestions}
                                        allPartners={allPartners}
                                        selectedPartnerIds={selectedPartnerIds}
                                        onToggle={handlePartnerToggle}
                                        isLoading={loadingPartners}
                                        className="h-full max-h-full"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
