'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlaybookContactResponse } from '@/lib/schemas';
import { normalizeScoreNullable, copyToClipboard } from '@/lib/utils';
import {
    User,
    Mail,
    Phone,
    Linkedin,
    Copy,
    Target,
    MessageSquare,
    ChevronRight,
    Star,
    Sparkles,
} from 'lucide-react';

interface KeyStakeholderSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contact: PlaybookContactResponse | null;
    isLoading?: boolean;
}

export function KeyStakeholderSheet({ open, onOpenChange, contact, isLoading }: KeyStakeholderSheetProps) {
    if (!contact && !isLoading) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950 border-l shadow-xl"
                style={{ width: '100%', maxWidth: '650px', zIndex: 60 }}
                overlayClassName="!z-[60]"
            >
                {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                ) : contact ? (
                    <>
                        <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                            <SheetHeader className="space-y-6">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {contact.role_category && (
                                                <Badge variant="outline" className="text-slate-500 font-normal border-slate-200">
                                                    {contact.role_category}
                                                </Badge>
                                            )}
                                            {contact.priority_rank && contact.priority_rank <= 3 && (
                                                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-0">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Priority #{contact.priority_rank}
                                                </Badge>
                                            )}
                                        </div>
                                        <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                            {contact.name}
                                        </SheetTitle>
                                        {contact.title && (
                                            <SheetDescription className="text-base">
                                                {contact.title}
                                            </SheetDescription>
                                        )}
                                    </div>
                                    {contact.fit_score != null && (
                                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-border min-w-[90px] shadow-sm">
                                            <span className="text-3xl font-bold text-foreground">
                                                {Math.round(normalizeScoreNullable(contact.fit_score))}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-wider">Fit</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {contact.linkedin_url && (
                                        <a
                                            href={contact.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" />
                                            LinkedIn
                                        </a>
                                    )}
                                    {contact.email && (
                                        <button
                                            onClick={() => copyToClipboard(contact.email!)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            {contact.email}
                                            <Copy className="w-3 h-3 ml-1 opacity-50" />
                                        </button>
                                    )}
                                    {contact.phone && (
                                        <button
                                            onClick={() => copyToClipboard(contact.phone!)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Phone className="w-3.5 h-3.5" />
                                            {contact.phone}
                                            <Copy className="w-3 h-3 ml-1 opacity-50" />
                                        </button>
                                    )}
                                </div>
                            </SheetHeader>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6">
                            <div className="py-6 space-y-8">
                                {contact.value_prop && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Target className="h-4 w-4 text-primary" />
                                            Value Proposition
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-card border border-border rounded-lg p-4">
                                            {contact.value_prop}
                                        </p>
                                    </section>
                                )}

                                {contact.priority_reasoning && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                            Why This Contact
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-card border border-border rounded-lg p-4">
                                            {contact.priority_reasoning}
                                        </p>
                                    </section>
                                )}

                                {contact.approach_notes && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            Approach Notes
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-card border border-border rounded-lg p-4">
                                            {contact.approach_notes}
                                        </p>
                                    </section>
                                )}

                                {(contact.preferred_channel || (contact.channel_sequence && contact.channel_sequence.length > 0)) && (
                                    <section className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-primary" />
                                            Channel Preferences
                                        </h3>
                                        <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                                            {contact.preferred_channel && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase">Preferred:</span>
                                                    <Badge variant="secondary" className="capitalize">
                                                        {contact.preferred_channel}
                                                    </Badge>
                                                </div>
                                            )}
                                            {contact.channel_sequence && contact.channel_sequence.length > 0 && (
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase mr-2">Sequence:</span>
                                                    {contact.channel_sequence.map((channel, i) => (
                                                        <span key={i} className="flex items-center">
                                                            <Badge variant="outline" className="capitalize text-xs">
                                                                {channel}
                                                            </Badge>
                                                            {i < contact.channel_sequence!.length - 1 && (
                                                                <ChevronRight className="w-3 h-3 text-muted-foreground mx-1" />
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {contact.outreach_templates && contact.outreach_templates.length > 0 && (
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" />
                                            Outreach Templates
                                        </h3>
                                        <div className="space-y-4">
                                            {contact.outreach_templates.map((template) => (
                                                <div key={template.id} className="bg-card border border-border rounded-lg overflow-hidden">
                                                    {template.draft_message && (
                                                        <div className="p-4 border-b border-border/50">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Email Draft
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={() => copyToClipboard(template.draft_message!)}
                                                                >
                                                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                                                </Button>
                                                            </div>
                                                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                                                {template.draft_message}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {template.linkedin_connection_note && (
                                                        <div className="p-4 border-b border-border/50 bg-blue-50/30 dark:bg-blue-900/10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                                    <Linkedin className="w-3 h-3" /> LinkedIn Note
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={() => copyToClipboard(template.linkedin_connection_note!)}
                                                                >
                                                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                                                </Button>
                                                            </div>
                                                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                                                {template.linkedin_connection_note}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {template.follow_up_email && (
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                                    Follow-up Email
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={() => copyToClipboard(template.follow_up_email!)}
                                                                >
                                                                    <Copy className="w-3 h-3 mr-1" /> Copy
                                                                </Button>
                                                            </div>
                                                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                                                                {template.follow_up_email}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {contact.fit_reasoning && (
                                    <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                                            Fit Reasoning
                                        </h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            {contact.fit_reasoning}
                                        </p>
                                    </section>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-muted-foreground">
                        Failed to load stakeholder details.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
