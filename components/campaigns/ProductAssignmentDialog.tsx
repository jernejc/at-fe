'use client';

import { useState, useEffect } from 'react';
import { updateCampaign } from '@/lib/api';
import type { CampaignSummary } from '@/lib/schemas';
import type { ProductSummary } from '@/lib/schemas/product';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Package, AlertTriangle } from 'lucide-react';

interface ProductAssignmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: CampaignSummary | null;
    products: ProductSummary[];
    onProductAssigned: () => void;
}

export function ProductAssignmentDialog({
    open,
    onOpenChange,
    campaign,
    products,
    onProductAssigned,
}: ProductAssignmentDialogProps) {
    const [productId, setProductId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setProductId(null);
            setError(null);
        }
    }, [open]);

    const handleAssign = async () => {
        if (!campaign || !productId) {
            setError('Please select a product');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await updateCampaign(campaign.slug, {
                target_product_id: productId,
            });
            onProductAssigned();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to assign product');
            console.error('Error assigning product:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!campaign) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Assign Product
                    </DialogTitle>
                    <DialogDescription>
                        The campaign &quot;{campaign.name}&quot; doesn&apos;t have a product assigned.
                        Please select a product to continue.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Campaign Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {campaign.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {campaign.company_count} companies · Created {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Product Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Select Product <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={productId?.toString() || ''}
                            onValueChange={(value) => setProductId(value ? parseInt(value) : null)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue>
                                    {productId ? (
                                        <span className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-slate-400" />
                                            {products.find(p => p.id === productId)?.name}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Choose a product</span>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                        <Package className="w-4 h-4 text-slate-400" />
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            This will associate the campaign with the selected product for fit scoring.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={saving || !productId}
                        className="gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Assign Product
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
