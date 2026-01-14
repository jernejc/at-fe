// Playbooks Tab Component - Updated styling to match Explainability tab

import { useState, useEffect, useMemo } from 'react';
import type { PlaybookSummary, PlaybookRead, PlaybookContactResponse, EmployeeSummary, PlaybookContext, ProductSummary } from '@/lib/schemas';
import { getCompanyPlaybook, getEmployees } from '@/lib/api';
import { cn } from '@/lib/utils';
import { staggerContainerFast, slideInFromLeft, staggerContainer, fadeInUp } from '@/lib/animations';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    Search,
    Zap,
    Target,
    ShieldAlert,
    Briefcase,
    Hash,
    ChevronRight,
    FileText,
    Users,
    Lightbulb,
    Mail,
    Copy,
    ExternalLink,
    Clock,
    Sparkles,
    RefreshCw,
    Calendar,
    Phone,
    Linkedin,
    MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export { type PlaybookContext } from '@/lib/schemas';

interface PlaybooksTabProps {
    playbooks: PlaybookSummary[];
    availableEmployees?: EmployeeSummary[];
    domain?: string;
    onSelectEmployee: (employeeId: number | null, preview: { name: string; title?: string }, context: PlaybookContext) => void;
    onProcess?: () => Promise<void>;
    /** Available products for generating new playbooks */
    allProducts?: ProductSummary[];
    /** Callback to generate a playbook for a specific product */
    onGeneratePlaybook?: (productId: number) => Promise<void>;
    /** Callback when a stakeholder is clicked */
    onSelectStakeholder?: (contact: PlaybookContactResponse) => void;
}

