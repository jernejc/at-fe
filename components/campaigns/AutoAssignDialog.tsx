'use client';

import { useState, useMemo } from 'react';
import { MembershipRead, Partner } from '@/lib/schemas/campaign';
import { Shuffle, Check, X, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AutoAssignDialogProps {
    companies: MembershipRead[];
    partners: Partner[];
    open: boolean;
    onClose: () => void;
    onConfirm: (assignments: Record<string, string>) => void;
}

export function AutoAssignDialog({
    companies,
    partners,
    open,
    onClose,
    onConfirm,
}: AutoAssignDialogProps) {
    const [isAssigning, setIsAssigning] = useState(false);

    // Calculate round-robin assignments for unassigned companies
    const proposedAssignments = useMemo(() => {
        const unassigned = companies.filter(c => !c.partner_id);
        const assignments: Record<string, string> = {};

        if (unassigned.length === 0 || partners.length === 0) return assignments;

        // Round-robin distribution
        unassigned.forEach((company, index) => {
            const partnerIndex = index % partners.length;
            assignments[company.domain] = partners[partnerIndex].id;
        });

        return assignments;
    }, [companies, partners]);

    // Calculate preview stats
    const previewStats = useMemo(() => {
        const stats: Record<string, { name: string; count: number }> = {};
        partners.forEach(p => {
            stats[p.id] = { name: p.name, count: 0 };
        });

        Object.values(proposedAssignments).forEach(partnerId => {
            if (stats[partnerId]) {
                stats[partnerId].count++;
            }
        });

        return stats;
    }, [proposedAssignments, partners]);

    const unassignedCount = companies.filter(c => !c.partner_id).length;

    const handleConfirm = async () => {
        setIsAssigning(true);
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));
        onConfirm(proposedAssignments);
        setIsAssigning(false);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                            <Shuffle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Auto-assign Partners
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Using round-robin distribution
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-5 space-y-5">
                    {unassignedCount === 0 ? (
                        <div className="text-center py-6">
                            <Check className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                All accounts are already assigned!
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                There are no unassigned accounts to distribute.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Summary */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <Users className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-700 dark:text-slate-300">
                                    <strong className="text-slate-900 dark:text-white">{unassignedCount}</strong> unassigned accounts will be distributed across <strong className="text-slate-900 dark:text-white">{partners.length}</strong> partners
                                </span>
                            </div>

                            {/* Preview */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                    Assignment Preview
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(previewStats).map(([partnerId, { name, count }]) => (
                                        <div
                                            key={partnerId}
                                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {name}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <ArrowRight className="w-4 h-4 text-slate-400" />
                                                <Badge variant="secondary" className="font-semibold">
                                                    +{count} accounts
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isAssigning}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={unassignedCount === 0 || isAssigning}
                        className="gap-2"
                    >
                        {isAssigning ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <Shuffle className="w-4 h-4" />
                                Assign {unassignedCount} Accounts
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
