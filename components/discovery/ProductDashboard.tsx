'use client';

import type { FitSummaryFit } from '@/lib/schemas';
import { normalizeScore } from '@/lib/utils';
import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';
import { FitScoreIndicator } from '@/components/ui/fit-score-indicator';
import { CircularProgress } from '@/components/ui/circular-progress';
import { ProductCard } from './ProductCard';

interface Narratives {
  signal: string | null;
  interest: string | null;
  event: string | null;
}

interface ProductDashboardProps {
  products: FitSummaryFit[];
  selectedProductId: number | null;
  selectedProduct: FitSummaryFit | null;
  onSelectProduct: (id: number) => void;
  onClearProduct: () => void;
  /** Pre-computed normalized score (0-100). */
  score: number | null;
  /** Pre-computed normalized likelihood (0-100). */
  likelihood: number | null;
  narratives: Narratives;
  loading?: boolean;
  error?: string | null;
}

/** Dashboard card with product horizontal scroller and conditional detail row. */
export function ProductDashboard({
  products,
  selectedProductId,
  selectedProduct,
  onSelectProduct,
  onClearProduct,
  score,
  likelihood,
  narratives,
  loading,
  error,
}: ProductDashboardProps) {
  if (loading) return <ProductDashboardSkeleton />;
  if (error) return null;

  return (
    <Dashboard>
      {/* Row 1: Product scroller */}
      <DashboardCell size="full" height="auto">
        <DashboardCellTitle>Product</DashboardCellTitle>
        <div className="flex gap-3 overflow-x-auto mt-3 pb-1 -mx-8 px-8">
          <ProductCard
            label="None"
            isSelected={selectedProductId == null}
            onClick={onClearProduct}
          />
          {products.map((p) => (
            <ProductCard
              key={p.product_id}
              label={p.product_name}
              score={Math.round(normalizeScore(p.combined_score))}
              isSelected={selectedProductId === p.product_id}
              onClick={() => onSelectProduct(p.product_id)}
            />
          ))}
        </div>
      </DashboardCell>

      {/* Row 2: Detail cells (only when product selected) */}
      {selectedProduct && score != null && likelihood != null && (
        <>
          <DashboardCell size="quarter" height="auto" gradient={score > 75 ? 'green' : undefined}>
            <DashboardCellTitle>Product fit</DashboardCellTitle>
            <DashboardCellBody className="flex items-end justify-between">
              <FitScoreIndicator score={score} size={48} showChange={false} showValue={false} />
              <span>{score}%</span>
            </DashboardCellBody>
          </DashboardCell>
          <DashboardCell size="quarter" height="auto" gradient={likelihood > 75 ? 'green' : undefined}>
            <DashboardCellTitle>Likelihood</DashboardCellTitle>
            <DashboardCellBody className="flex items-end justify-between">
              <CircularProgress value={likelihood} size={48} />
              <span>{likelihood}%</span>
            </DashboardCellBody>
          </DashboardCell>
          <DashboardCell size="half" height="auto">
            <DashboardCellTitle>Fit reasoning</DashboardCellTitle>
            <DashboardCellBody className="text-sm font-light font-sans">
              {selectedProduct.fit_explanation ?? 'No reasoning available.'}
            </DashboardCellBody>
          </DashboardCell>
        </>
      )}

      {/* Row 3: Narratives (always visible) */}
      {narratives.interest && (
        <DashboardCell size="half" height="auto" justify="start">
          <DashboardCellTitle>Interest analysis</DashboardCellTitle>
          <DashboardCellBody className="text-sm font-light font-sans">
            {narratives.interest}
          </DashboardCellBody>
        </DashboardCell>
      )}
      {narratives.event && (
        <DashboardCell size="half" height="auto" justify="start">
          <DashboardCellTitle>Event analysis</DashboardCellTitle>
          <DashboardCellBody className="text-sm font-light font-sans">
            {narratives.event}
          </DashboardCellBody>
        </DashboardCell>
      )}
    </Dashboard>
  );
}

function ProductDashboardSkeleton() {
  return (
    <Dashboard>
      {/* Product scroller */}
      <DashboardCell size="full" height="auto">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        <div className="flex gap-3 mt-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[72px] min-w-40 flex-1 bg-muted rounded-sm animate-pulse shrink-0" />
          ))}
        </div>
      </DashboardCell>
      {/* Narrative cells */}
      <DashboardCell size="half" height="auto">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="mt-2 space-y-1.5">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
        </div>
      </DashboardCell>
      <DashboardCell size="half" height="auto">
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
        <div className="mt-2 space-y-1.5">
          <div className="h-3 w-full bg-muted rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
        </div>
      </DashboardCell>
    </Dashboard>
  );
}
