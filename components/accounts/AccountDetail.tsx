'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { startProcessing, ProcessingOptions } from '@/lib/api';
import { useAccountDetail, useAccountModals } from './detail/hooks';
import { AccountDetailHeader } from './detail/AccountDetailHeader';
import { AccountDetailTabs } from './detail/AccountDetailTabs';
import { AccountDetailContent } from './detail/AccountDetailContent';
import { EmployeeDetailModal } from './detail/EmployeeDetailModal';
import { FitBreakdownSheet } from './detail/FitBreakdownSheet';
import { SignalProvenanceSheet } from './detail/SignalProvenanceSheet';
import { JobDetailSheet } from './detail/JobDetailSheet';

interface AccountDetailProps {
    domain: string;
    open: boolean;
    onClose: () => void;
}

export function AccountDetail({ domain, open, onClose }: AccountDetailProps) {
    const [activeTab, setActiveTab] = useState('overview');

    // Data fetching
    const {
        data,
        playbooks,
        explainability,
        decisionMakers,
        employees,
        jobs,
        jobsTotal,
        news,
        newsTotal,
        loading,
        loadMoreJobs,
        loadMoreNews,
        loadingMoreJobs,
        loadingMoreNews,
        refetch,
        refetchExplainability,
        refetchPlaybooks,
        allProducts,
    } = useAccountDetail(domain, open);

    // Modal management
    const {
        employeeModal,
        fitModal,
        signalModal,
        jobModal,
        handleEmployeeClick,
        handleCloseEmployeeModal,
        handleFitClick,
        handleCloseFitModal,
        handleSignalClick,
        handleCloseSignalModal,
        handleJobClick,
        handleCloseJobModal,
        handlePlaybookEmployeeClick,
        playbookContext,
    } = useAccountModals(domain, explainability);

    // Reset tab when opening
    useEffect(() => {
        if (open) {
            setActiveTab('overview');
        }
    }, [open, domain]);

    // Processing handler that accepts options for contextual actions
    const handleProcess = useCallback(async (options?: ProcessingOptions) => {
        if (!domain) return;

        const minLoading = new Promise(resolve => setTimeout(resolve, 800));

        try {
            await Promise.all([startProcessing(domain, options), minLoading]);
            refetch();
        } catch (error) {
            console.error('Failed to trigger processing:', error);
            throw error;
        }
    }, [domain, refetch]);

    // Targeted handler for regenerating signals/fits (no data refresh)
    const handleRegenerateExplainability = useCallback(async (productId?: number) => {
        if (!domain) return;
        const minLoading = new Promise(resolve => setTimeout(resolve, 800));
        try {
            await Promise.all([
                startProcessing(domain, {
                    generate_signals: true,
                    generate_fits: true,
                    refresh_data: false,
                    product_id: productId
                }),
                minLoading
            ]);
            await refetchExplainability();
        } catch (error) {
            console.error('Failed to regenerate signals/fits:', error);
            throw error;
        }
    }, [domain, refetchExplainability]);

    // Targeted handler for regenerating playbooks (no data refresh)
    const handleRegeneratePlaybooks = useCallback(async () => {
        if (!domain) return;
        const minLoading = new Promise(resolve => setTimeout(resolve, 800));
        try {
            await Promise.all([
                startProcessing(domain, {
                    generate_playbook: true,
                    refresh_data: false
                }),
                minLoading
            ]);
            await refetchPlaybooks();
        } catch (error) {
            console.error('Failed to regenerate playbooks:', error);
            throw error;
        }
    }, [domain, refetchPlaybooks]);

    const company = data?.company;

    // Derived counts for tabs
    const tabCounts = {
        playbooks: playbooks.length,
        employees: data?.counts.employees || 0,
        jobs: jobsTotal,
        news: newsTotal,
        updates: company?.updates?.length || 0,
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onClose}>
                <SheetContent
                    side="bottom"
                    className="h-[91vh] p-0 flex flex-col bg-background border-t border-border shadow-2xl transition-all duration-500 ease-in-out gap-0 rounded-t-xl"
                >
                    {loading ? (
                        <LoadingState />
                    ) : company ? (
                        <div className="flex flex-col h-full overflow-hidden rounded-t-xl">
                            <AccountDetailHeader
                                company={company}
                            />

                            <AccountDetailTabs
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                counts={tabCounts}
                                hasExplainability={!!explainability}
                            />

                            <AccountDetailContent
                                activeTab={activeTab}
                                company={company}
                                domain={domain}
                                explainability={explainability}
                                playbooks={playbooks}
                                decisionMakers={decisionMakers}
                                employees={employees}
                                jobs={jobs}
                                jobsTotal={jobsTotal}
                                news={news}
                                newsTotal={newsTotal}
                                onSelectEmployee={handleEmployeeClick}
                                onSelectFit={handleFitClick}
                                onSelectSignal={handleSignalClick}
                                onSelectJob={handleJobClick}
                                onSelectPlaybookEmployee={handlePlaybookEmployeeClick}
                                onLoadMoreJobs={loadMoreJobs}
                                onLoadMoreNews={loadMoreNews}
                                loadingMoreJobs={loadingMoreJobs}
                                loadingMoreNews={loadingMoreNews}
                                employeeCount={data?.counts.employees || 0}
                                onProcess={handleProcess}
                                onRegenerateExplainability={handleRegenerateExplainability}
                                onRegeneratePlaybooks={handleRegeneratePlaybooks}
                                allProducts={allProducts}
                            />
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </SheetContent>
            </Sheet>

            <EmployeeDetailModal
                employee={employeeModal.employee}
                open={employeeModal.open}
                onClose={handleCloseEmployeeModal}
                isLoading={employeeModal.loading}
                playbookContext={playbookContext}
            />

            <FitBreakdownSheet
                open={fitModal.open}
                onOpenChange={handleCloseFitModal}
                fit={fitModal.fit}
                isLoading={fitModal.loading}
            />

            <SignalProvenanceSheet
                open={signalModal.open}
                onOpenChange={handleCloseSignalModal}
                signal={signalModal.signal}
                isLoading={signalModal.loading}
            />

            <JobDetailSheet
                job={jobModal.job}
                isOpen={jobModal.open}
                onClose={handleCloseJobModal}
            />
        </>
    );
}

function LoadingState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground animate-pulse">
                Loading company intelligence...
            </p>
        </div>
    );
}

function EmptyState() {
    return (
        <>
            <SheetHeader className="sr-only">
                <SheetTitle>Not found</SheetTitle>
            </SheetHeader>
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="font-medium">Company not found</p>
            </div>
        </>
    );
}
