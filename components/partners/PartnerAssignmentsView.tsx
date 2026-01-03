'use client';

import { useState, useEffect, useRef } from 'react';
import { MembershipRead, Partner } from '@/lib/schemas/campaign';
import { Building2, Zap, Briefcase, Globe, ChevronDown, Check, UserCircle, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PartnerAssignmentsViewProps {
    companies: MembershipRead[];
    partners: Partner[];
    onAssign: (domain: string, partnerId: string | null) => void | Promise<void>;
    onCompanyClick?: (domain: string) => void;
    isLoading?: boolean;
}

export function PartnerAssignmentsView({
    companies,
    partners,
    onAssign,
    onCompanyClick,
    isLoading = false
}: PartnerAssignmentsViewProps) {
    const [filterPartnerId, setFilterPartnerId] = useState<string | 'all' | 'unassigned'>('all');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [openUp, setOpenUp] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCompanies = companies.filter(company => {
        if (filterPartnerId === 'all') return true;
        if (filterPartnerId === 'unassigned') return !company.partner_id;
        return company.partner_id === filterPartnerId;
    });

    const unassignedCount = companies.filter(c => !c.partner_id).length;

    // Format employee count
    const formatEmployees = (count: number | null) => {
        if (!count) return null;
        if (count >= 10000) return `${Math.floor(count / 1000)}K+`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={filterPartnerId === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterPartnerId('all')}
                        className="h-8"
                    >
                        All ({companies.length})
                    </Button>
                    <Button
                        variant={filterPartnerId === 'unassigned' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterPartnerId('unassigned')}
                        className={cn("h-8", unassignedCount > 0 && filterPartnerId !== 'unassigned' && "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400")}
                    >
                        Unassigned ({unassignedCount})
                    </Button>
                    {partners.map(partner => {
                        const count = companies.filter(c => c.partner_id === partner.id).length;
                        return (
                            <Button
                                key={partner.id}
                                variant={filterPartnerId === partner.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterPartnerId(partner.id)}
                                className="h-8 gap-1.5"
                            >
                                {partner.logo_url && (
                                    <img src={partner.logo_url} alt="" className="w-4 h-4 rounded object-contain" />
                                )}
                                {partner.name}
                                <span className="text-xs opacity-70">({count})</span>
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Assignments List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredCompanies.map((company) => {
                        const assignedPartner = partners.find(p => p.id === company.partner_id);

                        return (
                            <div
                                key={company.id}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                                {/* Company Logo */}
                                <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                    {company.logo_base64 ? (
                                        <img
                                            src={`data:image/png;base64,${company.logo_base64}`}
                                            alt={company.company_name || company.domain}
                                            className="w-8 h-8 object-contain"
                                        />
                                    ) : (
                                        <Building2 className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>

                                {/* Company Info */}
                                <div className="flex-1 min-w-0">
                                    <button
                                        onClick={() => onCompanyClick?.(company.domain)}
                                        className="text-left group"
                                    >
                                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {company.company_name || company.domain}
                                        </div>
                                    </button>
                                    <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                        {company.industry && (
                                            <span className="truncate max-w-[150px]">{company.industry}</span>
                                        )}
                                        {company.employee_count && (
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {formatEmployees(company.employee_count)}
                                            </span>
                                        )}
                                        {company.hq_country && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {company.hq_country}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Partner Assignment Dropdown */}
                                <div className="relative shrink-0" ref={openDropdown === company.domain ? dropdownRef : null}>
                                    <button
                                        ref={(el) => {
                                            if (el) triggerRefs.current.set(company.domain, el);
                                        }}
                                        onClick={() => {
                                            if (openDropdown === company.domain) {
                                                setOpenDropdown(null);
                                            } else {
                                                // Check if dropdown should open upward
                                                const trigger = triggerRefs.current.get(company.domain);
                                                if (trigger) {
                                                    const rect = trigger.getBoundingClientRect();
                                                    const dropdownHeight = 300; // Approximate dropdown height
                                                    const spaceBelow = window.innerHeight - rect.bottom;
                                                    setOpenUp(spaceBelow < dropdownHeight);
                                                }
                                                setOpenDropdown(company.domain);
                                            }
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm min-w-[180px]",
                                            assignedPartner
                                                ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                                                : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:border-amber-300"
                                        )}
                                    >
                                        {assignedPartner?.logo_url ? (
                                            <img src={assignedPartner.logo_url} alt="" className="w-5 h-5 rounded object-contain" />
                                        ) : (
                                            <UserCircle className="w-5 h-5 shrink-0 opacity-60" />
                                        )}
                                        <span className="truncate flex-1 text-left font-medium">
                                            {assignedPartner?.name || 'Unassigned'}
                                        </span>
                                        <ChevronDown className={cn(
                                            "w-4 h-4 shrink-0 opacity-50 transition-transform",
                                            openDropdown === company.domain && "rotate-180"
                                        )} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openDropdown === company.domain && (
                                        <div className={cn(
                                            "absolute z-50 right-0 w-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl py-2 animate-in fade-in duration-150 max-h-[300px] overflow-y-auto",
                                            openUp
                                                ? "bottom-full mb-1 slide-in-from-bottom-2"
                                                : "top-full mt-1 slide-in-from-top-2"
                                        )}>
                                            <div className="px-3 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Assign to Partner
                                            </div>

                                            <button
                                                onClick={() => {
                                                    onAssign(company.domain, null);
                                                    setOpenDropdown(null);
                                                }}
                                                className={cn(
                                                    "w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3",
                                                    !company.partner_id && "bg-slate-50 dark:bg-slate-800"
                                                )}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                    <UserCircle className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-600 dark:text-slate-300">Unassigned</div>
                                                    <div className="text-xs text-slate-400">Remove partner assignment</div>
                                                </div>
                                                {!company.partner_id && <Check className="w-4 h-4 text-blue-500" />}
                                            </button>

                                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                                            {partners.map(partner => (
                                                <button
                                                    key={partner.id}
                                                    onClick={() => {
                                                        onAssign(company.domain, partner.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className={cn(
                                                        "w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3",
                                                        company.partner_id === partner.id && "bg-blue-50 dark:bg-blue-900/20"
                                                    )}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                                                        {partner.logo_url ? (
                                                            <img src={partner.logo_url} alt="" className="w-6 h-6 object-contain" />
                                                        ) : (
                                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-slate-900 dark:text-white truncate">{partner.name}</div>
                                                        <div className="text-xs text-slate-400 truncate">{partner.description.slice(0, 40)}...</div>
                                                    </div>
                                                    {company.partner_id === partner.id && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <UserCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No companies match the selected filter</p>
                        <p className="text-sm mt-1">Try selecting a different filter above</p>
                    </div>
                )}
            </div>
        </div>
    );
}
