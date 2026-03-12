import { useState, useCallback } from 'react';
import { removeCompanyFromCampaign } from '@/lib/api/campaigns';
import { bulkAssignCompaniesToPartner, unassignCompanyFromPartner } from '@/lib/api/partners';
import { toast } from 'sonner';
import type { CompanyRowData } from '@/lib/schemas';

interface UseBulkActionsReturn {
  /** Whether a remove operation is in progress. */
  isRemoving: boolean;
  /** Whether a reassign operation is in progress. */
  isReassigning: boolean;
  /** Remove selected companies from the campaign. */
  handleRemove: (
    slug: string,
    selectedIds: Set<number>,
    companies: CompanyRowData[],
    refetch: () => void,
    onDone: () => void,
  ) => Promise<void>;
  /** Reassign selected companies to a partner (partnerId=0 means unassign). */
  handleReassign: (
    slug: string,
    partnerId: number,
    selectedIds: Set<number>,
    companies: CompanyRowData[],
    refetch: () => void,
    onDone: () => void,
  ) => Promise<void>;
}

/** Handles bulk remove and reassign API calls for selected companies. */
export function useBulkActions(): UseBulkActionsReturn {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);

  const handleRemove = useCallback(async (
    slug: string,
    selectedIds: Set<number>,
    companies: CompanyRowData[],
    refetch: () => void,
    onDone: () => void,
  ) => {
    const domains = companies
      .filter((c) => selectedIds.has(c.id))
      .map((c) => c.domain);

    if (domains.length === 0) return;

    setIsRemoving(true);
    try {
      const results = await Promise.allSettled(
        domains.map((domain) => removeCompanyFromCampaign(slug, domain)),
      );
      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (failed === 0) {
        toast.success(`Removed ${succeeded} ${succeeded === 1 ? 'company' : 'companies'}`);
      } else {
        toast.warning(`Removed ${succeeded}, failed to remove ${failed}`);
      }
      refetch();
      onDone();
    } catch (error) {
      console.error('Bulk remove failed:', error);
      toast.error('Failed to remove companies');
    } finally {
      setIsRemoving(false);
    }
  }, []);

  const handleReassign = useCallback(async (
    slug: string,
    partnerId: number,
    selectedIds: Set<number>,
    companies: CompanyRowData[],
    refetch: () => void,
    onDone: () => void,
  ) => {
    const selected = companies.filter((c) => selectedIds.has(c.id));
    if (selected.length === 0) return;

    setIsReassigning(true);
    try {
      if (partnerId === 0) {
        // Unassign: remove partner assignment for each company that has one
        const withPartner = selected.filter((c) => c.partner_id != null);
        const results = await Promise.allSettled(
          withPartner.map((c) =>
            unassignCompanyFromPartner(slug, c.partner_id!, c.id),
          ),
        );
        const succeeded = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        if (failed === 0) {
          toast.success(`Unassigned ${succeeded} ${succeeded === 1 ? 'company' : 'companies'}`);
        } else {
          toast.warning(`Unassigned ${succeeded}, failed ${failed}`);
        }
      } else {
        const companyIds = selected.map((c) => c.id);
        await bulkAssignCompaniesToPartner(slug, partnerId, companyIds);
        toast.success(`Reassigned ${companyIds.length} ${companyIds.length === 1 ? 'company' : 'companies'}`);
      }
      refetch();
      onDone();
    } catch (error) {
      console.error('Bulk reassign failed:', error);
      toast.error('Failed to reassign companies');
    } finally {
      setIsReassigning(false);
    }
  }, []);

  return { isRemoving, isReassigning, handleRemove, handleReassign };
}
