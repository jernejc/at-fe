import { Loader2 } from 'lucide-react';
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

interface PublishDialogProps {
  mode: 'publish' | 'unpublish';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  unassignedCount?: number;
}

const COPY = {
  publish: {
    title: 'Publish Campaign',
    description:
      'Publishing this campaign will send notifications to all assigned partners. They will be alerted about their assigned opportunities.',
    confirm: 'Publish Campaign',
  },
  unpublish: {
    title: 'Unpublish Campaign',
    description:
      'Are you sure you want to unpublish this campaign? It will return to draft status and partners will no longer see it.',
    confirm: 'Unpublish Campaign',
  },
} as const;

/** Confirmation dialog for publishing or unpublishing a campaign. */
export function PublishDialog({ mode, open, onOpenChange, onConfirm, loading, unassignedCount }: PublishDialogProps) {
  const copy = COPY[mode];

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
          {mode === 'publish' && unassignedCount != null && unassignedCount > 0 && (
            <p className="text-sm text-destructive">
              {unassignedCount} {unassignedCount === 1 ? 'company has' : 'companies have'} no partner assigned.
            </p>
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant={mode === 'unpublish' ? 'destructive' : 'secondary'}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
