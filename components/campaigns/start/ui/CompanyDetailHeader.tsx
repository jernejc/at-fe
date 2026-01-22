'use client';

import { X, Building2, Users, MapPin } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCompactNumber } from '@/lib/utils';
import type { WSCompanyResult } from '@/lib/schemas';

interface CompanyDetailHeaderProps {
    company: WSCompanyResult;
    onClose: () => void;
}

export function CompanyDetailHeader({ company, onClose }: CompanyDetailHeaderProps) {
    const companyInitials = company.name
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const logoSrc = company.logo_base64
        ? (company.logo_base64.startsWith('data:') ? company.logo_base64 : `data:image/png;base64,${company.logo_base64}`)
        : null;

    return (
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-7">
            <div className="flex items-start gap-4">
                {/* Logo */}
                <Avatar className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                    {logoSrc && (
                        <AvatarImage
                            src={logoSrc}
                            alt={company.name}
                            className="object-contain rounded-xl"
                        />
                    )}
                    <AvatarFallback className="rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-lg font-semibold">
                        {companyInitials}
                    </AvatarFallback>
                </Avatar>

                {/* Company info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                                {company.name}
                            </h2>
                            <a
                                href={`https://${company.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                {company.domain}
                            </a>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="shrink-0 -mt-1 -mr-2"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {company.industry && (
                            <Badge variant="secondary" className="text-xs gap-1">
                                <Building2 className="w-3 h-3" />
                                {company.industry}
                            </Badge>
                        )}
                        {company.employee_count && (
                            <Badge variant="secondary" className="text-xs gap-1">
                                <Users className="w-3 h-3" />
                                {formatCompactNumber(company.employee_count)} employees
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
