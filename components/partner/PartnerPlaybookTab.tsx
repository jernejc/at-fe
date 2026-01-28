'use client';

import { useState, useEffect } from 'react';
import type { PlaybookSummary, PlaybookRead } from '@/lib/schemas';
import { getCompanyPlaybook, generateCompanyPlaybook, getCompanyPlaybooks } from '@/lib/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
    Lightbulb,
    FileText,
    ShieldAlert,
    Hash,
    Calendar,
    Clock,
    Users,
    Mail,
    Phone,
    Linkedin,
    MessageCircle,
    Briefcase,
    Sparkles,
    RefreshCw,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PartnerPlaybookTabProps {
    domain: string;
    productId: number;
    playbooks: PlaybookSummary[];
    productName?: string;
    onPlaybookGenerated?: (playbook: PlaybookRead) => void;
}

export function PartnerPlaybookTab({ domain, productId, playbooks: initialPlaybooks, productName, onPlaybookGenerated }: PartnerPlaybookTabProps) {
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>(initialPlaybooks);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    // Find the playbook matching the campaign's target product
    const targetPlaybook = playbooks.find(p => p.product_id === productId);

    useEffect(() => {
        if (!targetPlaybook) {
            setLoading(false);
            return;
        }

        setLoading(true);
        getCompanyPlaybook(domain, targetPlaybook.id)
            .then(setPlaybookDetail)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [domain, targetPlaybook]);

    const handleGeneratePlaybook = async () => {
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Start the generation process
            await generateCompanyPlaybook(domain, productId);

            // Poll for completion by fetching playbooks
            let attempts = 0;
            const maxAttempts = 30; // 30 seconds max
            const pollInterval = 1000; // 1 second

            const poll = async (): Promise<PlaybookRead | null> => {
                attempts++;
                const playbooksData = await getCompanyPlaybooks(domain);
                const newPlaybook = playbooksData.playbooks.find(p => p.product_id === productId);

                if (newPlaybook) {
                    // Playbook found, fetch details
                    const detail = await getCompanyPlaybook(domain, newPlaybook.id);
                    return detail;
                }

                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, pollInterval));
                    return poll();
                }

                return null;
            };

            const generatedPlaybook = await poll();

            if (generatedPlaybook) {
                // Refresh playbooks list
                const updatedPlaybooks = await getCompanyPlaybooks(domain);
                setPlaybooks(updatedPlaybooks.playbooks);
                setPlaybookDetail(generatedPlaybook);

                if (onPlaybookGenerated) {
                    onPlaybookGenerated(generatedPlaybook);
                }
            } else {
                setGenerationError('Playbook generation is taking longer than expected. Please refresh the page.');
            }
        } catch (error) {
            console.error('Failed to generate playbook:', error);
            setGenerationError('Failed to generate playbook. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    // Show generate UI if no playbook exists
    if (!targetPlaybook || !playbookDetail) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-muted/30 rounded-full p-4 mb-4">
                    <Briefcase className="w-10 h-10 stroke-[1.5] text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    No Playbook Available
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {productName
                        ? `Generate a sales playbook for ${productName} to get tailored outreach strategies for this account.`
                        : 'Generate a sales playbook to get tailored outreach strategies for this account.'}
                </p>

                {generationError && (
                    <p className="text-sm text-destructive mb-4">{generationError}</p>
                )}

                <Button
                    onClick={handleGeneratePlaybook}
                    disabled={isGenerating}
                    className="gap-2"
                >
                    {isGenerating ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Generating Playbook...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4" />
                            Generate Playbook
                        </>
                    )}
                </Button>

                {isGenerating && (
                    <p className="text-xs text-muted-foreground mt-4">
                        This may take up to 30 seconds...
                    </p>
                )}
            </div>
        );
    }

    return (
        <div>
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-6 pb-8"
            >
                {/* Header */}
                <motion.div variants={fadeInUp} className="pb-6 border-b border-border/50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <h2 className="text-xl font-semibold text-foreground tracking-tight">
                                {playbookDetail.product_name ?? 'Unknown Product'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Sales strategy for this account
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Signal Basis (Context) */}
                {playbookDetail.generation_metadata?.signal_basis && (
                    <motion.section variants={fadeInUp}>
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            Why This Account?
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Top Events */}
                            {playbookDetail.generation_metadata.signal_basis.top_events?.length > 0 && (
                                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Recent Signals
                                    </h4>
                                    <div className="space-y-3">
                                        {playbookDetail.generation_metadata.signal_basis.top_events.map((event, i) => (
                                            <div key={i} className="flex items-start gap-2.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-medium text-sm text-foreground capitalize">
                                                            {event.category.replace('_', ' ')}
                                                        </span>
                                                        {event.urgency >= 7 && (
                                                            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded">
                                                                Urgent
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{event.influence_on_strategy}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Top Interests */}
                            {playbookDetail.generation_metadata.signal_basis.top_interests?.length > 0 && (
                                <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Strategic Interests
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {playbookDetail.generation_metadata.signal_basis.top_interests.map((interest, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-background border border-border/60 rounded-md"
                                            >
                                                <span className="font-medium text-foreground capitalize">{interest.category.replace('_', ' ')}</span>
                                                {interest.strength > 0 && (
                                                    <span className="text-muted-foreground">{interest.strength}/10</span>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.section>
                )}

                {/* Elevator Pitch */}
                {playbookDetail.elevator_pitch && (
                    <motion.section variants={fadeInUp}>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Elevator Pitch
                        </h4>
                        <p className="text-sm text-foreground/80 leading-relaxed pl-3 border-l-2 border-primary/30">
                            {playbookDetail.elevator_pitch}
                        </p>
                    </motion.section>
                )}

                {/* Reasoning & Value */}
                {(playbookDetail.fit_reasoning || playbookDetail.value_proposition) && (
                    <motion.div variants={fadeInUp} className="space-y-4">
                        {playbookDetail.fit_reasoning && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Strategic Rationale
                                </h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {playbookDetail.fit_reasoning}
                                </p>
                            </div>
                        )}
                        {playbookDetail.value_proposition && (
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    Value Proposition
                                </h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                    {playbookDetail.value_proposition}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Outreach Cadence */}
                {playbookDetail.outreach_cadence && playbookDetail.outreach_cadence.sequence && playbookDetail.outreach_cadence.sequence.length > 0 && (
                    <motion.section variants={fadeInUp} className="pt-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Outreach Cadence
                            {playbookDetail.outreach_cadence.total_days && (
                                <span className="text-xs font-normal text-muted-foreground">
                                    ({playbookDetail.outreach_cadence.total_days} days)
                                </span>
                            )}
                        </h3>
                        {playbookDetail.outreach_cadence.summary && (
                            <p className="text-xs text-muted-foreground mb-3">
                                {playbookDetail.outreach_cadence.summary}
                            </p>
                        )}
                        <div className="space-y-2">
                            {playbookDetail.outreach_cadence.sequence.map((step, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                                >
                                    <div className="flex flex-col items-center shrink-0 w-10">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Day</span>
                                        <span className="text-lg font-bold text-foreground">{step.day_offset}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-[10px] font-medium px-2 py-0.5 rounded capitalize inline-flex items-center gap-1",
                                                step.channel === 'email' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                                    step.channel === 'linkedin' ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" :
                                                        step.channel === 'phone' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                                                            "bg-muted text-muted-foreground"
                                            )}>
                                                {step.channel === 'email' && <Mail className="w-3 h-3" />}
                                                {step.channel === 'linkedin' && <Linkedin className="w-3 h-3" />}
                                                {step.channel === 'phone' && <Phone className="w-3 h-3" />}
                                                {step.channel}
                                            </span>
                                            {step.contacts && step.contacts.length > 0 && (
                                                <span className="text-[10px] text-muted-foreground truncate">
                                                    → {step.contacts.join(', ')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-snug">{step.objective}</p>
                                        {step.follow_up && (
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                <MessageCircle className="w-3 h-3" /> {step.follow_up}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Discovery Questions */}
                {playbookDetail.discovery_questions && playbookDetail.discovery_questions.length > 0 && (
                    <motion.section variants={fadeInUp}>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Discovery Questions
                        </h3>
                        <div className="space-y-2">
                            {(playbookDetail.discovery_questions as string[]).map((q, i) => (
                                <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-muted/30 border border-border/40">
                                    <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                                    <span className="text-foreground/80">{q}</span>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Objections */}
                {playbookDetail.objection_handling && Object.keys(playbookDetail.objection_handling).length > 0 && (
                    <motion.section variants={fadeInUp}>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            Objection Handling
                        </h3>
                        <div className="space-y-3">
                            {Object.entries(playbookDetail.objection_handling).map(([obj, response], i) => (
                                <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
                                    <div className="px-4 py-2.5 bg-amber-500/5 border-b border-border/40">
                                        <p className="text-sm font-medium text-foreground">&quot;{obj}&quot;</p>
                                    </div>
                                    <div className="px-4 py-3">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {String(response)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Channels */}
                {playbookDetail.recommended_channels && playbookDetail.recommended_channels.length > 0 && (
                    <motion.section variants={fadeInUp}>
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Hash className="w-4 h-4 text-primary" />
                            Recommended Channels
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {(playbookDetail.recommended_channels as string[]).map((ch, i) => (
                                <span key={i} className="px-3 py-1.5 text-xs font-medium bg-muted/50 text-foreground/70 rounded-full border border-border/40">
                                    {ch}
                                </span>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Generation Metadata Footer */}
                {playbookDetail.generation_metadata && (
                    <motion.div variants={fadeInUp} className="mt-10 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-4">
                                {playbookDetail.contacts && playbookDetail.contacts.length > 0 && (
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-3 w-3" />
                                        {playbookDetail.contacts.length} stakeholders
                                    </span>
                                )}
                            </div>
                            {playbookDetail.regenerated_at && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {new Date(playbookDetail.regenerated_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
