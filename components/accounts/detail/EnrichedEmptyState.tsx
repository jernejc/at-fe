'use client';

import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnrichedEmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => Promise<void>;
    isLoading?: boolean;
    className?: string;
}

/**
 * Rich empty state component with contextual CTA for data generation.
 * Used when a tab has no data and offers an action to fetch/generate it.
 */
export function EnrichedEmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    isLoading: externalLoading,
    className,
}: EnrichedEmptyStateProps) {
    const [internalLoading, setInternalLoading] = useState(false);
    const isLoading = externalLoading ?? internalLoading;

    const handleClick = async () => {
        if (isLoading) return;
        setInternalLoading(true);
        try {
            await onAction();
        } finally {
            setInternalLoading(false);
        }
    };

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-8 text-center",
            "bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-950/50",
            "rounded-xl border border-dashed border-slate-200 dark:border-slate-800",
            className
        )}>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 mb-4">
                <div className="text-slate-400 dark:text-slate-500">
                    {icon}
                </div>
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {description}
            </p>

            <Button
                onClick={handleClick}
                disabled={isLoading}
                className="gap-2 shadow-sm"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <RefreshCw className="w-4 h-4" />
                )}
                {isLoading ? 'Processing...' : actionLabel}
            </Button>
        </div>
    );
}

export interface ProductOption {
    id: number;
    name: string;
}

interface TabHeaderWithActionProps {
    title: string;
    count?: number;
    actionLabel: string;
    onAction: (productId?: number) => Promise<void>;
    isLoading?: boolean;
    color?: string;
    /** Optional list of products for dropdown selection */
    products?: ProductOption[];
    /** Currently selected product ID */
    selectedProductId?: number;
    /** Callback when product selection changes */
    onProductChange?: (productId: number) => void;
}

/**
 * Section header with a regenerate/refresh action button.
 * Used when a tab has data but user may want to re-fetch or regenerate.
 * Optionally supports a product dropdown for product-specific actions.
 */
export function TabHeaderWithAction({
    title,
    count,
    actionLabel,
    onAction,
    isLoading: externalLoading,
    color = "bg-blue-600",
    products,
    selectedProductId,
    onProductChange,
}: TabHeaderWithActionProps) {
    const [internalLoading, setInternalLoading] = useState(false);
    const isLoading = externalLoading ?? internalLoading;

    const handleClick = async () => {
        if (isLoading) return;
        setInternalLoading(true);
        try {
            await onAction(selectedProductId);
        } finally {
            setInternalLoading(false);
        }
    };

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = parseInt(e.target.value, 10);
        onProductChange?.(productId);
    };

    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-1 h-5 rounded-full", color)} />
            <h3 className="font-semibold">{title}</h3>
            {count !== undefined && <span className="text-sm text-muted-foreground">({count})</span>}

            <div className="ml-auto flex items-center gap-2">
                {/* Product selector dropdown */}
                {products && products.length > 0 && (
                    <select
                        value={selectedProductId ?? products[0]?.id}
                        onChange={handleProductChange}
                        disabled={isLoading}
                        className="text-xs font-medium text-muted-foreground bg-transparent border border-border rounded-md px-2 py-1 hover:border-primary/50 focus:border-primary focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                )}

                <button
                    onClick={handleClick}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                    title={actionLabel}
                >
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{actionLabel}</span>
                </button>
            </div>
        </div>
    );
}
