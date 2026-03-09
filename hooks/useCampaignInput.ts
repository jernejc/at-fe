'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ProductSummary } from '@/lib/schemas';
import type {
  CampaignInputState,
  CampaignInputMessage,
  UseCampaignInputReturn,
} from '@/components/campaigns/new/CampaignInput/CampaignInput.types';

interface UseCampaignInputOptions {
  selectedProduct: ProductSummary | null;
  onProductSelect: (product: ProductSummary) => void;
  onSubmit: (query: string) => void;
  isSearching: boolean;
}

/** Hook managing the CampaignInput state machine: initial → ready → active → closed. */
export function useCampaignInput({
  selectedProduct,
  onProductSelect,
  onSubmit,
  isSearching,
}: UseCampaignInputOptions): UseCampaignInputReturn {
  const [componentState, setComponentState] = useState<CampaignInputState>(
    selectedProduct ? 'ready' : 'initial'
  );
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<CampaignInputMessage[]>([]);
  const [isProductGridOpen, setIsProductGridOpen] = useState(!selectedProduct);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prevIsSearchingRef = useRef(isSearching);

  // Detect active → closed transition when search finishes
  useEffect(() => {
    const wasSearching = prevIsSearchingRef.current;
    prevIsSearchingRef.current = isSearching;

    if (wasSearching && !isSearching && componentState === 'active') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setComponentState('closed');
    }
  }, [isSearching, componentState]);

  // Focus input when entering ready state
  useEffect(() => {
    if (componentState === 'ready') {
      // Small delay to let animations settle
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [componentState]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !selectedProduct) return;

    const message: CampaignInputMessage = {
      id: `msg-${Date.now()}`,
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setInputValue('');
    setComponentState('active');
    setIsProductGridOpen(false);
    onSubmit(text);
  }, [inputValue, selectedProduct, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleProductSelect = useCallback(
    (product: ProductSummary) => {
      // Same product already selected — just close the grid
      if (product.id === selectedProduct?.id) {
        setIsProductGridOpen(false);
        return;
      }

      onProductSelect(product);
      setIsProductGridOpen(false);

      if (componentState === 'initial') {
        setComponentState('ready');
      } else if (messages.length > 0) {
        // A search was already done — transition to active so it auto-closes when search completes
        setComponentState('active');
      }
    },
    [onProductSelect, componentState, messages.length, selectedProduct]
  );

  /** Programmatically submit a query (e.g. from suggested queries). */
  const submitExternal = useCallback(
    (query: string) => {
      if (!selectedProduct) return;

      const message: CampaignInputMessage = {
        id: `msg-${Date.now()}`,
        text: query,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, message]);
      setInputValue('');
      setComponentState('active');
      setIsProductGridOpen(false);
      onSubmit(query);
    },
    [selectedProduct, onSubmit],
  );

  const handleReopen = useCallback(() => {
    setComponentState('ready');
    setInputValue('');
    setIsProductGridOpen(false);
    // Focus will be triggered by the useEffect watching componentState
  }, []);

  const toggleProductGrid = useCallback(() => {
    if (componentState === 'initial') return;
    setIsProductGridOpen((prev) => !prev);
  }, [componentState]);

  // When focus leaves the container with no input text, re-collapse to closed
  const handleContainerBlur = useCallback(
    (e: React.FocusEvent) => {
      // Only applies when reopened from closed (ready state with existing messages)
      if (componentState !== 'ready' || messages.length === 0) return;
      if (inputValue.trim().length > 0) return;

      // Check if focus moved to another element inside the container
      const container = containerRef.current;
      const newTarget = e.relatedTarget as Node | null;
      if (container && newTarget && container.contains(newTarget)) return;

      setComponentState('closed');
    },
    [componentState, messages.length, inputValue]
  );

  const lastMessageText =
    messages.length > 0 ? messages[messages.length - 1].text : null;

  const canSend =
    inputValue.trim().length > 0 &&
    selectedProduct !== null &&
    componentState === 'ready';

  // Show chat & terminal when there are messages and the component isn't collapsed
  const showChat = messages.length > 0 && componentState !== 'closed' && componentState !== 'initial';
  const showTerminal = messages.length > 0 && componentState !== 'closed' && componentState !== 'initial';

  return {
    componentState,
    inputValue,
    messages,
    isProductGridOpen,
    canSend,
    showChat,
    showTerminal,
    lastMessageText,
    inputRef,
    containerRef,
    setInputValue,
    handleSend,
    handleKeyDown,
    handleProductSelect,
    handleReopen,
    toggleProductGrid,
    handleContainerBlur,
    submitExternal,
  };
}
