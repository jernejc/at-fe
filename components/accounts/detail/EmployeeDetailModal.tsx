// Employee Detail Sheet Component (Drawer)

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { EmployeeRead } from '@/lib/schemas';

interface PlaybookContext {
    role_category?: string | null;
    value_prop?: string | null;
    fit_score?: number | null;
}

interface EmployeeDetailModalProps {
    employee: EmployeeRead | null;
    open: boolean;
    onClose: () => void;
    isLoading?: boolean;
    playbookContext?: PlaybookContext | null;
}

// Helper to safely get properties regardless of casing
function getValue(obj: any, keys: string[]) {
    if (!obj) return null;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return null;
}

export function EmployeeDetailModal({ employee, open, onClose, isLoading = false, playbookContext }: EmployeeDetailModalProps) {
    if (!employee) return null;

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="p-0 flex flex-col h-full bg-background border-l shadow-xl"
                style={{ width: '100%', maxWidth: '650px', zIndex: 60 }}
                overlayClassName="!z-[60]"
            >
                {/* Header (Fixed) */}
                <div className="p-6 border-b shrink-0 bg-muted/5">
                    <SheetHeader>
                        <div className="flex items-start gap-4">
                            <Avatar className="w-20 h-20 border-2 border-background shadow-sm">
                                {employee.avatar_url && <AvatarImage src={employee.avatar_url} />}
                                <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                    {(employee.full_name || '??').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <SheetTitle className="text-2xl font-bold truncate">{employee.full_name}</SheetTitle>
                                    {isLoading && <span className="text-muted-foreground animate-spin">⟳</span>}
                                </div>
                                {employee.current_title && (
                                    <p className="text-base text-muted-foreground mt-1 truncate">{employee.current_title}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {playbookContext?.role_category && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200">
                                            {playbookContext.role_category}
                                        </Badge>
                                    )}
                                    {employee.is_decision_maker && (
                                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white border-0">Decision Maker</Badge>
                                    )}
                                    {employee.department && (
                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800">{employee.department}</Badge>
                                    )}
                                    {employee.management_level && (
                                        <Badge variant="outline">{employee.management_level}</Badge>
                                    )}
                                </div>
                            </div>
                            {employee.profile_url && (
                                <a href={employee.profile_url} target="_blank" rel="noopener"
                                    className="shrink-0 p-2 text-[#0077b5] hover:bg-blue-50 rounded-full transition-colors">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                        <SheetDescription className="sr-only">Employee profile details</SheetDescription>
                    </SheetHeader>
                </div>

                {/* Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Playbook Context - Why Them? */}
                    {playbookContext?.value_prop && (
                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 shadow-sm">
                            <CardContent className="p-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    Why This Contact?
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    {playbookContext.value_prop}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bio */}
                    {employee.bio && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                About
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{employee.bio}</p>
                        </section>
                    )}

                    {/* Pending State */}
                    {isLoading && !employee.experience && (
                        <div className="py-12 text-center text-muted-foreground">
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                            </div>
                            <p className="mt-4 text-sm">Fetching full career history...</p>
                        </div>
                    )}

                    {/* Experience */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            Experience
                        </h3>
                        {employee.experience && employee.experience.length > 0 ? (
                            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-1.5 space-y-6">
                                {employee.experience.map((exp, i) => {
                                    const title = getValue(exp, ['title', 'Title']);
                                    const company = getValue(exp, ['company_name', 'companyName', 'Company_Name', 'Company']);
                                    const startDate = getValue(exp, ['start_date', 'startDate', 'Start_Date']);
                                    const endDate = getValue(exp, ['end_date', 'endDate', 'End_Date']);
                                    const description = getValue(exp, ['description', 'Description']);
                                    const location = getValue(exp, ['location', 'Location']);
                                    const duration = getValue(exp, ['duration', 'Duration']);

                                    return (
                                        <div key={i} className="pl-6 relative">
                                            {/* Timeline dot */}
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-background bg-slate-300 dark:bg-slate-600 box-content" />

                                            <h4 className="font-semibold text-base">{title || 'Unknown Title'}</h4>
                                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{company}</p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                                                <span>{startDate || '?'} - {endDate || 'Present'}</span>
                                                {duration && <span>· {duration}</span>}
                                                {location && <span>· {location}</span>}
                                            </div>
                                            {description && (
                                                <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line leading-relaxed">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : !isLoading && (
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground italic">No experience listed</p>
                            </div>
                        )}
                    </section>

                    {/* Education */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                            Education
                        </h3>
                        {employee.education && employee.education.length > 0 ? (
                            <div className="space-y-4">
                                {employee.education.map((edu, i) => {
                                    const school = getValue(edu, ['school_name', 'schoolName', 'institution_name', 'School']);
                                    const degree = getValue(edu, ['degree', 'Degree']);
                                    const field = getValue(edu, ['field_of_study', 'fieldOfStudy', 'major']);
                                    const startYear = getValue(edu, ['start_year', 'startYear', 'start_date']);
                                    const endYear = getValue(edu, ['end_year', 'endYear', 'end_date']);

                                    return (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                                                <span className="text-xl">🎓</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm">{school}</h4>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                                    {degree && field ? `${degree} in ${field}` : degree || field}
                                                </p>
                                                {(startYear || endYear) && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {startYear} {endYear && `- ${endYear}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : !isLoading && (
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground italic">No education listed</p>
                            </div>
                        )}
                    </section>

                    {/* Skills */}
                    <section>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-violet-500 rounded-full"></span>
                            Skills
                        </h3>
                        {employee.skills && employee.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {employee.skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="px-2.5 py-1 bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-100">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : !isLoading && (
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <p className="text-sm text-muted-foreground italic">No skills listed</p>
                            </div>
                        )}
                    </section>

                    {/* Certifications - Full Width */}
                    {employee.certifications && employee.certifications.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Certifications</h3>
                            <div className="space-y-3">
                                {employee.certifications.map((cert, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <span className="text-amber-500 shrink-0">🏆</span>
                                        <div>
                                            <p className="font-medium text-sm leading-tight">{cert.name}</p>
                                            {cert.issuing_authority && (
                                                <p className="text-xs text-muted-foreground mt-0.5">{cert.issuing_authority}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages - Full Width Row */}
                    {employee.languages && employee.languages.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Languages</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {employee.languages.map((lang, i) => (
                                    <Badge key={i} variant="outline" className="font-normal px-3 py-1">{lang}</Badge>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Contact Info Footer */}
                    {((employee.city || employee.country) || employee.emails?.length > 0 || employee.phones?.length > 0) && (
                        <div className="mt-8 pt-6 border-t">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Contact Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                {(employee.city || employee.country) && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span>📍</span>
                                        <span>{[employee.city, employee.state, employee.country].filter(Boolean).join(', ')}</span>
                                    </div>
                                )}
                                {employee.emails?.map((email, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span>✉️</span>
                                        <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
                                    </div>
                                ))}
                                {employee.phones?.map((phone, i) => (
                                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                                        <span>📞</span>
                                        <span>{phone}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
