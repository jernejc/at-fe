'use client';

import type { FitSummaryFit } from '@/lib/schemas';
import { ProductRow, ProductRowSkeleton } from '@/components/ui/product-row';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';

interface DiscoveryProductsListProps {
  products: FitSummaryFit[];
  loading: boolean;
  error: string | null;
  selectedProductId: number | null;
  onProductClick: (productId: number) => void;
  /** Ref callback from useListKeyboardNav for keyboard arrow navigation. */
  getItemRef?: (key: string | number) => (el: HTMLElement | null) => void;
}

/** Renders a list of product fit rows with loading, error, and empty states. */
export function DiscoveryProductsList({
  products,
  loading,
  error,
  selectedProductId,
  onProductClick,
  getItemRef,
}: DiscoveryProductsListProps) {
  if (loading) return <ProductsListSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <AlertCircle className="size-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-foreground">No product fits found.</p>
        <p className="text-sm text-muted-foreground">
          No product fit scores have been calculated for this company yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-1">Product Fit Scores</h3>
        <p className="text-muted-foreground text-sm max-w-4xl">
          {products.length} product{products.length !== 1 ? 's' : ''} ranked by combined fit score.
        </p>
      </section>

      <section>
        <ProductTableHeader />
        <Separator />
        {products.map((product) => (
          <div key={product.product_id}>
            <ProductRow
              ref={getItemRef?.(product.product_id)}
              product={product}
              onClick={() => onProductClick(product.product_id)}
              isActive={selectedProductId === product.product_id}
              className="-mx-5"
            />
            <Separator />
          </div>
        ))}
      </section>
    </div>
  );
}

/** Column header row matching the ProductRow layout. */
function ProductTableHeader() {
  return (
    <div className="flex items-center gap-4 px-6 py-2 -mx-5 text-xs font-medium text-muted-foreground">
      <div className="w-12 shrink-0">Score</div>
      <div className="flex-1 min-w-0">Product</div>
      <div className="hidden md:flex items-center shrink-0 w-16">Likelihood</div>
    </div>
  );
}

function ProductsListSkeleton() {
  return (
    <div>
      <div className="h-5 w-40 bg-muted rounded animate-pulse mb-1" />
      <div className="h-3 w-64 bg-muted rounded animate-pulse mb-6" />
      <div className="h-4 w-48 bg-muted rounded animate-pulse mb-3" />
      <Separator />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <ProductRowSkeleton />
          <Separator />
        </div>
      ))}
    </div>
  );
}
