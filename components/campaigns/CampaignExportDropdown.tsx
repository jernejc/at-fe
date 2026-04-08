'use client';

import { useState } from 'react';
import { Menu } from '@base-ui/react/menu';
import { Download, Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { SelectToggle } from '@/components/ui/select-toggle';
import { useCampaignExport } from '@/hooks/useCampaignExport';
import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/lib/schemas';

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)' },
  { value: 'csv', label: 'CSV (.csv)' },
  { value: 'gsheet', label: 'Google Sheets' },
];

const popupStyles =
  'bg-popover text-popover-foreground ring-foreground/10 min-w-48 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100';

const itemStyles =
  'flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground';

interface CampaignExportDropdownProps {
  slug: string;
  /** Button variant — defaults to "outline". */
  variant?: 'outline' | 'secondary';
  /** Which export targets to show. Defaults to ['companies']. */
  actions?: ('companies' | 'contacts')[];
  /** When set, scopes exports to a single company. */
  companyId?: number;
}

/** Dropdown with format selection and export action(s) for campaign data. */
export function CampaignExportDropdown({
  slug,
  variant = 'outline',
  actions = ['companies'],
  companyId,
}: CampaignExportDropdownProps) {
  const [format, setFormat] = useState<ExportFormat>('xlsx');
  const [open, setOpen] = useState(false);
  const { isExporting, isExportingContacts, handleExport, handleExportContacts } =
    useCampaignExport({ slug, companyId });
  const exporting = isExporting || isExportingContacts;

  return (
    <Menu.Root modal={false} open={open} onOpenChange={setOpen}>
      <Menu.Trigger
        className={cn(buttonVariants({ variant }), 'gap-1.5')}
        disabled={exporting}
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 animate-spin" data-icon="inline-start" />
        ) : (
          <Download className="w-4 h-4" data-icon="inline-start" />
        )}
        <span className="hidden md:inline">Export</span>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={4} className="isolate z-50">
          <Menu.Popup className={popupStyles}>
            {FORMAT_OPTIONS.map((opt) => (
              <Menu.Item
                key={opt.value}
                className={itemStyles}
                onClick={(e) => {
                  e.preventDefault();
                  setFormat(opt.value);
                }}
                closeOnClick={false}
              >
                <SelectToggle
                  checked={format === opt.value}
                  onChange={() => setFormat(opt.value)}
                  className="pointer-events-none"
                />
                {opt.label}
              </Menu.Item>
            ))}

            <div className="my-1 h-px bg-border" role="separator" />

            <div className="flex flex-col gap-1 p-1">
              {actions.includes('companies') && (
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => { setOpen(false); handleExport(format); }}
                  disabled={isExporting}
                >
                  {companyId != null ? 'Export Company' : 'Export Companies'}
                </Button>
              )}
              {actions.includes('contacts') && (
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => { setOpen(false); handleExportContacts(format); }}
                  disabled={isExportingContacts}
                >
                  Export Contacts
                </Button>
              )}
            </div>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
