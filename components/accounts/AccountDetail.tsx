'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { startProcessing, waitForProcessingComplete, generateCompanyPlaybook, ProcessingOptions } from '@/lib/api';
import { useAccountDetail, useAccountModals } from '@/hooks';
import { AccountDetailHeader } from './detail/AccountDetailHeader';
import { AccountDetailTabs } from './detail/AccountDetailTabs';
import { AccountDetailContent } from './detail/AccountDetailContent';
import { EmployeeDetailModal } from './detail/EmployeeDetailModal';
import { FitBreakdownSheet } from './detail/FitBreakdownSheet';
import { SignalProvenanceSheet } from './detail/SignalProvenanceSheet';
import { JobDetailSheet } from './detail/JobDetailSheet';
import { KeyStakeholderSheet } from './detail/KeyStakeholderSheet';

interface AccountDetailProps {
    domain: string;
    open: boolean;
    onClose: () => void;
}

export function AccountDetail({ domain, open, onClose }: AccountDetailProps) {
    const [activeTab, setActiveTab] = useState('overview');

    const {
        data,
        playbooks,
        explainability,
        decisionMakers,
        employees,
        employeesTotal,
        jobs,
        jobsTotal,
        news,
        newsTotal,
        loading,
        loadMoreJobs,
        loadMoreNews,
        loadMoreEmployees,
        loadingMoreJobs,
        loadingMoreNews,
        loadingMoreEmployees,
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
        stakeholderModal,
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
        handleStakeholderClick,
        handleCloseStakeholderModal,
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
    const handleRegenerateExplainability = useCallback(async (onProgress?: (status: string) => void) => {
        if (!domain) return;
        try {
            // Start processing
            const response = await startProcessing(domain, {
                generate_signals: true,
                generate_fits: true,
                refresh_data: false,
            });

            // Wait for processing to complete via SSE stream
            if (response?.process_id) {
                await waitForProcessingComplete(domain, response.process_id, onProgress);
            }

            // Now refresh the data
            await refetchExplainability();
        } catch (error) {
            console.error('Failed to regenerate signals/fits:', error);
            throw error;
        }
    }, [domain, refetchExplainability]);

    // Targeted handler for regenerating playbooks (no data refresh)
    const handleRegeneratePlaybooks = useCallback(async (productId?: number, onProgress?: (status: string) => void) => {
        if (!domain || !productId) return;
        try {
            // Use dedicated generate-playbook endpoint
            const response = await generateCompanyPlaybook(domain, productId);

            // Wait for processing to complete via SSE stream
            if (response?.process_id) {
                await waitForProcessingComplete(domain, response.process_id, onProgress);
            }

            // Now refresh the playbooks data
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
                                employeesTotal={employeesTotal}
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
                                onLoadMoreEmployees={loadMoreEmployees}
                                loadingMoreJobs={loadingMoreJobs}
                                loadingMoreNews={loadingMoreNews}
                                loadingMoreEmployees={loadingMoreEmployees}
                                employeeCount={data?.counts.employees || 0}
                                onProcess={handleProcess}
                                onRegenerateExplainability={handleRegenerateExplainability}
                                onRegeneratePlaybooks={handleRegeneratePlaybooks}
                                allProducts={allProducts}
                                onSelectStakeholder={handleStakeholderClick}
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

            <KeyStakeholderSheet
                open={stakeholderModal.open}
                onOpenChange={handleCloseStakeholderModal}
                contact={stakeholderModal.stakeholder}
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
