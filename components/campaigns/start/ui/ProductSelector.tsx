'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Package, ChevronDown, Check } from 'lucide-react';
import type { ProductSummary } from '@/lib/schemas';

interface ProductSelectorProps {
    products: ProductSummary[];
    selectedProduct: ProductSummary | null;
    onSelect: (product: ProductSummary) => void;
    className?: string;
    disabled?: boolean;
}

export function ProductSelector({ products, selectedProduct, onSelect, className, disabled = false }: ProductSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (product: ProductSummary) => {
        onSelect(product);
        setIsOpen(false);
    };

    return (
        <div className={cn('relative mx-11', className)}>
            {/* Trigger button - card style */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700',
                    disabled
                        ? 'opacity-60 cursor-not-allowed'
                        : 'hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm',
                    isOpen && !disabled && 'border-primary ring-2 ring-primary/20'
                )}
            >
                {/* Product icon/logo */}
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                        {selectedProduct?.name || 'Select a product'}
                    </div>
                    {selectedProduct?.category && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {selectedProduct.category}
                        </div>
                    )}
                </div>

                {/* Chevron - hidden when disabled */}
                {!disabled && (
                    <ChevronDown className={cn(
                        'w-4 h-4 text-slate-400 transition-transform shrink-0',
                        isOpen && 'rotate-180'
                    )} />
                )}
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && !disabled && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                                'absolute z-20 top-full left-0 right-0 mt-2',
                                'bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700',
                                'shadow-lg overflow-hidden max-h-64 overflow-y-auto'
                            )}
                        >
                            {products.map((product) => {
                                const isSelected = selectedProduct?.id === product.id;
                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => handleSelect(product)}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3 transition-colors text-left',
                                            'hover:bg-slate-50 dark:hover:bg-slate-800',
                                            isSelected && 'bg-primary/5'
                                        )}
                                    >
                                        {/* Product icon */}
                                        <div className={cn(
                                            'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                                            isSelected
                                                ? 'bg-primary/20'
                                                : 'bg-slate-100 dark:bg-slate-800'
                                        )}>
                                            <Package className={cn(
                                                'w-4 h-4',
                                                isSelected
                                                    ? 'text-primary'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            )} />
                                        </div>

                                        {/* Product info */}
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                'font-medium text-sm truncate',
                                                isSelected
                                                    ? 'text-primary'
                                                    : 'text-slate-900 dark:text-white'
                                            )}>
                                                {product.name}
                                            </div>
                                            {product.category && (
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                    {product.category}
                                                </div>
                                            )}
                                        </div>

                                        {/* Checkmark */}
                                        {isSelected && (
                                            <Check className="w-4 h-4 text-primary shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
