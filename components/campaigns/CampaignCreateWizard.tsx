'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';
import type { ProductSummary } from '@/lib/schemas';
import { fadeInUp } from '@/lib/animations';

// Components
import { TypingIndicator } from './wizard/ui/TypingIndicator';
import { SystemMessage } from './wizard/ui/SystemMessage';
import { UserMessage } from './wizard/ui/UserMessage';
import { ProductStep } from './wizard/steps/ProductStep';
import { NameStep } from './wizard/steps/NameStep';
import { AudienceStep } from './wizard/steps/AudienceStep';
import { PartnersStep } from './wizard/steps/PartnersStep';
import { AccountDetail } from '@/components/accounts';

// Hooks
import { useCampaignWizard, type ConversationStep } from '@/hooks/useCampaignWizard';


interface CampaignCreateWizardProps {
    products: ProductSummary[];
    preselectedProductId?: number | null;
}

export function CampaignCreateWizard({ products, preselectedProductId }: CampaignCreateWizardProps) {
    const router = useRouter();
    
    const {
        // State
        currentStep,
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
        hasAudience,
    } = useCampaignWizard(products, preselectedProductId);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/campaigns')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-1.5">
                        {['product', 'name', 'audience', 'partners', 'review'].map((step, index) => {
                            const steps: ConversationStep[] = ['product', 'name', 'audience', 'partners', 'review'];
                            const currentIndex = steps.indexOf(currentStep);
                            const isComplete = index < currentIndex || currentStep === 'creating';
                            const isCurrent = step === currentStep;

                            return (
                                <motion.div
                                    key={step}
                                    initial={false}
                                    animate={{
                                        width: isCurrent ? 24 : 8,
                                        backgroundColor: isComplete || isCurrent 
                                            ? 'var(--primary)' 
                                            : 'var(--muted)',
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="h-2 rounded-full"
                                />
                            );
                        })}
                    </div>

                    <div className="w-9" />
                </div>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div ref={scrollRef} className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                        {/* Rendered messages */}
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg) => (
                                <div key={msg.id}>
                                    {msg.type === 'system' ? (
                                        <SystemMessage>{msg.content}</SystemMessage>
                                    ) : (
                                        <UserMessage>{msg.content}</UserMessage>
                                    )}
                                </div>
                            ))}
                        </AnimatePresence>

                        {/* Typing indicator */}
                        {isTyping && (
                            <SystemMessage>
                                <TypingIndicator />
                            </SystemMessage>
                        )}

                        {/* Interactive content based on current step */}
                        {!isTyping && (
                            <motion.div
                                key={currentStep}
                                variants={fadeInUp}
                                initial="hidden"
                                animate="show"
                                className="space-y-4"
                            >
                                {/* Product Selection */}
                                {currentStep === 'product' && (
                                    <ProductStep 
                                        products={products}
                                        selectedProductId={productId}
                                        onSelect={handleProductSelect}
                                    />
                                )}

                                {/* Campaign Name Input */}
                                {currentStep === 'name' && (
                                    <NameStep 
                                        name={name}
                                        onNameChange={setName}
                                        onSubmit={handleNameSubmit}
                                        description={description}
                                        onDescriptionChange={setDescription}
                                        showDescription={showDescription}
                                        onShowDescription={setShowDescription}
                                    />
                                )}

                                {/* Audience Definition */}
                                {currentStep === 'audience' && (
                                    <AudienceStep 
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        filters={filters}
                                        setFilters={setFilters}
                                        activeFilterType={activeFilterType}
                                        setActiveFilterType={setActiveFilterType}
                                        filterInputValue={filterInputValue}
                                        setFilterInputValue={setFilterInputValue}
                                        previewCompanies={previewCompanies}
                                        previewTotal={previewTotal}
                                        loadingPreview={loadingPreview}
                                        isAgenticSearching={isAgenticSearching}
                                        agenticState={agenticState}
                                        onConfirm={handleAudienceConfirm}
                                        addFilter={addFilter}
                                        triggerAgenticSearch={triggerAgenticSearch}
                                        onCompanyClick={(domain) => {
                                            setSelectedDomain(domain);
                                            setDetailOpen(true);
                                        }}
                                        useAgenticMode={useAgenticMode}
                                    />
                                )}

                                {/* Partner Selection */}
                                {(currentStep === 'partners' || currentStep === 'review') && (
                                    <PartnersStep 
                                        loadingPartners={loadingPartners}
                                        suggestedPartners={suggestedPartners}
                                        partners={partners}
                                        selectedPartnerIds={selectedPartnerIds}
                                        setSelectedPartnerIds={setSelectedPartnerIds}
                                        assignmentMode={assignmentMode}
                                        setAssignmentMode={setAssignmentMode}
                                        error={error}
                                        creating={creating}
                                        onCreate={handleCreate}
                                    />
                                )}
                            </motion.div>
                        )}
                        
                        {/* Bottom spacer for safe scroll */}
                        <div className="h-12" />
                    </div>
                </ScrollArea>
            </div>

            {/* Account Detail Popover */}
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
