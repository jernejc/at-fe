'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from './DeleteDialog';
import { SettingsSection } from './SettingsSection';

interface DangerZoneSectionProps {
  campaignName: string;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
}

/** Danger zone section with delete campaign action and confirmation dialog. */
export function DangerZoneSection({ campaignName, isDeleting, onDelete }: DangerZoneSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <SettingsSection title="Delete campaign" description="Permanently delete this campaign and all its data">
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete
        </Button>
      </SettingsSection>

      <DeleteDialog
        campaignName={campaignName}
        open={open}
        onOpenChange={setOpen}
        onConfirm={onDelete}
        loading={isDeleting}
      />
    </div>
  );
}
