'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE, generateCompanyPlaybookAsync } from '@/lib/api';

const STORAGE_KEY_PREFIX = 'playbook-gen';

interface PendingGeneration {
  taskId: string;
  streamUrl: string;
  domain: string;
  productId: number;
}

function getStorageKey(domain: string, productId: number): string {
  return `${STORAGE_KEY_PREFIX}:${domain}:${productId}`;
}

function getPendingGeneration(domain: string, productId: number): PendingGeneration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getStorageKey(domain, productId));
    if (!raw) return null;
    return JSON.parse(raw) as PendingGeneration;
  } catch {
    return null;
  }
}

function savePendingGeneration(pending: PendingGeneration): void {
  localStorage.setItem(getStorageKey(pending.domain, pending.productId), JSON.stringify(pending));
}

function clearPendingGeneration(domain: string, productId: number): void {
  localStorage.removeItem(getStorageKey(domain, productId));
}

/**
 * Connect to an SSE stream and listen for completion/error events.
 * Returns a cleanup function that closes the connection.
 */
function connectToStream(
  streamUrl: string,
  onComplete: () => void,
  onError: (error: string) => void,
): () => void {
  const url = streamUrl.startsWith('http') ? streamUrl : `${API_BASE}${streamUrl}`;
  const evtSource = new EventSource(url);

  evtSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const eventType = (data.type || '').toLowerCase();
      const status = (data.status || '').toLowerCase();

      if (eventType === 'complete' || status === 'completed' || status === 'done') {
        evtSource.close();
        onComplete();
        return;
      }

      if (eventType === 'error' || status === 'error') {
        evtSource.close();
        onError(data.error || data.message || 'Playbook generation failed');
        return;
      }
    } catch {
      const rawMessage = event.data.replace(/^"|"$/g, '');
      const lowerMsg = rawMessage.toLowerCase();

      if (lowerMsg.includes('completed') || rawMessage === 'completed') {
        evtSource.close();
        onComplete();
        return;
      }

      if (lowerMsg.includes('failed') || lowerMsg.includes('error')) {
        evtSource.close();
        onError(rawMessage);
        return;
      }
    }
  };

  evtSource.onerror = () => {
    evtSource.close();
  };

  return () => evtSource.close();
}

interface UsePlaybookGenerationOptions {
  domain: string;
  productId: number | null;
  /** Called when generation completes — caller should re-fetch playbooks. */
  onComplete: () => Promise<void>;
}

interface UsePlaybookGenerationReturn {
  /** Whether a playbook generation is in progress (persists across reloads). */
  isGenerating: boolean;
  /** Error message from the last generation attempt. */
  generationError: string | null;
  /** Kick off async playbook generation. */
  startGeneration: () => Promise<void>;
}

/**
 * Manages playbook generation with localStorage persistence.
 * Survives page reloads and route changes by storing task info in localStorage
 * and reconnecting to the SSE stream on mount.
 */
export function usePlaybookGeneration({
  domain,
  productId,
  onComplete,
}: UsePlaybookGenerationOptions): UsePlaybookGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const handleComplete = useCallback(async (d: string, pId: number) => {
    clearPendingGeneration(d, pId);
    try {
      await onCompleteRef.current();
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleError = useCallback((d: string, pId: number, error: string) => {
    clearPendingGeneration(d, pId);
    setGenerationError(error);
    setIsGenerating(false);
  }, []);

  const listen = useCallback((streamUrl: string, d: string, pId: number) => {
    cleanupRef.current?.();
    cleanupRef.current = connectToStream(
      streamUrl,
      () => handleComplete(d, pId),
      (error) => handleError(d, pId, error),
    );
  }, [handleComplete, handleError]);

  // On mount (or when domain/productId changes), check localStorage for pending generation
  useEffect(() => {
    if (!productId) return;

    const pending = getPendingGeneration(domain, productId);
    if (!pending) return;

    setIsGenerating(true);
    setGenerationError(null);
    listen(pending.streamUrl, domain, productId);

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [domain, productId, listen]);

  // Cleanup SSE on unmount (localStorage stays)
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, []);

  const startGeneration = useCallback(async () => {
    if (!productId || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await generateCompanyPlaybookAsync(domain, productId);

      const pending: PendingGeneration = {
        taskId: response.task_id,
        streamUrl: response.stream_url,
        domain,
        productId,
      };
      savePendingGeneration(pending);

      listen(response.stream_url, domain, productId);
    } catch (err) {
      console.error('Failed to start playbook generation:', err);
      setGenerationError('Failed to generate playbook. Please try again.');
      setIsGenerating(false);
    }
  }, [domain, productId, isGenerating, listen]);

  return { isGenerating, generationError, startGeneration };
}
