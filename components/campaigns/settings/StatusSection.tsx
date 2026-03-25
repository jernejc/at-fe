'use client';

import { useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCampaignDetail } from '@/components/providers/CampaignDetailProvider';
import { PublishDialog } from '../detail/PublishDialog';
import { SettingsSection } from './SettingsSection';

interface StatusSectionProps {
  status: string;
}

/** Publish/unpublish toggle using the shared CampaignDetail context handlers. */
export function StatusSection({ status }: StatusSectionProps) {
  const { handlePublish, handleUnpublish, isPublishing, isUnpublishing, overview } = useCampaignDetail();
  const [publishDialogMode, setPublishDialogMode] = useState<'publish' | 'unpublish' | null>(null);

  const isPublished = status === 'published';
  const isLoading = isPublishing || isUnpublishing;

  return (
    <SettingsSection
      title="Status"
      description={isPublished ? 'Campaign is live and visible to partners' : 'Campaign is in draft mode'}
    >
      <div className="flex items-center gap-3">
        <Button
          variant={isPublished ? 'outline' : 'secondary'}
          onClick={() => setPublishDialogMode(isPublished ? 'unpublish' : 'publish')}
          disabled={isLoading}
        >
          {isLoading
            ? <Loader2 className="animate-spin" data-icon="inline-start" />
            : isPublished ? <BellOff data-icon="inline-start" /> : <Bell data-icon="inline-start" />}

          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
      </div>

      <PublishDialog
        mode={publishDialogMode ?? 'publish'}
        open={publishDialogMode !== null}
        onOpenChange={(open) => !open && setPublishDialogMode(null)}
        onConfirm={publishDialogMode === 'unpublish' ? handleUnpublish : handlePublish}
        loading={publishDialogMode === 'unpublish' ? isUnpublishing : isPublishing}
        unassignedCount={overview?.unassigned_company_count}
      />
    </SettingsSection>
  );
}
