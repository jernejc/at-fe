'use client';

import { useState, useCallback } from 'react';
import { Popover } from '@base-ui/react/popover';
import { CampaignIcon, CAMPAIGN_ICON_NAMES, type CampaignIconName } from '@/lib/config/campaign-icons';
import { cn } from '@/lib/utils';

interface CampaignIconPickerProps {
  icon: CampaignIconName;
  onSelect: (icon: CampaignIconName) => void;
}

/** Large icon button with popover grid for selecting a campaign icon. */
export function CampaignIconPicker({ icon, onSelect }: CampaignIconPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (name: CampaignIconName) => {
      setOpen(false);
      onSelect(name);
    },
    [onSelect],
  );

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={cn(
          'flex items-center justify-center w-20 h-20 rounded-full border border-border',
          'bg-background hover:bg-muted transition-colors cursor-pointer',
        )}
      >
        <CampaignIcon name={icon} className="w-10 h-10 text-foreground" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className={cn(
              'bg-background border border-border rounded-xl shadow-lg p-3',
              'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
              'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
              'duration-100 z-50',
            )}
          >
            <div className="grid grid-cols-7 gap-1 max-h-64 overflow-y-auto">
              {CAMPAIGN_ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelect(name)}
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer',
                    name === icon ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                  )}
                  title={name}
                >
                  <CampaignIcon name={name} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
