'use client';

import { Partner } from '@/lib/schemas/campaign';
import { Building2, Zap, Briefcase, Globe, ExternalLink, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Mock data (same as PartnerSelection for consistency)
const MOCK_ASSIGNED_PARTNERS: Partner[] = [
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
        id: 'p3',
        name: 'Global Consulting Group',
        type: 'consulting',
        description: 'Strategic advisory for enterprise market expansion.',
        status: 'active',
        match_score: 88,
    }
];

export function PartnerTab({ campaignSlug }: { campaignSlug: string }) {
    const partners = MOCK_ASSIGNED_PARTNERS;

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
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Assigned Partners</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            External partners collaborating on this campaign
                        </p>
                    </div>
                    <Button variant="outline" size="sm">
                        Manage Partners
                    </Button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {partners.map(partner => {
                        const TypeIcon = getIcon(partner.type);

                        return (
                            <div key={partner.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                                <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                                    <TypeIcon className="w-6 h-6" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                                            {partner.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium dark:bg-emerald-900/10 dark:border-emerald-900/20 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Active
                                            </span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize border border-slate-200 dark:border-slate-700">
                                                {partner.type}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {partner.description}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                                    <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 h-9">
                                        <MessageSquare className="w-4 h-4 text-slate-400" />
                                        Message
                                    </Button>
                                    <Button variant="outline" size="sm" className="flex-1 md:flex-none gap-2 h-9">
                                        <ExternalLink className="w-4 h-4 text-slate-400" />
                                        Profile
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {partners.length === 0 && (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        No partners assigned to this campaign yet.
                    </div>
                )}
            </div>

            <div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 flex flex-col justify-center items-center text-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-2">Need more help?</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-lg">
                        Find specialized partners to help you execute your campaign strategy, from content creation to lead nurturing.
                    </p>
                    <Button variant="outline" className="bg-white dark:bg-slate-800">
                        Browse Partner Directory
                    </Button>
                </div>
            </div>
        </div>
    );
}
