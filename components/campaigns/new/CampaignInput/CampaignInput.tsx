'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { WSSearchPhase } from '@/lib/schemas';
import type { CampaignInputProps } from './CampaignInput.types';
import { useCampaignInput } from '@/hooks/useCampaignInput';
import { CampaignInputField } from './CampaignInputField';
import { CampaignInputProductLabel } from './CampaignInputProductLabel';
import { CampaignInputProductGrid } from './CampaignInputProductGrid';
import { CampaignInputChat } from './CampaignInputChat';
import { CampaignInputTerminal } from './CampaignInputTerminal';

const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

/** Unified input component for campaign creation with product selection, chat, and terminal. */
export function CampaignInput({
  products,
  selectedProduct,
  onProductSelect,
  onSubmit,
  searchPhase,
  isSearching,
  className,
  externalSubmitRef,
}: CampaignInputProps) {
  const {
    componentState,
    inputValue,
    messages,
    isProductGridOpen,
    canSend,
    showChat,
    showTerminal,
    lastMessageText,
    inputRef,
    setInputValue,
    handleSend,
    handleKeyDown,
    handleProductSelect,
    handleReopen,
    toggleProductGrid,
    containerRef,
    handleContainerBlur,
    submitExternal,
  } = useCampaignInput({
    selectedProduct,
    onProductSelect,
    onSubmit,
    isSearching,
  });

  // Populate external submit ref so parent can trigger submissions programmatically
  useEffect(() => {
    if (externalSubmitRef) {
      externalSubmitRef.current = submitExternal;
    }
  }, [externalSubmitRef, submitExternal]);

  // Track completed phases for the terminal
  const [completedPhases, setCompletedPhases] = useState<WSSearchPhase[]>([]);
  const prevPhaseRef = useRef<WSSearchPhase>(searchPhase);

  useEffect(() => {
    if (searchPhase === 'connecting' || searchPhase === 'idle') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompletedPhases([]);
    } else if (
      searchPhase !== 'complete' &&
      searchPhase !== 'error' &&
      searchPhase !== prevPhaseRef.current
    ) {
      setCompletedPhases((prev) =>
        prev.includes(searchPhase) ? prev : [...prev, searchPhase]
      );
    }
    prevPhaseRef.current = searchPhase;
  }, [searchPhase]);

  const isClosed = componentState === 'closed';

  const handleContainerClick = () => {
    if (isClosed) handleReopen();
  };

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (isClosed && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleReopen();
    }
  };

  return (
    <div
      ref={containerRef}
      role={isClosed ? 'button' : undefined}
      tabIndex={isClosed ? 0 : undefined}
      onClick={handleContainerClick}
      onKeyDown={isClosed ? handleContainerKeyDown : undefined}
      onBlur={handleContainerBlur}
      className={cn(
        'rounded-2xl border border-border bg-card overflow-hidden transition-colors',
        isClosed && 'cursor-pointer hover:border-border-d',
        className
      )}
    >
      {/* Chat section */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            key="chat"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="overflow-hidden"
          >
            <CampaignInputChat messages={messages} />
            <Separator />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input field — always visible */}
      <CampaignInputField
        value={inputValue}
        onChange={setInputValue}
        onKeyDown={handleKeyDown}
        onSend={handleSend}
        canSend={canSend}
        state={componentState}
        isSearching={isSearching}
        lastMessageText={lastMessageText}
        inputRef={inputRef}
      />

      {/* Product label — always visible */}
      <CampaignInputProductLabel
        productName={selectedProduct?.name ?? null}
        isProductGridOpen={isProductGridOpen}
        onToggle={toggleProductGrid}
      />

      {/* Product grid */}
      <AnimatePresence>
        {isProductGridOpen && (
          <motion.div
            key="product-grid"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="overflow-hidden"
          >
            <Separator />
            <CampaignInputProductGrid
              products={products}
              selectedProduct={selectedProduct}
              onSelect={handleProductSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            key="terminal"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springTransition}
            className="overflow-hidden"
          >
            <CampaignInputTerminal
              phase={searchPhase}
              completedPhases={completedPhases}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
