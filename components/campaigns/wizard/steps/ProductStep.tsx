'use client';

import { motion } from 'framer-motion';
import { Package, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductSummary } from '@/lib/schemas';
import { SystemMessage } from '../ui/SystemMessage';
import { staggerContainer } from '@/lib/animations';

interface ProductStepProps {
    products: ProductSummary[];
    selectedProductId: number | null;
    onSelect: (product: ProductSummary) => void;
}

export function ProductStep({ products, selectedProductId, onSelect }: ProductStepProps) {
    return (
        <SystemMessage showAvatar={false}>
            <div className="space-y-4">
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-slate-600 dark:text-slate-400"
                >
                    Which product is this campaign for?
                </motion.p>
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                >
                    {products.map((product, index) => (
                        <motion.button
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                                delay: 0.3 + (index * 0.08),
                                type: "spring",
                                stiffness: 400,
                                damping: 25
                            }}
                            onClick={() => onSelect(product)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                                "hover:border-primary hover:shadow-lg hover:shadow-primary/5",
                                selectedProductId === product.id && "border-primary ring-2 ring-primary/20"
                            )}
                        >
                            <div 
                                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                            >
                                <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900 dark:text-white text-sm truncate">
                                    {product.name}
                                </div>
                                {product.category && (
                                    <div className="text-xs text-slate-500 truncate">
                                        {product.category}
                                    </div>
                                )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                    ))}
                </motion.div>
            </div>
        </SystemMessage>
    );
}
