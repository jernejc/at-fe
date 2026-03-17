import type React from 'react';
import type { ProductSummary, PartnerRead } from '@/lib/schemas';

/** Wizard step progression for the new campaign creation flow. */
export type WizardStep = 'search' | 'results' | 'partners' | 'create';

/** Animation slide direction: 1 = forward, -1 = backward. */
export type SlideDirection = 1 | -1;

/** Mobile tab for the results step two-column layout. */
export type ResultsTab = 'metrics' | 'companies';

/** Filter state for local company filtering on the results step. */
export interface ResultsFilterState {
  fitRange: [number, number];
  employeeRange: [number, number];
  selectedIndustries: Set<string>;
}

/** Props passed from the page to the root flow component. */
export interface NewCampaignFlowProps {
  products: ProductSummary[];
  preselectedProductId: number | null;
}

/** Partner data enriched with industries & capacity for the selection grid. */
export type PartnerWithDetails = PartnerRead;

/** Computed histogram data extracted from search results for range filters. */
export interface FilterHistogramData {
  fitValues: number[];
  employeeValues: number[];
  revenueValues: number[];
  allIndustries: string[];
}

/** Props for TopBar, derived from wizard state. */
export interface TopBarProps {
  step: WizardStep;
  products: ProductSummary[];
  selectedProduct: ProductSummary | null;
  onProductSelect: (product: ProductSummary) => void;
  onSubmit: (query: string) => void;
  searchPhase: import('@/lib/schemas').WSSearchPhase;
  isSearching: boolean;
  /** Interpretation data from the agentic search for terminal display. */
  interpretation: import('@/lib/schemas').WSSearchInterpretation | null;
  inputResetKey: number;
  externalSubmitRef: React.MutableRefObject<((query: string) => void) | null>;
  externalPrefillRef: React.MutableRefObject<((query: string) => void) | null>;
  onClose: () => void;
  onRestart: () => void;
  onSelectPartners: () => void;
  hasCompanies: boolean;
  canContinue: boolean;
  selectedCapacity: number;
  targetCompanyCount: number;
  onBack: () => void;
  onContinue: () => void;
}
