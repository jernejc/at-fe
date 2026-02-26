'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface DeleteDialogProps {
  campaignName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

/** Confirmation dialog that requires typing the campaign name before deleting. */
export function DeleteDialog({ campaignName, open, onOpenChange, onConfirm, loading }: DeleteDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const canDelete = confirmation === campaignName;

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setConfirmation('');
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Type <span className="font-semibold text-foreground">{campaignName}</span> to confirm.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={campaignName}
          autoFocus
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canDelete || loading}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Delete Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
