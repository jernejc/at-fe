'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles, Globe, Users, Wand2, MousePointerClick, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SystemMessage } from '../ui/SystemMessage';
import { CompactPartnerRow } from '../../CompactPartnerRow';
import { staggerContainer } from '@/lib/animations';
import type { Partner, PartnerSuggestion } from '@/lib/schemas';

interface PartnersStepProps {
    loadingPartners: boolean;
    suggestedPartners: PartnerSuggestion[];
    partners: Partner[];
    selectedPartnerIds: Set<string>;
    setSelectedPartnerIds: (ids: Set<string>) => void;
    assignmentMode: 'auto' | 'manual' | 'skip';
    setAssignmentMode: (mode: 'auto' | 'manual' | 'skip') => void;
    error: string | null;
    creating: boolean;
    onCreate: () => void;
}

export function PartnersStep({
    loadingPartners,
    suggestedPartners,
    partners,
    selectedPartnerIds,
    setSelectedPartnerIds,
    assignmentMode,
    setAssignmentMode,
    error,
    creating,
    onCreate
}: PartnersStepProps) {
    return (
        <SystemMessage showAvatar={false}>
            <div className="space-y-4">
                {/* Suggested partners */}
                {loadingPartners ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-10 gap-3"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                            <Loader2 className="w-8 h-8 text-primary" />
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-sm text-slate-500 dark:text-slate-400"
                        >
                            Analyzing best partner matches...
                        </motion.p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-2"
                    >
                        {/* Show suggested partners first with match info */}
                        {suggestedPartners.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        AI Recommended
                                    </span>
                                </div>
                                <div className="space-y-2">
                                {suggestedPartners.map((suggestion, index) => {
                                    const partner = suggestion.partner;
                                    const isSelected = selectedPartnerIds.has(partner.slug || String(partner.id));
                                    
                                    return (
                                        <CompactPartnerRow
                                            key={partner.id}
                                            partner={partner}
                                            suggestion={suggestion}
                                            isSelected={isSelected}
                                            onToggle={() => {
                                                const next = new Set(selectedPartnerIds);
                                                const key = partner.slug || String(partner.id);
                                                if (isSelected) next.delete(key);
                                                else next.add(key);
                                                setSelectedPartnerIds(next);
                                            }}
                                        />
                                    );
                                })}
                                </div>
                            </div>
                        )}

                        {/* Other partners */}
                        {partners.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        All Partners
                                    </span>
                                </div>
                                <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
                                    {partners
                                        .filter(p => !suggestedPartners.some(s => (s.partner.slug || String(s.partner.id)) === p.id))
                                        .map((partner) => {
                                            const isSelected = selectedPartnerIds.has(partner.id);

                                            return (
                                                <CompactPartnerRow
                                                    key={partner.id}
                                                    partner={partner}
                                                    isSelected={isSelected}
                                                    onToggle={() => {
                                                        const next = new Set(selectedPartnerIds);
                                                        if (isSelected) next.delete(partner.id);
                                                        else next.add(partner.id);
                                                        setSelectedPartnerIds(next);
                                                    }}
                                                />
                                            );
                                        })}
                                </div>
                            </div>
                        )}

                        {/* Empty state - no partners available */}
                        {suggestedPartners.length === 0 && partners.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-8 text-center"
                            >
                                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    No partners available yet
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                                    You can skip this step and assign partners later
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Distribution mode */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        How should we distribute companies?
                    </p>
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-full">
                        {[
                            { id: 'auto', label: 'Auto-assign', icon: Wand2 },
                            { id: 'manual', label: 'Manual', icon: MousePointerClick },
                            { id: 'skip', label: 'Later', icon: Clock },
                        ].map(mode => {
                            const isSelected = assignmentMode === mode.id;
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setAssignmentMode(mode.id as 'auto' | 'manual' | 'skip')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                                        isSelected
                                            ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {mode.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Create button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 25 }}
                >
                    <motion.div
                        whileHover={{ scale: creating ? 1 : 1.01 }}
                        whileTap={{ scale: creating ? 1 : 0.99 }}
                    >
                        <Button
                            size="lg"
                            onClick={onCreate}
                            disabled={creating || (assignmentMode !== 'skip' && selectedPartnerIds.size === 0)}
                            className="w-full h-11 rounded-xl gap-2"
                        >
                            {creating ? (
                                <>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    <Check className="w-4 h-4" />
                                </motion.div>
                            )}
                            Create Campaign
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </SystemMessage>
    );
}
