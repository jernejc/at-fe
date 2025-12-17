'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { CampaignFilterUI, CampaignFilterType } from '@/lib/schemas/campaign';
import { ArrowRight } from 'lucide-react';

interface ChatFilterInputProps {
    onAddFilter: (filter: CampaignFilterUI) => void;
    className?: string;
}

interface QuickFilter {
    type: CampaignFilterType;
    label: string;
    placeholder: string;
}

const QUICK_FILTERS: QuickFilter[] = [
    { type: 'industry', label: 'Industry', placeholder: 'e.g., Technology, Healthcare' },
    { type: 'size_min', label: 'Min employees', placeholder: 'e.g., 100, 500, 1000' },
    { type: 'size_max', label: 'Max employees', placeholder: 'e.g., 1000, 5000' },
    { type: 'country', label: 'Country', placeholder: 'e.g., United States, Germany' },
];

// Simple keyword matching for natural language parsing
const INDUSTRY_KEYWORDS = ['tech', 'technology', 'software', 'saas', 'healthcare', 'health', 'finance', 'financial', 'retail', 'manufacturing', 'education', 'media', 'energy'];
const SIZE_KEYWORDS = ['enterprise', 'startup', 'small', 'medium', 'large', 'smb'];
const COUNTRY_KEYWORDS = ['us', 'usa', 'united states', 'uk', 'germany', 'france', 'canada', 'australia'];

function parseNaturalLanguage(input: string): CampaignFilterUI | null {
    const lower = input.toLowerCase().trim();

    // Try to extract size
    const sizeMatch = lower.match(/(\d+)\+?\s*(employees?)?/);
    if (sizeMatch) {
        const size = parseInt(sizeMatch[1]);
        return {
            id: crypto.randomUUID(),
            type: 'size_min',
            value: size.toString(),
            displayLabel: `${size.toLocaleString()}+ employees`,
        };
    }

    // Check for enterprise/startup keywords
    if (SIZE_KEYWORDS.some(k => lower.includes(k))) {
        if (lower.includes('enterprise') || lower.includes('large')) {
            return {
                id: crypto.randomUUID(),
                type: 'size_min',
                value: '1000',
                displayLabel: 'Enterprise (1000+)',
            };
        }
        if (lower.includes('startup') || lower.includes('small')) {
            return {
                id: crypto.randomUUID(),
                type: 'size_max',
                value: '100',
                displayLabel: 'Startup (< 100)',
            };
        }
        if (lower.includes('smb') || lower.includes('medium')) {
            return {
                id: crypto.randomUUID(),
                type: 'size_min',
                value: '50',
                displayLabel: 'SMB (50-500)',
            };
        }
    }

    // Check for industry keywords
    for (const industry of INDUSTRY_KEYWORDS) {
        if (lower.includes(industry)) {
            const displayName = industry.charAt(0).toUpperCase() + industry.slice(1);
            return {
                id: crypto.randomUUID(),
                type: 'industry',
                value: displayName,
                displayLabel: displayName,
            };
        }
    }

    // Check for country keywords  
    for (const country of COUNTRY_KEYWORDS) {
        if (lower.includes(country)) {
            let displayName = country.toUpperCase();
            if (country === 'us' || country === 'usa' || country === 'united states') displayName = 'United States';
            if (country === 'uk') displayName = 'United Kingdom';
            if (country === 'germany') displayName = 'Germany';
            if (country === 'france') displayName = 'France';
            if (country === 'canada') displayName = 'Canada';
            if (country === 'australia') displayName = 'Australia';
            return {
                id: crypto.randomUUID(),
                type: 'country',
                value: displayName,
                displayLabel: displayName,
            };
        }
    }

    // If no specific match, create a natural query filter
    if (input.trim().length > 2) {
        return {
            id: crypto.randomUUID(),
            type: 'natural_query',
            value: input.trim(),
            displayLabel: input.trim(),
        };
    }

    return null;
}

export function ChatFilterInput({ onAddFilter, className }: ChatFilterInputProps) {
    const [input, setInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim()) return;

        let filter: CampaignFilterUI | null = null;

        if (activeQuickFilter) {
            filter = {
                id: crypto.randomUUID(),
                type: activeQuickFilter.type,
                value: input.trim(),
                displayLabel: activeQuickFilter.type === 'size_min'
                    ? `${parseInt(input).toLocaleString()}+ employees`
                    : activeQuickFilter.type === 'size_max'
                        ? `< ${parseInt(input).toLocaleString()} employees`
                        : input.trim(),
            };
        } else {
            filter = parseNaturalLanguage(input);
        }

        if (filter) {
            onAddFilter(filter);
            setInput('');
            setActiveQuickFilter(null);
        }
    };

    const handleQuickFilterClick = (qf: QuickFilter) => {
        if (activeQuickFilter?.type === qf.type) {
            // Toggle off if already selected
            setActiveQuickFilter(null);
        } else {
            setActiveQuickFilter(qf);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setActiveQuickFilter(null);
            setInput('');
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Input */}
            <form onSubmit={handleSubmit} className="relative">
                <div
                    className={cn(
                        'flex items-center rounded-lg border transition-colors',
                        'bg-white dark:bg-slate-900',
                        isFocused
                            ? 'border-blue-500 ring-1 ring-blue-500/20'
                            : 'border-border hover:border-slate-400 dark:hover:border-slate-600'
                    )}
                >
                    {activeQuickFilter && (
                        <span className="pl-3 text-sm text-muted-foreground whitespace-nowrap">
                            {activeQuickFilter.label}:
                        </span>
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={handleKeyDown}
                        placeholder={activeQuickFilter?.placeholder || "Describe companies you're looking for..."}
                        className="flex-1 py-2.5 px-3 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
                    />

                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className={cn(
                            'mr-1.5 p-1.5 rounded transition-colors',
                            input.trim()
                                ? 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                : 'text-muted-foreground/30 cursor-not-allowed'
                        )}
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Quick filters */}
            <div className="flex items-center gap-2 flex-wrap">
                {QUICK_FILTERS.map((qf) => (
                    <button
                        key={qf.type}
                        onClick={() => handleQuickFilterClick(qf)}
                        className={cn(
                            'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                            'border',
                            activeQuickFilter?.type === qf.type
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                : 'text-muted-foreground border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                        )}
                    >
                        {qf.label}
                    </button>
                ))}
            </div>

            {/* Hint */}
            <p className="text-xs text-muted-foreground/70">
                Try "enterprise tech companies" or "startups in healthcare"
            </p>
        </div>
    );
}
