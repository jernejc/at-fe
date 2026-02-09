'use client';

import { useState, useEffect } from 'react';
import type { PlaybookSummary, PlaybookRead } from '@/lib/schemas';
import { getCompanyPlaybook, generateCompanyPlaybook, getCompanyPlaybooks, waitForProcessingComplete } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
    Lightbulb,
    FileText,
    ShieldAlert,
    Hash,
    Calendar,
    Mail,
    Phone,
    Linkedin,
    MessageCircle,
    Briefcase,
    Sparkles,
    RefreshCw,
    ChevronDown,
    Forklift,
    HandCoins,
    Send,
    Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PartnerPlaybookTabProps {
    domain: string;
    productId: number;
    playbooks: PlaybookSummary[];
    playbookDetail?: PlaybookRead | null;
    productName?: string;
    onPlaybookGenerated?: (playbook: PlaybookRead, updatedPlaybooks: PlaybookSummary[]) => void;
}

export function PartnerPlaybookTab({ domain, productId, playbooks: initialPlaybooks, playbookDetail: initialPlaybookDetail, productName, onPlaybookGenerated }: PartnerPlaybookTabProps) {
    const [playbooks, setPlaybooks] = useState<PlaybookSummary[]>(initialPlaybooks);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(initialPlaybookDetail ?? null);
    const [loading, setLoading] = useState(!initialPlaybookDetail);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [expandedObjections, setExpandedObjections] = useState<Set<number>>(new Set());
    const [feedbackInput, setFeedbackInput] = useState('');

    // Sync props into local state on remount (tab switch back)
    useEffect(() => {
        setPlaybooks(initialPlaybooks);
    }, [initialPlaybooks]);

    useEffect(() => {
        if (initialPlaybookDetail) {
            setPlaybookDetail(initialPlaybookDetail);
            setLoading(false);
        }
    }, [initialPlaybookDetail]);

    // Find the playbook matching the campaign's target product
    const targetPlaybook = playbooks.find(p => p.product_id === productId);

    useEffect(() => {
        if (!targetPlaybook) {
            setLoading(false);
            return;
        }

        // Skip fetch if we already have the detail from props
        if (playbookDetail && playbookDetail.product_id === productId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        getCompanyPlaybook(domain, targetPlaybook.id)
            .then(setPlaybookDetail)
            .catch(console.error)
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [domain, targetPlaybook]);

    const handleGeneratePlaybook = async () => {
        if (isGenerating) return;

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Start the generation process
            const response = await generateCompanyPlaybook(domain, productId);

            // Wait for processing to complete via SSE stream
            if (response?.process_id) {
                await waitForProcessingComplete(domain, response.process_id);
            }

            // Fetch the updated playbooks list and detail
            const updatedPlaybooks = await getCompanyPlaybooks(domain);
            const newPlaybook = updatedPlaybooks.playbooks.find(p => p.product_id === productId);

            if (newPlaybook) {
                const detail = await getCompanyPlaybook(domain, newPlaybook.id);
                setPlaybooks(updatedPlaybooks.playbooks);
                setPlaybookDetail(detail);

                if (onPlaybookGenerated) {
                    onPlaybookGenerated(detail, updatedPlaybooks.playbooks);
                }
            } else {
                setGenerationError('Playbook generation completed but playbook was not found. Please refresh the page.');
            }
        } catch (error) {
            console.error('Failed to generate playbook:', error);
            setGenerationError('Failed to generate playbook. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleObjection = (index: number) => {
        setExpandedObjections(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
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
                        This may take up to a minute...
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

                {/* Dynamic Playbook Banner */}
                <motion.div variants={fadeInUp}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                        <div className="flex items-center gap-3">
                            <Card className='w-9 h-9 flex items-center justify-center rounded-xl'>
                                <Activity className="w-4 h-4 text-primary shrink-0" />
                            </Card>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className='text-sm font-semibold'>Dynamic Playbook</span>
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/10 gap-1.5 text-[10px] px-2 py-0.5">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                        </span>
                                        Live
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">Playbook is adjusted to recent signals</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:max-w-xs">
                            <Input
                                placeholder="Adjust playbook with feedback..."
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                onKeyDown={() => { }}
                                className="h-8 text-xs"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 shrink-0"
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Two-Column Grid Layout */}
                <motion.div variants={fadeInUp} className="grid lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Left Column */}
                    <div className="space-y-4 md:space-y-6 min-w-0">
                        {/* Outreach Cadence Card */}
                        {playbookDetail.outreach_cadence && playbookDetail.outreach_cadence.sequence && playbookDetail.outreach_cadence.sequence.length > 0 && (
                            <Card className='py-6'>
                                <CardHeader className='px-6'>
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Outreach Cadence
                                        {playbookDetail.outreach_cadence.total_days && (
                                            <span className="text-xs font-normal text-muted-foreground">
                                                ({playbookDetail.outreach_cadence.total_days} days)
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='px-6'>
                                    {playbookDetail.outreach_cadence.summary && (
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {playbookDetail.outreach_cadence.summary}
                                        </p>
                                    )}
                                    <div className="space-y-2">
                                        {playbookDetail.outreach_cadence.sequence.map((step, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
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
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 md:space-y-6 min-w-0">
                        {/* Recommended Channels */}
                        {playbookDetail.recommended_channels && playbookDetail.recommended_channels.length > 0 && (
                            <Card className='py-6'>
                                <CardHeader className='px-6'>
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Hash className="w-4 h-4 text-primary" />
                                        Recommended Channels
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='px-6'>
                                    <div className="flex items-center flex-wrap gap-2">
                                        {(playbookDetail.recommended_channels as string[]).map((ch, i) => (
                                            <span key={i} className="px-3 py-1.5 text-xs font-medium bg-muted/50 text-foreground/70 rounded-full border border-border/40">
                                                {ch}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Elevator Pitch Card */}
                        {playbookDetail.elevator_pitch && (
                            <Card className='py-6'>
                                <CardHeader className='px-6'>
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <Forklift className="w-4 h-4 text-primary" />
                                        Elevator pitch
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='px-6'>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {playbookDetail.elevator_pitch}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Value Proposition Card */}
                        {playbookDetail.value_proposition && (
                            <Card className='py-6'>
                                <CardHeader className='px-6'>
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <HandCoins className="w-4 h-4 text-primary" />
                                        Value Proposition
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='px-6'>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {playbookDetail.value_proposition}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Objection Handling Card with Accordions */}
                        {playbookDetail.objection_handling && Object.keys(playbookDetail.objection_handling).length > 0 && (
                            <Card className='py-6'>
                                <CardHeader className='px-6'>
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                                        <ShieldAlert className="w-4 h-4 text-primary" />
                                        Objection Handling
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='px-6'>
                                    <div className="space-y-2">
                                        {Object.entries(playbookDetail.objection_handling).map(([obj, response], i) => (
                                            <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleObjection(i)}
                                                    className="w-full px-4 py-2.5 bg-amber-500/5 flex items-center justify-between gap-2 hover:bg-amber-500/10 transition-colors text-left"
                                                >
                                                    <p className="text-sm font-medium text-foreground break-words min-w-0">&quot;{obj}&quot;</p>
                                                    <ChevronDown
                                                        className={cn(
                                                            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                                                            expandedObjections.has(i) && "rotate-180"
                                                        )}
                                                    />
                                                </button>
                                                <AnimatePresence initial={false}>
                                                    {expandedObjections.has(i) && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2, ease: "easeInOut" }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 py-3 border-t border-border/40">
                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                    {String(response)}
                                                                </p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
