'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    /** Current page number (1-indexed) */
    currentPage: number;
    /** Total number of items */
    totalCount: number;
    /** Number of items per page */
    pageSize: number;
    /** Callback when page changes */
    onPageChange: (page: number) => void;
    /** Optional: Show page jump input for large datasets */
    showPageJump?: boolean;
}

/**
 * Reusable pagination component with page numbers, prev/next buttons, and optional page jump.
 */
export function Pagination({
    currentPage,
    totalCount,
    pageSize,
    onPageChange,
    showPageJump = true,
}: PaginationProps) {
    const totalPages = Math.ceil(totalCount / pageSize);

    // Don't render if only one page
    if (totalPages <= 1) return null;

    // Generate page numbers with smart ellipsis
    const generatePageNumbers = (): (number | string)[] => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className="sticky bottom-0 z-20 border-t border-border/30 bg-gradient-to-r from-slate-50/95 via-white/95 to-slate-50/95 dark:from-slate-900/95 dark:via-slate-950/95 dark:to-slate-900/95 backdrop-blur-sm">
            <div className="max-w-[1600px] mx-auto px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Page Info */}
                    <div className="text-sm text-muted-foreground font-medium">
                        Page {currentPage} of {totalPages}
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1">
                        {/* Previous Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Page Numbers */}
                        {generatePageNumbers().map((pageNum, idx) => {
                            if (pageNum === '...') {
                                return (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(pageNum as number)}
                                    className="h-8 w-8 p-0"
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        {/* Next Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage >= totalPages}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Jump to page (optional, only show if many pages) */}
                    {showPageJump && totalPages > 10 && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Go to:</span>
                            <Input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={currentPage}
                                onChange={(e) => {
                                    const newPage = parseInt(e.target.value);
                                    if (newPage >= 1 && newPage <= totalPages) {
                                        onPageChange(newPage);
                                    }
                                }}
                                className="h-8 w-16 text-center text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
