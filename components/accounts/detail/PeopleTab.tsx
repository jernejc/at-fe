// People Tab Component
import { EmployeeSummary } from '@/lib/schemas';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { SectionHeader } from './components';
import { TabHeaderWithAction } from './EnrichedEmptyState';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PeopleTabProps {
    decisionMakers: EmployeeSummary[];
    employees: EmployeeSummary[];
    employeesTotal: number;
    total: number;
    onLoadMore?: () => Promise<void>;
    loadingMore?: boolean;
    onProcess?: () => Promise<void>;
}

export function PeopleTab({
    decisionMakers,
    employees,
    employeesTotal,
    total,
    onSelectEmployee,
    onLoadMore,
    loadingMore = false,
    onProcess
}: PeopleTabProps & { onSelectEmployee: (employee: EmployeeSummary) => void }) {

    // Calculate how many more team members can be loaded
    const teamTotal = employeesTotal - decisionMakers.length;
    const hasMoreEmployees = employees.length < teamTotal;

    return (
        <div className="space-y-6">
            {decisionMakers.length > 0 && (
                <section>
                    <SectionHeader title="Key Contacts" color="bg-amber-500">
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
                            {decisionMakers.length} contact{decisionMakers.length !== 1 ? 's' : ''}
                        </span>
                    </SectionHeader>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-800">
                        {decisionMakers.map((e) => (
                            <PersonRow
                                key={e.id}
                                person={e}
                                highlight
                                onClick={() => onSelectEmployee(e)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {employees.length > 0 && (
                <section>
                    <SectionHeader title="Team" color="bg-blue-600">
                        <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
                            Showing {employees.length} of {teamTotal > 0 ? teamTotal : total}
                        </span>
                    </SectionHeader>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-800">
                        {employees.map((e) => (
                            <PersonRow
                                key={e.id}
                                person={e}
                                onClick={() => onSelectEmployee(e)}
                            />
                        ))}
                    </div>

                    {hasMoreEmployees && onLoadMore && (
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={onLoadMore}
                                disabled={loadingMore}
                                className="gap-2"
                            >
                                {loadingMore ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    `Load More (${teamTotal - employees.length} remaining)`
                                )}
                            </Button>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

// PersonRow component
function PersonRow({
    person,
    highlight = false,
    onClick
}: {
    person: EmployeeSummary;
    highlight?: boolean;
    onClick?: () => void;
}) {
    const hasMetadata = person.department || person.city || person.country;

    return (
        <div
            className={cn(
                "flex items-center gap-4 p-4 transition-colors",
                onClick && "cursor-pointer",
                highlight ? "bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
            onClick={onClick}
        >
            <Avatar className="w-10 h-10">
                {person.avatar_url && <AvatarImage src={person.avatar_url} />}
                <AvatarFallback className={cn(
                    "text-xs font-medium",
                    highlight ? "bg-amber-100 text-amber-700" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}>
                    {person.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-slate-900 dark:text-white">{person.full_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{person.current_title}</p>
                {hasMetadata && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {person.department && <span className="text-blue-600">{person.department}</span>}
                        {person.department && (person.city || person.country) && <span>·</span>}
                        {(person.city || person.country) && (
                            <span>{[person.city, person.country].filter(Boolean).join(', ')}</span>
                        )}
                    </div>
                )}
            </div>
            {highlight && <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded">Key Contact</span>}
            {person.profile_url && (
                <a
                    href={person.profile_url}
                    target="_blank"
                    rel="noopener"
                    className="text-blue-600 hover:text-blue-700 p-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                </a>
            )}
        </div>
    );
}
