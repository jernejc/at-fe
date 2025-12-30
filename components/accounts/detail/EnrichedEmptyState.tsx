'use client';

import { useState } from 'react';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
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
            "flex flex-col items-center justify-center py-16 px-8 text-center min-h-[400px]",
            "bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-950/50",
            "rounded-xl border border-dashed border-slate-200 dark:border-slate-800",
            className
        )}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                {description}
            </p>

            <Button
                onClick={handleClick}
                disabled={isLoading}
                variant="secondary"
                className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {isLoading ? 'Generating...' : actionLabel}
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
    /** Optional text to display during loading state */
    loadingStatus?: string;
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
    loadingStatus,
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
                    <span className="hidden sm:inline">{isLoading && loadingStatus ? loadingStatus : actionLabel}</span>
                </button>
            </div>
        </div>
    );
}

interface PlaybookEmptyStateProps {
    products: ProductOption[];
    onAction: (productId: number) => Promise<void>;
    className?: string;
}

/**
 * Empty state for playbooks tab with product selector.
 * Requires product selection since API needs product_id for playbook generation.
 */
export function PlaybookEmptyState({
    products,
    onAction,
    className,
}: PlaybookEmptyStateProps) {
    const [selectedProductId, setSelectedProductId] = useState<number | null>(
        products.length > 0 ? products[0].id : null
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isLoading || !selectedProductId) return;
        setIsLoading(true);
        try {
            await onAction(selectedProductId);
        } finally {
            setIsLoading(false);
        }
    };

    const hasProducts = products.length > 0;

    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-16 px-8 text-center min-h-[400px]",
            "bg-gradient-to-b from-slate-50/50 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-950/50",
            "rounded-xl border border-dashed border-slate-200 dark:border-slate-800",
            className
        )}>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No sales playbooks generated
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
                Generate AI-powered playbooks with discovery questions, objection handling, and personalized outreach templates.
            </p>

            {hasProducts ? (
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProductId ?? ''}
                        onChange={(e) => setSelectedProductId(parseInt(e.target.value, 10))}
                        disabled={isLoading}
                        className="text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    >
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>

                    <Button
                        onClick={handleClick}
                        disabled={isLoading || !selectedProductId}
                        variant="secondary"
                        className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        {isLoading ? 'Generating...' : 'Generate Playbook'}
                    </Button>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    No products available. Create a product first to generate playbooks.
                </p>
            )}
        </div>
    );
}
