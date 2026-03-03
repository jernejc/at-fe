'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CampaignInput } from '@/components/campaigns/start/ui/CampaignInput';
import type { ProductSummary, WSSearchPhase } from '@/lib/schemas';

const MOCK_PRODUCTS: ProductSummary[] = [
  { id: 1, name: 'Google Gemini', description: 'AI model', category: 'AI/ML', interest_count: 12, event_count: 5 },
  { id: 2, name: 'Google Cloud AI/ML', description: 'Cloud AI platform', category: 'Cloud', interest_count: 8, event_count: 3 },
  { id: 3, name: 'Google Workspace', description: 'Productivity suite', category: 'SaaS', interest_count: 15, event_count: 7 },
  { id: 4, name: 'Google Ads', description: 'Advertising platform', category: 'Marketing', interest_count: 20, event_count: 10 },
  { id: 5, name: 'Google Maps Platform', description: 'Location services', category: 'Developer', interest_count: 6, event_count: 2 },
  { id: 6, name: 'Google Cloud CDN', description: 'Content delivery', category: 'Cloud', interest_count: 4, event_count: 1 },
];

const PHASE_SEQUENCE: WSSearchPhase[] = [
  'connecting',
  'interpreting',
  'searching',
  'results',
  'suggesting',
  'partner_suggestion',
  'insights',
  'complete',
];

/** Design system showcase for the CampaignInput component. */
export function CampaignInputSection() {
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [mockPhase, setMockPhase] = useState<WSSearchPhase>('idle');
  const [mockSearching, setMockSearching] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const simulateSearch = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_query: string) => {
      clearTimers();
      setMockSearching(true);
      setMockPhase('connecting');

      PHASE_SEQUENCE.forEach((phase, i) => {
        const timer = setTimeout(() => {
          setMockPhase(phase);
          if (phase === 'complete') {
            setMockSearching(false);
          }
        }, (i + 1) * 1200);
        timersRef.current.push(timer);
      });
    },
    [clearTimers]
  );

  const resetDemo = useCallback(() => {
    clearTimers();
    setSelectedProduct(null);
    setMockPhase('idle');
    setMockSearching(false);
  }, [clearTimers]);

  return (
    <section id="campaign-input" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Campaign Input</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Unified input component for campaign creation with product selection,
          chat bubbles, and terminal progress display.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Interactive Demo
        </h3>
        <p className="text-xs text-muted-foreground">
          Select a product, type a query, and submit to see the full flow.
          The WebSocket phases are simulated with timers.
        </p>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={resetDemo}>
            Reset
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            Phase: <code className="text-foreground">{mockPhase}</code>
            {mockSearching && ' (searching)'}
          </span>
        </div>

        <div className="max-w-lg">
          <CampaignInput
            products={MOCK_PRODUCTS}
            selectedProduct={selectedProduct}
            onProductSelect={setSelectedProduct}
            onSubmit={simulateSearch}
            searchPhase={mockPhase}
            isSearching={mockSearching}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          States
        </h3>
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong className="text-foreground">Initial:</strong> No product selected, product grid open below input, send disabled.</p>
          <p><strong className="text-foreground">Ready:</strong> Product selected, grid closed. Input focused, send enabled when text present.</p>
          <p><strong className="text-foreground">Active:</strong> Message sent. Chat bubbles above, terminal below, loader spinning.</p>
          <p><strong className="text-foreground">Closed:</strong> Search done. Chat + terminal collapsed. Pencil icon, last message in input. Click to reopen.</p>
        </div>
      </div>
    </section>
  );
}
