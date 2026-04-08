import { useState } from 'react';
import { exportCampaign, exportCampaignContacts } from '@/lib/api';
import type { ExportFormat, GSheetExportResult } from '@/lib/schemas';
import { toast } from 'sonner';

interface UseCampaignExportOptions {
  slug: string;
  /** When set, exports are scoped to a single company. */
  companyId?: number;
}

interface UseCampaignExportReturn {
  isExporting: boolean;
  isExportingContacts: boolean;
  handleExport: (format: ExportFormat) => Promise<void>;
  handleExportContacts: (format: ExportFormat) => Promise<void>;
}

/** Encapsulates campaign export (companies & contacts) download logic. */
export function useCampaignExport({ slug, companyId }: UseCampaignExportOptions): UseCampaignExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingContacts, setIsExportingContacts] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!slug) return;
    try {
      setIsExporting(true);
      const result = await exportCampaign(slug, format, companyId);
      if (format === 'gsheet') {
        const { url } = result as GSheetExportResult;
        window.open(url, '_blank');
        toast.success('Google Sheet created successfully');
      } else {
        triggerDownload(result as Blob, `campaign-${slug}-export.${format}`);
        toast.success('Campaign exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export campaign');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportContacts = async (format: ExportFormat) => {
    if (!slug) return;
    try {
      setIsExportingContacts(true);
      const result = await exportCampaignContacts(slug, format, companyId);
      if (format === 'gsheet') {
        const { url } = result as GSheetExportResult;
        window.open(url, '_blank');
        toast.success('Google Sheet created successfully');
      } else {
        triggerDownload(result as Blob, `campaign-${slug}-contacts.${format}`);
        toast.success('Contacts exported successfully');
      }
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
