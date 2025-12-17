'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CampaignBuilder } from '@/components/campaigns';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/ui/Header';

function NewCampaignContent() {
    const searchParams = useSearchParams();

    // Get pre-selected domains from URL query params (backward compatible)
    const domainsParam = searchParams.get('domains');
    const initialDomains = domainsParam
        ? domainsParam.split(',').filter(d => d.trim())
        : [];

    return <CampaignBuilder initialDomains={initialDomains} />;
}

function LoadingFallback() {
    return (
        <div className="h-screen bg-background overflow-hidden flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        </div>
    );
}

export default function NewCampaignPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <NewCampaignContent />
        </Suspense>
    );
}
