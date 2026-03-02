import { useState } from 'react';
import { exportCampaignCSV, exportCampaignContactsCSV } from '@/lib/api';
import { toast } from 'sonner';

interface UseCampaignExportOptions {
  slug: string;
}

interface UseCampaignExportReturn {
  isExporting: boolean;
  isExportingContacts: boolean;
  handleExport: () => Promise<void>;
  handleExportContacts: () => Promise<void>;
}

/** Encapsulates campaign export (companies & contacts) download logic. */
export function useCampaignExport({ slug }: UseCampaignExportOptions): UseCampaignExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingContacts, setIsExportingContacts] = useState(false);

  const handleExport = async () => {
    if (!slug) return;
    try {
      setIsExporting(true);
      const blob = await exportCampaignCSV(slug);
      triggerDownload(blob, `campaign-${slug}-export.xlsx`);
      toast.success('Campaign exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export campaign');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportContacts = async () => {
    if (!slug) return;
    try {
      setIsExportingContacts(true);
      const blob = await exportCampaignContactsCSV(slug);
      triggerDownload(blob, `campaign-${slug}-contacts.xlsx`);
      toast.success('Contacts exported successfully');
    } catch (error) {
      console.error('Export contacts failed:', error);
      toast.error('Failed to export contacts');
    } finally {
      setIsExportingContacts(false);
    }
  };

  return { isExporting, isExportingContacts, handleExport, handleExportContacts };
}

/** Creates a temporary anchor to trigger a blob file download. */
function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
