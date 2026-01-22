'use client';

import { motion } from 'framer-motion';

const pulseAnimation = {
    animate: { opacity: [0.5, 0.8, 0.5] },
    transition: { duration: 1.5, repeat: Infinity },
};

function SkeletonBox({ className }: { className: string }) {
    return (
        <motion.div
            className={`bg-slate-200 dark:bg-slate-700 rounded ${className}`}
            {...pulseAnimation}
        />
    );
}

export function CompanyDetailSkeleton() {
    return (
        <div className="p-4 space-y-6">
            {/* Header skeleton */}
            <div className="flex items-start gap-4">
                <SkeletonBox className="w-16 h-16 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-6 w-48" />
                    <SkeletonBox className="h-4 w-32" />
                    <div className="flex items-center gap-2 mt-2">
                        <SkeletonBox className="h-5 w-20 rounded-full" />
                        <SkeletonBox className="h-5 w-24 rounded-full" />
                        <SkeletonBox className="h-5 w-16 rounded-full" />
                    </div>
                </div>
            </div>

            {/* About section skeleton */}
            <div className="space-y-3">
                <SkeletonBox className="h-4 w-16" />
                <div className="space-y-2">
                    <SkeletonBox className="h-3 w-full" />
                    <SkeletonBox className="h-3 w-full" />
                    <SkeletonBox className="h-3 w-3/4" />
                </div>
            </div>

            {/* Company Details grid skeleton */}
            <div className="space-y-3">
                <SkeletonBox className="h-4 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <SkeletonBox className="h-3 w-16" />
                            <SkeletonBox className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Specialties skeleton */}
            <div className="space-y-3">
                <SkeletonBox className="h-4 w-24" />
                <div className="flex flex-wrap gap-2">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonBox key={i} className="h-6 w-20 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Product Fit skeleton */}
            <div className="space-y-3">
                <SkeletonBox className="h-4 w-24" />
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                            <div className="flex items-center gap-3">
                                <SkeletonBox className="w-12 h-12 rounded-lg" />
                                <SkeletonBox className="h-5 w-32" />
                            </div>
                            <SkeletonBox className="h-3 w-full" />
                            <div className="space-y-2">
                                <SkeletonBox className="h-2 w-full rounded-full" />
                                <SkeletonBox className="h-2 w-3/4 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Signal Intelligence skeleton */}
            <div className="space-y-3">
                <SkeletonBox className="h-4 w-36" />
                <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                            <SkeletonBox className="h-4 w-24" />
                            <SkeletonBox className="h-3 w-full" />
                            <SkeletonBox className="h-2 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
