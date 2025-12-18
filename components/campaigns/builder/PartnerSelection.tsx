'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Partner } from '@/lib/schemas/campaign';
import { Search, Check, Building2, Zap, Briefcase, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock Data
const MOCK_PARTNERS: Partner[] = [
    {
        id: 'p1',
        name: 'Acme Growth Agency',
        type: 'agency',
        description: 'Specializes in B2B SaaS growth and lead generation.',
        status: 'active',
        match_score: 98,
        logo_url: '/logos/agency1.png'
    },
    {
        id: 'p2',
        name: 'TechFlow Solutions',
        type: 'technology',
        description: 'Integration partner for CRM and marketing automation.',
        status: 'active',
        match_score: 95,
    },
    {
        id: 'p3',
        name: 'Global Consulting Group',
        type: 'consulting',
        description: 'Strategic advisory for enterprise market expansion.',
        status: 'active',
        match_score: 88,
    },
    {
        id: 'p4',
        name: 'CloudResellers Inc.',
        type: 'reseller',
        description: 'Distributor for cloud infrastructure and software.',
        status: 'active',
        match_score: 82,
    },
    {
        id: 'p5',
        name: 'MarketReach',
        type: 'agency',
        description: 'Full-service digital marketing agency for startups.',
        status: 'active',
        match_score: 75,
    },
    {
        id: 'p6',
        name: 'DataSync Systems',
        type: 'technology',
        description: 'Data enrichment and synchronization services.',
        status: 'active',
        match_score: 72,
    }
];

interface PartnerSelectionProps {
    selectedPartners: Partner[];
    onSelectionChange: (partners: Partner[]) => void;
}

export function PartnerSelection({ selectedPartners, onSelectionChange }: PartnerSelectionProps) {
    const [search, setSearch] = useState('');

    const filteredPartners = MOCK_PARTNERS.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );

    const togglePartner = (partner: Partner) => {
        const isSelected = selectedPartners.some(p => p.id === partner.id);
        if (isSelected) {
            onSelectionChange(selectedPartners.filter(p => p.id !== partner.id));
        } else {
            onSelectionChange([...selectedPartners, partner]);
        }
    };

    const getIcon = (type: Partner['type']) => {
        switch (type) {
            case 'agency': return Zap;
            case 'technology': return Building2;
            case 'consulting': return Briefcase;
            case 'reseller': return Globe;
            default: return Building2;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Connect with Partners</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Accelerate your campaign by collaborating with recommended partners who match your target criteria.
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search partners by name or expertise..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPartners.map(partner => {
                    const isSelected = selectedPartners.some(p => p.id === partner.id);
                    const TypeIcon = getIcon(partner.type);

                    return (
                        <Card
                            key={partner.id}
                            onClick={() => togglePartner(partner)}
                            className={cn(
                                "group relative transition-all duration-200 cursor-pointer overflow-hidden border-2",
                                isSelected
                                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500/20 shadow-md"
                                    : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-lg"
                            )}
                        >
                            <CardContent className="p-4 flex gap-4 items-start select-none">
                                <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors border",
                                    isSelected
                                        ? "bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300"
                                        : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400"
                                )}>
                                    <TypeIcon className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={cn("font-bold text-base truncate pr-6", isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white")}>
                                            {partner.name}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 min-h-[2.5em]">
                                        {partner.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={isSelected ? "default" : "secondary"} className={cn(
                                            "capitalize font-normal",
                                            !isSelected && "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                        )}>
                                            {partner.type}
                                        </Badge>
                                        {partner.match_score >= 90 && (
                                            <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold gap-1">
                                                {partner.match_score}% Match
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className={cn(
                                    "absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300",
                                    isSelected
                                        ? "bg-blue-600 border-blue-600 text-white scale-100 shadow-sm"
                                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-transparent scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
                                )}>
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredPartners.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No partners found matching "{search}"
                </div>
            )}
        </div>
    );
}
