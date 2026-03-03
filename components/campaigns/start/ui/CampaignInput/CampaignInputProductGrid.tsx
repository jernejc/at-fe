'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { ProductSummary } from '@/lib/schemas';

interface CampaignInputProductGridProps {
  products: ProductSummary[];
  selectedProduct: ProductSummary | null;
  onSelect: (product: ProductSummary) => void;
}

/** Two-column selectable product grid with checkbox indicators. */
export function CampaignInputProductGrid({
  products,
  selectedProduct,
  onSelect,
}: CampaignInputProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {products.map((product) => {
        const isSelected = selectedProduct?.id === product.id;

        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
              'hover:bg-muted/50',
              isSelected && 'bg-primary/5'
            )}
          >
            {/* Checkbox indicator */}
            <div
              className={cn(
                'w-5 h-5 rounded shrink-0 flex items-center justify-center border transition-colors',
                isSelected
                  ? 'bg-primary border-primary'
                  : 'border-border bg-transparent'
              )}
            >
              {isSelected && (
                <Check className="w-3 h-3 text-primary-foreground" />
              )}
            </div>

            {/* Product name */}
            <span
              className={cn(
                'text-sm truncate',
                isSelected
                  ? 'font-semibold text-foreground'
                  : 'text-foreground'
              )}
            >
              {product.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
