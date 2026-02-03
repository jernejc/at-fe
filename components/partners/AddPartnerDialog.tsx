'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Partner, PartnerType } from '@/lib/schemas/campaign';
import { Search, Check, Building2, Zap, Briefcase, Globe, Loader2, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { getPartners, bulkAssignPartners } from '@/lib/api';
import { toast } from 'sonner';

interface AddPartnerDialogProps {
    campaignSlug: string;
    existingPartnerIds: number[];
    open: boolean;
    onClose: () => void;
    onPartnersAdded: () => void;
}

export function AddPartnerDialog({
    campaignSlug,
    existingPartnerIds,
    open,
    onClose,
    onPartnersAdded,
}: AddPartnerDialogProps) {
    const [search, setSearch] = useState('');
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartners, setSelectedPartners] = useState<Partner[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);

    // Fetch all partners from directory on open
    useEffect(() => {
        if (!open) {
            // Reset selection when dialog closes
            setSelectedPartners([]);
            setSearch('');
            return;
        }

        async function fetchPartners() {
            try {
                setLoading(true);
                const response = await getPartners({ page_size: 100 });

                // Map API PartnerSummary to UI Partner type
                // Filter out partners already in the campaign
                const mappedPartners: Partner[] = response.items
                    .filter(p => !existingPartnerIds.includes(p.id))
                    .map(p => ({
                        id: String(p.id),
                        name: p.name,
                        type: 'consulting' as PartnerType,
                        description: p.description || '',
                        status: p.status === 'active' ? 'active' : 'inactive',
                        match_score: 90,
                        logo_url: p.logo_url || undefined,
                        capacity: undefined,
                        assigned_count: 0,
                        industries: [],
                    }));

                setPartners(mappedPartners);
            } catch (err) {
                console.error('Failed to fetch partners:', err);
                toast.error('Failed to load partners');
                setPartners([]);
            } finally {
                setLoading(false);
            }
        }

        fetchPartners();
    }, [open, existingPartnerIds]);

    const filteredPartners = partners.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
    );

    const togglePartner = (partner: Partner) => {
        const isSelected = selectedPartners.some(p => p.id === partner.id);
        if (isSelected) {
            setSelectedPartners(selectedPartners.filter(p => p.id !== partner.id));
        } else {
            setSelectedPartners([...selectedPartners, partner]);
        }
    };

    const handleAssign = async () => {
        if (selectedPartners.length === 0) return;

        setIsAssigning(true);
        try {
            const partnerIds = selectedPartners.map(p => Number(p.id));
            await bulkAssignPartners(campaignSlug, partnerIds);
            toast.success(`Added ${selectedPartners.length} partner${selectedPartners.length > 1 ? 's' : ''} to campaign`);
            onPartnersAdded();
            onClose();
        } catch (error) {
            console.error('Failed to assign partners:', error);
            toast.error('Failed to add partners', {
                description: error instanceof Error ? error.message : 'Please try again',
            });
        } finally {
            setIsAssigning(false);
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
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Browse Partner Directory</DialogTitle>
                    <DialogDescription>
                        Select partners to add to this campaign. They will be able to work on assigned opportunities.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search partners by name or expertise..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                {/* Partner Grid */}
                <div className="flex-1 overflow-auto min-h-0 py-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">Loading partners...</p>
                        </div>
                    ) : filteredPartners.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            {search ? `No partners found matching "${search}"` : 'All partners are already added to this campaign'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                        <CardContent className="p-3 flex gap-3 items-start select-none">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors border overflow-hidden",
                                                isSelected
                                                    ? "bg-blue-100 border-blue-200 text-blue-600 dark:bg-blue-900/40 dark:border-blue-800 dark:text-blue-300"
                                                    : "bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-400"
                                            )}>
                                                {partner.logo_url ? (
                                                    <img src={partner.logo_url} alt="" className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <TypeIcon className="w-5 h-5" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className={cn("font-bold text-sm truncate pr-6", isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white")}>
                                                    {partner.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                                                    {partner.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={isSelected ? "default" : "secondary"} className={cn(
                                                        "capitalize font-normal text-xs",
                                                        !isSelected && "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                                    )}>
                                                        {partner.type}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className={cn(
                                                "absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300",
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
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-slate-500">
                            {selectedPartners.length > 0 && `${selectedPartners.length} partner${selectedPartners.length > 1 ? 's' : ''} selected`}
                        </span>
                        <div className="flex gap-2">
                            <DialogClose render={<Button variant="outline" />}>
                                Cancel
                            </DialogClose>
                            <Button
                                onClick={handleAssign}
                                disabled={selectedPartners.length === 0 || isAssigning}
                                className="gap-2"
                            >
                                {isAssigning ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                Add to Campaign
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
