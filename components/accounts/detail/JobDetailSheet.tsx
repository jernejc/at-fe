import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobPostingSummary } from '@/lib/schemas';
import { formatRelativeDate } from './utils';
import { Building2, MapPin, Clock, Briefcase, Globe, ArrowUpRight, Share2, CheckCircle2 } from 'lucide-react';

interface JobDetailSheetProps {
    job: JobPostingSummary | null;
    isOpen: boolean;
    onClose: () => void;
}

export function JobDetailSheet({ job, isOpen, onClose }: JobDetailSheetProps) {
    if (!job) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="p-0 flex flex-col h-full bg-background border-l shadow-xl"
                style={{ width: '100%', maxWidth: '650px', zIndex: 60 }}
                overlayClassName="!z-[60]"
            >
                {/* Header Section */}
                <div className="p-6 border-b shrink-0 bg-muted/5 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                {job.department || 'General'}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                                ID: {job.id}
                            </span>
                        </div>
                        <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">
                            {job.title}
                        </SheetTitle>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Briefcase className="h-4 w-4" />
                            {job.employment_type || 'Full-time'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            Posted {job.posted_at ? formatRelativeDate(job.posted_at) : 'recently'}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex flex-col flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Highlights Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Role Type</span>
                            <div className="font-semibold flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" />
                                {job.is_remote ? 'Remote Friendly' : 'On-site'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</span>
                            <div className="font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                {job.department || 'Flexible'}
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* No Description Available State */}
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 text-muted-foreground">
                        <CheckCircle2 className="h-8 w-8 opacity-20" />
                        <p>No full job description available.</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
