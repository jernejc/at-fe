'use client';

import type { PlaybookContactResponse } from '@/lib/schemas';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PartnerStakeholdersTabProps {
    contacts: PlaybookContactResponse[];
    onSelectStakeholder: (contact: PlaybookContactResponse) => void;
}

export function PartnerStakeholdersTab({ contacts, onSelectStakeholder }: PartnerStakeholdersTabProps) {
    if (!contacts || contacts.length === 0) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center text-slate-500 dark:text-slate-400">
                <Users className="w-12 h-12 stroke-[1.5] mb-4 opacity-20" />
                <p>No stakeholders available</p>
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8"
        >
            {contacts.map((contact) => (
                <motion.button
                    key={contact.id}
                    variants={fadeInUp}
                    onClick={() => onSelectStakeholder(contact)}
                    className="w-full text-left rounded-lg border border-border/60 bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition-all group"
                >
                    {/* Contact Header */}
                    <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 text-sm font-medium text-primary">
                            {contact.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                    {contact.name}
                                </h4>
                                {contact.fit_score !== null && Number(contact.fit_score) > 0 && (
                                    <span className={cn(
                                        "text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0",
                                        (contact.fit_score ?? 0) >= 0.7
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {Math.round((contact.fit_score ?? 0) * 100)}%
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.title}</p>
                            {contact.role_category && (
                                <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                                    {contact.role_category}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Value Prop Snippet */}
                    {contact.value_prop && (
                        <div className="px-4 pb-4 pt-0">
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {contact.value_prop}
                            </p>
                        </div>
                    )}
                </motion.button>
            ))}
        </motion.div>
    );
}
