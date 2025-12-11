'use client';

import Link from 'next/link';
import { ProcessingStatus } from '@/components/processing/ProcessingStatus';

export function Header() {
    return (
        <div className="bg-white dark:bg-slate-900 border-b border-border/80 shrink-0 z-20 sticky top-0">
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
                {/* Brand (Left) */}
                <div className="flex items-center gap-3 shrink-0 w-60 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => window.location.href = '/'}>
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <div className="flex flex-col align-center">
                        <h1 className="text-lg font-bold tracking-tight text-foreground leading-none font-display mt-1">LookAcross</h1>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Account Intelligence</p>
                    </div>
                </div>

                {/* User Actions (Right) */}
                <div className="flex items-center gap-6 justify-end shrink-0">
                    <ProcessingStatus />
                    <Link href="/a2a/diagram" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">A2A Diagram</Link>
                    <Link href="/a2a/health" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">A2A Health</Link>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center text-xs font-semibold text-slate-600">
                        JD
                    </div>
                </div>
            </div>
        </div>
    );
}
