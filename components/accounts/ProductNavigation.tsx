"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Building2 } from "lucide-react";
import type { ProductSummary } from "@/lib/schemas";
import { cn } from "@/lib/utils";

// Color palette for product tabs
const PRODUCT_COLORS = [
    "#8b5cf6", // violet
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
];

interface ProductNavigationProps {
    products: ProductSummary[];
    selectedProductId: string;
    onSelectProduct: (id: string) => void;
    loading?: boolean;
}

export function ProductNavigation({
    products,
    selectedProductId,
    onSelectProduct,
    loading = false,
}: ProductNavigationProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Check scroll state
    const checkScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5); // 5px tolerance
    };

    // Initial check and event listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScroll();
            // Check again after a short delay to ensure layout is complete
            setTimeout(checkScroll, 100);
            
            window.addEventListener("resize", checkScroll);
            container.addEventListener("scroll", checkScroll);
            return () => {
                window.removeEventListener("resize", checkScroll);
                container.removeEventListener("scroll", checkScroll);
            };
        }
    }, [products, loading]); // Re-check when products change

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth / 2;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    const getProductColor = (index: number) => PRODUCT_COLORS[index % PRODUCT_COLORS.length];
    const isAllAccounts = selectedProductId === "all";

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-border/40 z-10 relative h-11">
            <div className="max-w-[1600px] mx-auto px-6 h-full flex items-stretch justify-between gap-4">
                
                {/* Scrollable Area Container */}
                <div className="relative flex-1 h-full overflow-hidden flex items-center">
                    
                    {/* Left Arrow */}
                    <div 
                        className={cn(
                            "absolute left-0 top-0 bottom-0 z-20 flex items-center pr-4 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 transition-opacity duration-200",
                            showLeftArrow ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        )}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-transparent text-muted-foreground hover:text-foreground"
                            onClick={() => scroll("left")}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Scrollable Content */}
                    <div 
                        ref={scrollContainerRef}
                        className="overflow-x-auto overflow-y-hidden scrollbar-hide flex-1 h-full flex items-center"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {loading ? (
                            <div className="flex items-center h-full gap-5 px-1">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-5 w-28 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse shrink-0" />
                                ))}
                            </div>
                        ) : (
                            <Tabs
                                value={selectedProductId}
                                onValueChange={onSelectProduct}
                                className="w-max h-full"
                            >
                                <TabsList
                                    className="bg-transparent !h-full p-0 gap-1 w-max rounded-none flex-nowrap items-center"
                                    style={{ border: "none" }}
                                >
                                    {/* All Accounts Tab */}
                                    <TabsTrigger
                                        value="all"
                                        className="relative h-full rounded-none px-3 font-medium text-[13px] text-muted-foreground/80 hover:text-foreground transition-all duration-200 whitespace-nowrap flex items-center gap-2"
                                        style={{
                                            border: "none",
                                            borderBottom: isAllAccounts
                                                ? "2px solid #3b82f6"
                                                : "2px solid transparent",
                                            color: isAllAccounts ? "#3b82f6" : undefined,
                                            background: isAllAccounts ? "rgba(59, 130, 246, 0.04)" : "transparent",
                                            boxShadow: "none",
                                            outline: "none",
                                        }}
                                    >
                                        <Building2 className="w-3.5 h-3.5" style={{ opacity: isAllAccounts ? 1 : 0.5 }} />
                                        All Accounts
                                    </TabsTrigger>

                                    {/* Product Tabs */}
                                    {products.map((product, index) => {
                                        const color = getProductColor(index);
                                        const isSelected = selectedProductId === product.id.toString();
                                        return (
                                            <TabsTrigger
                                                key={product.id}
                                                value={product.id.toString()}
                                                className="relative !h-full rounded-none px-3 font-medium text-[13px] text-muted-foreground/80 hover:text-foreground transition-all duration-200 whitespace-nowrap group flex items-center gap-2"
                                                style={{
                                                    border: "none",
                                                    borderBottom: isSelected
                                                        ? `2px solid ${color}`
                                                        : "2px solid transparent",
                                                    color: isSelected ? color : undefined,
                                                    background: isSelected ? `${color}08` : "transparent",
                                                    boxShadow: "none",
                                                    outline: "none",
                                                }}
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full transition-all duration-200 group-hover:scale-110"
                                                    style={{
                                                        backgroundColor: color,
                                                        opacity: isSelected ? 1 : 0.4,
                                                        boxShadow: isSelected ? `0 0 8px ${color}40` : "none",
                                                    }}
                                                />
                                                {product.name}
                                            </TabsTrigger>
                                        );
                                    })}
                                </TabsList>
                            </Tabs>
                        )}
                    </div>

                    {/* Right Arrow */}
                    <div 
                        className={cn(
                            "absolute right-0 top-0 bottom-0 z-20 flex items-center pl-4 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 transition-opacity duration-200",
                            showRightArrow ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                        )}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-full w-8 rounded-none hover:bg-transparent text-muted-foreground hover:text-foreground"
                            onClick={() => scroll("right")}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
