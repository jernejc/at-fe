import type { ProductSummary, WSSearchPhase } from '@/lib/schemas';
import type { AgenticSearchState } from '@/hooks/useAgenticSearch';

/** States for the CampaignInput state machine. */
export type CampaignInputState = 'initial' | 'ready' | 'active' | 'closed';

/** A single user message in the internal chat. */
export interface CampaignInputMessage {
  id: string;
  text: string;
  timestamp: Date;
}

/** Props for the main CampaignInput component. */
export interface CampaignInputProps {
  /** Available products to select from. */
  products: ProductSummary[];
  /** Currently selected product (controlled). */
  selectedProduct: ProductSummary | null;
  /** Called when user selects a product. */
  onProductSelect: (product: ProductSummary) => void;
  /** Called when user submits a query. */
  onSubmit: (query: string) => void;
  /** Current WS search phase — drives terminal display. */
  searchPhase: WSSearchPhase;
  /** Whether a search is currently in progress. */
  isSearching: boolean;
  /** Full agentic search state for terminal details. */
  agenticState?: AgenticSearchState;
  /** Optional className for the root container. */
  className?: string;
  /** Mutable ref populated with a function to programmatically submit a query. */
  externalSubmitRef?: React.MutableRefObject<((query: string) => void) | null>;
}

/** Return type of the useCampaignInput hook. */
export interface UseCampaignInputReturn {
  componentState: CampaignInputState;
  inputValue: string;
  messages: CampaignInputMessage[];
  isProductGridOpen: boolean;

  canSend: boolean;
  showChat: boolean;
  showTerminal: boolean;
  lastMessageText: string | null;

  inputRef: React.RefObject<HTMLInputElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;

  setInputValue: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleProductSelect: (product: ProductSummary) => void;
  handleReopen: () => void;
  toggleProductGrid: () => void;
  handleContainerBlur: (e: React.FocusEvent) => void;
  submitExternal: (query: string) => void;
}
