'use client';

import type {
    CompanyExplainabilityResponse,
} from '@/lib/schemas';
import { SectionHeader } from '@/components/accounts/detail/components';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
    Activity,
    Clock,
    AlertCircle,
    Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SignalCard } from '@/components/signals/SignalCard';

interface PartnerSignalsTabProps {
    explainability: CompanyExplainabilityResponse;
    onSelectSignal: (signalId: number) => void;
}

export function PartnerSignalsTab({ explainability, onSelectSignal }: PartnerSignalsTabProps) {
    const { signals_summary, data_coverage, freshness } = explainability;

    const handleSignalClick = (signalId: number) => {
        onSelectSignal(signalId);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-8">
            {/* Signal Analysis Section */}
            <section>
                <SectionHeader title="Signal Intelligence" color="bg-violet-600" />

                <div className="space-y-6">
                    {/* Interests */}
                    {signals_summary.interests.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Detected Interests
                            </h3>
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                            >
                                {signals_summary.interests.map((signal, idx) => (
                                    <motion.div key={idx} variants={fadeInUp}>
                                        <SignalCard
                                            signal={signal}
                                            type="interest"
                                            onClick={() => handleSignalClick(signal.id)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {/* Events */}
                    {signals_summary.events.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Key Events
                            </h3>
                            <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                            >
                                {signals_summary.events.map((signal, idx) => (
                                    <motion.div key={idx} variants={fadeInUp}>
                                        <SignalCard
                                            signal={signal}
                                            type="event"
                                            onClick={() => handleSignalClick(signal.id)}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    {signals_summary.interests.length === 0 && signals_summary.events.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="font-medium text-slate-700 dark:text-slate-300">No signals detected</p>
                            <p className="text-sm text-slate-500 mt-1">AI analysis didn&apos;t identify specific interests or events.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Data Quality Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2" title="Source coverage">
                            <Users className="h-3.5 w-3.5" />
                            <span>{data_coverage?.employees_analyzed?.toLocaleString() || 0} Employees Analyzed</span>
                        </div>
                        <div className="flex items-center gap-2" title="Signal density">
                            <Activity className="h-3.5 w-3.5" />
                            <span>{data_coverage?.signals_analyzed?.toLocaleString() || 0} Signals Found</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Data Freshness: {freshness?.avg_source_age_days ? `${Math.round(freshness.avg_source_age_days)} days avg` : 'Unknown'}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span>Last updated: {freshness?.newest_source ? new Date(freshness.newest_source).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
