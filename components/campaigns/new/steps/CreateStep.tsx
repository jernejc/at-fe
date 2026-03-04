'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampaignIconPicker } from '../create/CampaignIconPicker';
import { CampaignNameInput } from '../create/CampaignNameInput';

interface CreateStepProps {
  campaignName: string;
  onNameChange: (name: string) => void;
  campaignIcon: string;
  onIconChange: (icon: string) => void;
  isCreating: boolean;
  createError: string | null;
  onCreate: () => void;
}

/** Final step: icon picker, name input, and create button. */
export function CreateStep({
  campaignName,
  onNameChange,
  campaignIcon,
  onIconChange,
  isCreating,
  createError,
  onCreate,
}: CreateStepProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4">
      <div></div>
      <div className='flex flex-col items-center gap-8'>
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
            Almost there!
          </h1>
          <p className="text-muted-foreground">Choose an icon and a name for this campaign!</p>
        </div>

        <CampaignIconPicker icon={campaignIcon} onSelect={onIconChange} />

        <CampaignNameInput value={campaignName} onChange={onNameChange} onSubmit={onCreate} />

        <Button
          size="lg"
          variant="secondary"
          onClick={onCreate}
          disabled={!campaignName.trim() || isCreating}
          className="w-full"
        >
          {isCreating ? <Loader2 className="size-4 animate-spin mr-2" data-icon="inline-start" /> : null}
          Create campaign
        </Button>

        {createError && <p className="text-destructive text-sm max-w-sm text-center">{createError}</p>}
      </div>
      <div></div>
      <div></div>
    </div>
  );
}
