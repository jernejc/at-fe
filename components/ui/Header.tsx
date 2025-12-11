'use client';

import Link from 'next/link';
import { ProcessingStatus } from '@/components/processing/ProcessingStatus';
import Logo from './Logo';

export function Header() {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-border/80 shrink-0 z-20 sticky top-0">
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
                {/* Brand (Left) */}
                <Logo />

                {/* User Actions (Right) */}
                <div className="flex items-center gap-6 justify-end shrink-0">
                    <ProcessingStatus />
                    <Link href="/a2a/diagram" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">A2A</Link>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center text-xs font-semibold text-slate-600">
                        JD
                    </div>
                </div>
            </div>
        </div>
    );
}
