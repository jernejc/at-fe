'use client';

import { useRouter } from 'next/navigation';
import { Link2Off } from 'lucide-react';
import { useCRMConnection } from '@/hooks/useCRMConnection';
import { cn } from '@/lib/utils';

interface CRMAnalyticsWrapperProps {
    children: React.ReactNode;
    className?: string;
}

export function CRMAnalyticsWrapper({ children, className }: CRMAnalyticsWrapperProps) {
    const router = useRouter();
    const { isConnected } = useCRMConnection();

    if (isConnected) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div
            className={cn("relative cursor-pointer group", className)}
            onClick={() => router.push('/partner/integrations')}
        >
            {/* Grayed out content */}
            <div className="grayscale opacity-50 pointer-events-none select-none space-y-4">
                {children}
            </div>

            {/* Overlay with badge */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 dark:bg-slate-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
                    <Link2Off className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Requires CRM Integration
                    </span>
                </div>
            </div>

            {/* Always visible badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-full border border-amber-200 dark:border-amber-700/50">
                <Link2Off className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    CRM Required
                </span>
            </div>
        </div>
    );
}
