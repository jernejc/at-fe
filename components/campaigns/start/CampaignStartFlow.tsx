'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ProductSummary } from '@/lib/schemas';
import { useCampaignStartFlow } from '@/hooks/useCampaignStartFlow';
import { StepProgressIndicator } from './ui/StepProgressIndicator';
import { CampaignStartChat } from './CampaignStartChat';

interface CampaignStartFlowProps {
    products: ProductSummary[];
    preselectedProductId: number | null;
    selectRandomProduct: (products: ProductSummary[]) => ProductSummary | null;
}

export function CampaignStartFlow({
    products,
    preselectedProductId,
    selectRandomProduct,
}: CampaignStartFlowProps) {
    const router = useRouter();
    const flowState = useCampaignStartFlow({
        products,
        preselectedProductId,
        selectRandomProduct,
    });

    const { currentStep } = flowState;

    const handleClose = () => {
        router.push('/campaigns');
    };

    return (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden flex flex-col">
            {/* Header with progress */}
            <header className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className='w-8'></div>
                    {/* Step Progress */}
                    <StepProgressIndicator currentStep={currentStep} />

                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="shrink-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
            </header>

            {/* Main content area */}
            <main className="flex-1 overflow-hidden">
                {(currentStep === 'audience' || currentStep === 'partners') && (
                    <CampaignStartChat
                        products={products}
                        flowState={flowState}
                        currentStep={currentStep}
                    />
                )}

                {currentStep === 'summary' && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Campaign Summary
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Coming in Stage 3
                            </p>
                        </div>
                    </div>
                )}

                {currentStep === 'create' && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Create Campaign
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                Coming in Stage 4
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
