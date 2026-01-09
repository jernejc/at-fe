'use client';

import { useState, useCallback } from 'react';
import { getEmployee, getFitBreakdown, getSignalProvenance } from '@/lib/api';
import { EmployeeRead, EmployeeSummary, FitScore, CompanyExplainabilityResponse, JobPostingSummary, PlaybookContext, PlaybookContactResponse } from '@/lib/schemas';
import { SignalProvenanceResponse } from '@/lib/schemas/provenance';

interface EmployeeModalState {
    employee: EmployeeRead | null;
    open: boolean;
    loading: boolean;
}

interface FitModalState {
    fit: FitScore | null;
    open: boolean;
    loading: boolean;
}

interface SignalModalState {
    signal: SignalProvenanceResponse | null;
    open: boolean;
    loading: boolean;
}

interface JobModalState {
    job: JobPostingSummary | null;
    open: boolean;
}

interface StakeholderModalState {
    stakeholder: PlaybookContactResponse | null;
    open: boolean;
}

interface UseAccountModalsReturn {
    employeeModal: EmployeeModalState;
    fitModal: FitModalState;
    signalModal: SignalModalState;
    jobModal: JobModalState;
    stakeholderModal: StakeholderModalState;
    handleEmployeeClick: (employee: EmployeeSummary) => void;
    handleCloseEmployeeModal: () => void;
    handleFitClick: (productId: number) => void;
    handleCloseFitModal: (open: boolean) => void;
    handleSignalClick: (signalId: number) => void;
    handleCloseSignalModal: (open: boolean) => void;
    handleJobClick: (job: JobPostingSummary) => void;
    handleCloseJobModal: () => void;
    handlePlaybookEmployeeClick: (employeeId: number | null, preview: { name: string; title?: string }, context: PlaybookContext) => void;
    playbookContext: PlaybookContext | null;
    handleStakeholderClick: (contact: PlaybookContactResponse) => void;
    handleCloseStakeholderModal: (open: boolean) => void;
}

export function useAccountModals(
    domain: string,
    explainability: CompanyExplainabilityResponse | null
): UseAccountModalsReturn {
    // Employee modal state
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [loadingEmployee, setLoadingEmployee] = useState(false);

    // Fit breakdown modal state
    const [selectedFit, setSelectedFit] = useState<FitScore | null>(null);
    const [fitModalOpen, setFitModalOpen] = useState(false);
    const [loadingFit, setLoadingFit] = useState(false);

    // Signal provenance modal state
    const [selectedSignal, setSelectedSignal] = useState<SignalProvenanceResponse | null>(null);
    const [signalModalOpen, setSignalModalOpen] = useState(false);
    const [loadingSignal, setLoadingSignal] = useState(false);

    // Job detail modal state
    const [selectedJob, setSelectedJob] = useState<JobPostingSummary | null>(null);
    const [jobModalOpen, setJobModalOpen] = useState(false);

    // Stakeholder modal state
    const [selectedStakeholder, setSelectedStakeholder] = useState<PlaybookContactResponse | null>(null);
    const [stakeholderModalOpen, setStakeholderModalOpen] = useState(false);

    // Playbook context for employee modal
    const [playbookContext, setPlaybookContext] = useState<PlaybookContext | null>(null);

    const handleEmployeeClick = useCallback((employee: EmployeeSummary) => {
        setLoadingEmployee(true);
        setEmployeeModalOpen(true);
        getEmployee(employee.id, { include_posts: true })
            .then(res => {
                setSelectedEmployee(res.employee);
                setLoadingEmployee(false);
            })
            .catch(err => {
                console.error("Failed to fetch employee", err);
                setLoadingEmployee(false);
            });
    }, []);

    const handleCloseEmployeeModal = useCallback(() => {
        setEmployeeModalOpen(false);
        setTimeout(() => {
            setSelectedEmployee(null);
            setPlaybookContext(null);
        }, 300);
    }, []);

    const handleFitClick = useCallback((productId: number) => {
        const fit = explainability?.fits_summary.find(f => f.product_id === productId);
        if (fit) {
            setLoadingFit(true);
            setFitModalOpen(true);
            getFitBreakdown(domain, productId)
                .then(res => {
                    setSelectedFit(res);
                    setLoadingFit(false);
                })
                .catch(err => {
                    console.error("Failed to fetch fit breakdown", err);
                    setLoadingFit(false);
                });
        }
    }, [domain, explainability]);

    const handleCloseFitModal = useCallback((open: boolean) => {
        setFitModalOpen(open);
    }, []);

    const handleSignalClick = useCallback((signalId: number) => {
        setLoadingSignal(true);
        setSignalModalOpen(true);
        getSignalProvenance(domain, signalId)
            .then(res => {
                setSelectedSignal(res);
                setLoadingSignal(false);
            })
            .catch(err => {
                console.error("Failed to fetch provenance", err);
                setLoadingSignal(false);
            });
    }, [domain]);

    const handleCloseSignalModal = useCallback((open: boolean) => {
        setSignalModalOpen(open);
    }, []);

    const handleJobClick = useCallback((job: JobPostingSummary) => {
        setSelectedJob(job);
        setJobModalOpen(true);
    }, []);

    const handleCloseJobModal = useCallback(() => {
        setJobModalOpen(false);
        setTimeout(() => setSelectedJob(null), 300);
    }, []);

    const handleStakeholderClick = useCallback((contact: PlaybookContactResponse) => {
        setSelectedStakeholder(contact);
        setStakeholderModalOpen(true);
    }, []);

    const handleCloseStakeholderModal = useCallback((open: boolean) => {
        setStakeholderModalOpen(open);
        if (!open) {
            setTimeout(() => setSelectedStakeholder(null), 300);
        }
    }, []);

    const handlePlaybookEmployeeClick = useCallback((employeeId: number | null, preview: { name: string; title?: string }, context: PlaybookContext) => {
        // Set context first
        setPlaybookContext(context);

        // Set initial employee preview
        setSelectedEmployee({
            id: employeeId || 0,
            full_name: preview.name,
            current_title: preview.title,
        } as unknown as EmployeeRead);

        setLoadingEmployee(true);
        setEmployeeModalOpen(true);

        // Fetch full employee details if we have an ID
        if (employeeId) {
            getEmployee(employeeId, { include_posts: true })
                .then(res => {
                    setSelectedEmployee(res.employee);
                    setLoadingEmployee(false);
                })
                .catch(err => {
                    console.error("Failed to fetch employee", err);
                    setLoadingEmployee(false);
                });
        } else {
            setLoadingEmployee(false);
        }
    }, []);

    return {
        employeeModal: {
            employee: selectedEmployee,
            open: employeeModalOpen,
            loading: loadingEmployee,
        },
        fitModal: {
            fit: selectedFit,
            open: fitModalOpen,
            loading: loadingFit,
        },
        signalModal: {
            signal: selectedSignal,
            open: signalModalOpen,
            loading: loadingSignal,
        },
        jobModal: {
            job: selectedJob,
            open: jobModalOpen,
        },
        stakeholderModal: {
            stakeholder: selectedStakeholder,
            open: stakeholderModalOpen,
        },
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
    };
}
