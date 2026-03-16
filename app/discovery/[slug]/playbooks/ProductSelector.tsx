'use client';

import { Menu } from '@base-ui/react/menu';
import { ChevronDown, Check, BookCheck, BookDashed } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductSummary } from '@/lib/schemas';
import {
  Dashboard,
  DashboardCell,
  DashboardCellTitle,
  DashboardCellBody,
} from '@/components/ui/dashboard';

const popupStyles =
  'bg-popover text-popover-foreground ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100';

const itemStyles =
  'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

interface ProductSelectorProps {
  products: ProductSummary[];
  selectedProductId: number | null;
  onSelectProduct: (productId: number) => void;
  productIdsWithPlaybook: Set<number>;
  loading?: boolean;
}

/** Dashboard widget for selecting a product to view its playbook. */
export function ProductSelector({
  products,
  selectedProductId,
  onSelectProduct,
  productIdsWithPlaybook,
  loading,
}: ProductSelectorProps) {
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <Dashboard>
      <DashboardCell size="full" height="auto">
        <DashboardCellTitle>Selected Product</DashboardCellTitle>
        <DashboardCellBody>
          {loading ? (
            <div className="w-48 h-9 bg-muted rounded-lg animate-pulse" />
          ) : products.length === 0 ? (
            <span>No products available</span>
          ) : (
            <Menu.Root modal={false}>
              <Menu.Trigger
                className={cn(
                  'rounded-md transition-colors flex items-center justify-between w-full pl-2 pr-6 -ml-2',
                  'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {selectedProduct?.name ?? 'Select a product'}
                <ChevronDown className="size-4" />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner side="bottom" align="center" sideOffset={4} className="isolate z-50">
                  <Menu.Popup className={popupStyles}>
                    {products.map((p) => {
                      const isActive = p.id === selectedProductId;
                      return (
                        <Menu.Item
                          key={p.id}
                          className={cn(itemStyles, 'justify-between pr-1.5')}
                          onClick={() => onSelectProduct(p.id)}
                        >
                          <span className="flex items-center gap-2">
                            {productIdsWithPlaybook.has(p.id) ? (
                              <BookCheck className="size-3.5 text-muted-foreground" />
                            ) : (
                              <BookDashed className="size-3.5 text-muted-foreground" />
                            )}
                            {p.name}
                          </span>
                          {isActive && (
                            <Check className="size-3.5 text-muted-foreground" />
                          )}
                        </Menu.Item>
                      );
                    })}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          )}
        </DashboardCellBody>
      </DashboardCell>
    </Dashboard>
  );
}
