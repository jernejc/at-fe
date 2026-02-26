'use client';

import { useState, useCallback } from 'react';
import { Popover } from '@base-ui/react/popover';
import { CampaignIcon, CAMPAIGN_ICON_NAMES } from '@/lib/config/campaign-icons';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsSection } from './SettingsSection';

interface IconSectionProps {
  icon: string | null;
  isSaving: boolean;
  onSave: (icon: string) => Promise<void>;
}

/** Icon picker that opens a popover grid of available campaign icons. */
export function IconSection({ icon, isSaving, onSave }: IconSectionProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(async (name: string) => {
    setOpen(false);
    await onSave(name);
  }, [onSave]);

  return (
    <SettingsSection title="Icon" description="It will help identify your campaign">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          disabled={isSaving}
          className={cn(
            'flex items-center justify-center w-16 h-16 rounded-full border border-border',
            'bg-background hover:bg-muted transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {isSaving ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <CampaignIcon name={icon} className="w-8 h-8 text-foreground" />
          )}
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
    </SettingsSection>
  );
}
