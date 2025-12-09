// People Tab Component

import { useState } from 'react';
import { getEmployee } from '@/lib/api';
import type { EmployeeSummary, EmployeeRead } from '@/lib/schemas';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { EmptyState } from './components';
import { EmployeeDetailModal } from './EmployeeDetailModal';
import { cn } from '@/lib/utils';

interface PeopleTabProps {
    decisionMakers: EmployeeSummary[];
    employees: EmployeeSummary[];
    total: number;
}

export function PeopleTab({ decisionMakers, employees, total }: PeopleTabProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRead | null>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    const handleEmployeeClick = async (person: EmployeeSummary) => {
        setLoadingDetail(true);
        // Initialize with summary data to show header immediately
        setSelectedEmployee(person as unknown as EmployeeRead);
        setDetailModalOpen(true);
        try {
            const response = await getEmployee(person.id);
            // Merge detail data, preserving summary data if detail is missing fields
            if (response.employee) {
                setSelectedEmployee(prev => ({ ...prev, ...response.employee } as EmployeeRead));
            }
        } catch (error) {
            console.error('Failed to load employee details:', error);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseModal = () => {
        setDetailModalOpen(false);
        // Clear after animation completes
        setTimeout(() => setSelectedEmployee(null), 300);
    };

    if (decisionMakers.length === 0 && employees.length === 0) {
        return <EmptyState>No employees found</EmptyState>;
    }

    return (
        <>
            <div className="p-6 space-y-6">
                {decisionMakers.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-5 bg-amber-500" />
                            <h3 className="font-semibold">Key Contacts</h3>
                        </div>
                        <div className="border divide-y">
                            {decisionMakers.map((e) => (
                                <PersonRow
                                    key={e.id}
                                    person={e}
                                    highlight
                                    onClick={() => handleEmployeeClick(e)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {employees.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-5 bg-blue-600" />
                            <h3 className="font-semibold">Team</h3>
                            <span className="text-sm text-muted-foreground">
                                Showing {employees.length} of {total - decisionMakers.length}
                            </span>
                        </div>
                        <div className="border divide-y">
                            {employees.map((e) => (
                                <PersonRow
                                    key={e.id}
                                    person={e}
                                    onClick={() => handleEmployeeClick(e)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <EmployeeDetailModal
                employee={selectedEmployee}
                open={detailModalOpen}
                onClose={handleCloseModal}
                isLoading={loadingDetail}
            />
        </>
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
                "flex items-center gap-4 p-4 bg-background transition-colors",
                onClick && "cursor-pointer",
                highlight ? "hover:bg-amber-50/50" : "hover:bg-muted/50"
            )}
            onClick={onClick}
        >
            <Avatar className="w-10 h-10">
                {person.avatar_url && <AvatarImage src={person.avatar_url} />}
                <AvatarFallback className={cn(
                    "text-xs font-medium",
                    highlight ? "bg-amber-100 text-amber-700" : "bg-muted"
                )}>
                    {person.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{person.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">{person.current_title}</p>
                {hasMetadata && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
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