export function PlaybooksTab({ playbooks, availableEmployees = [], domain, onSelectEmployee, onProcess, allProducts = [], onGeneratePlaybook, onSelectStakeholder }: PlaybooksTabProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [playbookDetail, setPlaybookDetail] = useState<PlaybookRead | null>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showProductMenu, setShowProductMenu] = useState(false);
    const [selectedProductToGenerate, setSelectedProductToGenerate] = useState<number | null>(null);

    // Use shared animation variants
    const container = staggerContainerFast;
    const item = slideInFromLeft;
    const detailContainer = staggerContainer;
    const detailItem = fadeInUp;

    const handleStakeholderClick = (contact: PlaybookContactResponse) => {
        if (onSelectStakeholder) {
            onSelectStakeholder(contact);
        }
    };

    const sortedPlaybooks = useMemo(() => {
        return [...playbooks]
            .sort((a, b) => (Number(b.fit_score) || 0) - (Number(a.fit_score) || 0))
            .filter(p => !searchQuery || (p.product_name ?? '').toLowerCase().includes(searchQuery.toLowerCase()));
    }, [playbooks, searchQuery]);

    // Find products that don't have a playbook yet
    const productsWithoutPlaybook = useMemo(() => {
        const existingProductNames = new Set(playbooks.map(p => (p.product_name ?? '').toLowerCase()));
        return allProducts.filter(p => !existingProductNames.has(p.name.toLowerCase()));
    }, [allProducts, playbooks]);

    const handleGenerateNew = async (productId: number) => {
        if (!onGeneratePlaybook || isGenerating) return;
        setIsGenerating(true);
        setShowProductMenu(false);
        try {
            await onGeneratePlaybook(productId);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (selectedId === null && sortedPlaybooks.length > 0) {
            setSelectedId(sortedPlaybooks[0].id);
        }
    }, [sortedPlaybooks, selectedId]);

    useEffect(() => {
        if (selectedId === null) {
            setPlaybookDetail(null);
            return;
        }

        if (!domain) {
            console.warn('Cannot fetch playbook detail: domain is missing');
            return;
        }

        setLoadingDetail(true);
        getCompanyPlaybook(domain, selectedId)
            .then(setPlaybookDetail)
            .catch(console.error)
            .finally(() => setLoadingDetail(false));
    }, [selectedId, domain]);

    return (
        <div className="flex h-[calc(100vh-220px)] min-h-[500px] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-in fade-in duration-700 bg-white dark:bg-slate-900">
            {/* Sidebar */}
            <div className="w-[300px] flex flex-col border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-3 bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Strategies
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{sortedPlaybooks.length}</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Find a strategy..."
                            className="pl-8 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-none focus-visible:ring-1"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="divide-y divide-slate-100 dark:divide-slate-800"
                    >
                        {sortedPlaybooks.map((pb) => {
                            const isSelected = selectedId === pb.id;
                            const score = Number(pb.fit_score) || 0;

                            return (
                                <motion.button
                                    key={pb.id}
                                    variants={item}
                                    onClick={() => setSelectedId(pb.id)}
                                    className={cn(
                                        "w-full text-left p-3.5 transition-all group relative",
                                        isSelected
                                            ? "bg-white dark:bg-slate-900"
                                            : "hover:bg-white/50 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    {isSelected && (
                                        <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-full" />
                                    )}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                "font-medium text-sm truncate",
                                                isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                            )}>
                                                {pb.product_name ?? 'Unknown Product'}
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 shrink-0 transition-transform",
                                            isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5"
                                        )} />
                                    </div>
                                </motion.button>
                            );
                        })}
                        {sortedPlaybooks.length === 0 && (
                            <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                                No results found
                            </div>
                        )}

                        {/* Generate for other products */}
                        {productsWithoutPlaybook.length > 0 && onGeneratePlaybook && (
                            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                                <div className="space-y-2">
                                    <select
                                        value={selectedProductToGenerate ?? productsWithoutPlaybook[0]?.id ?? ''}
                                        onChange={(e) => setSelectedProductToGenerate(parseInt(e.target.value, 10))}
                                        disabled={isGenerating}
                                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 truncate text-slate-900 dark:text-white"
                                    >
                                        {productsWithoutPlaybook.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={isGenerating}
                                        onClick={() => handleGenerateNew(selectedProductToGenerate ?? productsWithoutPlaybook[0]?.id)}
                                        className="w-full h-7 text-xs"
                                    >
                                        {isGenerating ? (
                                            <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />
                                        ) : null}
                                        {isGenerating ? 'Generating...' : 'Generate Playbook'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </ScrollArea>
            </div>

            {/* Detail View */}
            <div className="flex-1 flex flex-col min-w-0">
                {selectedId === null ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
                        <Briefcase className="w-12 h-12 stroke-[1.5] mb-4 opacity-20" />
                        <p>Select a strategy to view details</p>
                    </div>
                ) : loadingDetail ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    </div>
                ) : playbookDetail ? (
                    <ScrollArea className="h-full">
                        <motion.div
                            variants={detailContainer}
                            initial="hidden"
                            animate="show"
                            className="p-6 max-w-4xl mx-auto space-y-6 pb-16"
                        >

                            {/* Header */}
                            <motion.div variants={detailItem} className="pb-6 border-b border-border/50">
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
                                <motion.section variants={detailItem}>
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
                                <motion.section variants={detailItem}>
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
                                <motion.div variants={detailItem} className="space-y-4">
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
                                <motion.section variants={detailItem} className="pt-6">
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

                            {/* Key Stakeholders */}
                            {playbookDetail.contacts && playbookDetail.contacts.length > 0 && (
                                <motion.section variants={detailItem} className="pt-6">
                                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-primary" />
                                        Key Stakeholders
                                        <span className="text-xs font-normal text-muted-foreground ml-1">({playbookDetail.contacts.length})</span>
                                    </h3>
                                    <div className="space-y-3">
                                        {playbookDetail.contacts.map((contact) => (
                                            <div
                                                key={contact.id}
                                                className="rounded-lg border border-border/60 bg-card overflow-hidden hover:border-border transition-colors"
                                            >
                                                {/* Contact Header */}
                                                <div className="p-4 flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 text-sm font-medium text-primary">
                                                        {contact.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-sm text-foreground truncate">{contact.name}</h4>
                                                            {contact.fit_score !== null && Number(contact.fit_score) > 0 && (
                                                                <span className={cn(
                                                                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                                                    (contact.fit_score ?? 0) >= 0.7
                                                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                        : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    {Math.round((contact.fit_score ?? 0) * 100)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">{contact.title}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">
                                                            {contact.role_category}
                                                        </span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                            onClick={() => handleStakeholderClick(contact)}
                                                            title="View Profile"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Contact Details - Value Prop only */}
                                                {contact.value_prop && (
                                                    <div className="px-4 pb-4 pt-0">
                                                        <div className="text-xs text-muted-foreground pl-12">
                                                            <span className="font-medium text-foreground/70">Why: </span>
                                                            {contact.value_prop}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* Discovery Questions */}
                            {playbookDetail.discovery_questions && playbookDetail.discovery_questions.length > 0 && (
                                <motion.section variants={detailItem}>
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
                                <motion.section variants={detailItem}>
                                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-primary" />
                                        Objection Handling
                                    </h3>
                                    <div className="space-y-3">
                                        {Object.entries(playbookDetail.objection_handling).map(([obj, response], i) => (
                                            <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
                                                <div className="px-4 py-2.5 bg-amber-500/5 border-b border-border/40">
                                                    <p className="text-sm font-medium text-foreground">"{obj}"</p>
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
                                <motion.section variants={detailItem}>
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
                                <motion.div variants={detailItem} className="mt-10 pt-4 border-t border-border/40">
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
                    </ScrollArea>
                ) : null}
            </div>
        </div>
    );
}
