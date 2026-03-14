'use client';

import { Menu } from '@base-ui/react/menu';
import { Download, Loader2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useCampaignExport } from '@/hooks/useCampaignExport';
import { cn } from '@/lib/utils';

const popupStyles =
  'bg-popover text-popover-foreground ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100';

const itemStyles =
  'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

interface CampaignExportMenuProps {
  slug: string;
  /** Button variant — defaults to "outline". */
  variant?: 'outline' | 'secondary';
}

/** Dropdown menu with options to export campaign companies or contacts as XLSX. */
export function CampaignExportMenu({ slug, variant = 'outline' }: CampaignExportMenuProps) {
  const { isExporting, isExportingContacts, handleExport, handleExportContacts } =
    useCampaignExport({ slug });
  const exporting = isExporting || isExportingContacts;

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        className={cn(buttonVariants({ variant }), 'gap-1.5')}
        disabled={exporting}
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />
        ) : (
          <Download className="w-4 h-4" data-icon="inline-start" />
        )}
        Export
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={4} className="isolate z-50">
          <Menu.Popup className={popupStyles}>
            <Menu.Item className={itemStyles} onClick={handleExport}>
              Export Companies
            </Menu.Item>
            <Menu.Item className={itemStyles} onClick={handleExportContacts}>
              Export Contacts
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
