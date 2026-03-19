'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { getPartners, bulkAssignPartners, removeCampaignPartner } from '@/lib/api/partners';
import { toPartnerRowDataFromSummary, type PartnerRowData } from './PartnerRow';
import type { PartnerAssignmentSummary, PartnerSummary } from '@/lib/schemas';

interface UseEditCampaignPartnersOptions {
  slug: string;
  /** Currently assigned partners from the campaign (used to seed initial selection). */
  assignedPartners: PartnerAssignmentSummary[];
  /** Campaign status — when not 'draft', partners with assigned companies cannot be removed. */
  campaignStatus: string;
  /** Called after a successful save to refresh the partners list. */
  onSaved: () => void;
}

export interface UseEditCampaignPartnersReturn {
  isEditing: boolean;
  enterEditMode: () => void;
  cancelEditMode: () => void;
  saveChanges: () => Promise<void>;
  isSaving: boolean;
  /** All available partners (paginated fetch), mapped to PartnerRowData. */
  availablePartners: PartnerRowData[];
  loadingPartners: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  selectedSlugs: Set<string>;
  /** Slugs of partners that cannot be deselected (published campaign with assigned companies). */
  disabledSlugs: Set<string>;
  togglePartner: (slug: string) => void;
  hasChanges: boolean;
  editSearchQuery: string;
  setEditSearchQuery: (q: string) => void;
  /** Partners filtered by search query. */
  filteredPartners: PartnerRowData[];
}

/** Convert an assigned partner to the PartnerSummary shape so it can appear in the list. */
function assignmentToSummary(p: PartnerAssignmentSummary): PartnerSummary {
  return {
    id: p.partner_id,
    name: p.partner_name,
    slug: p.partner_slug,
    description: p.partner_description ?? null,
    status: p.partner_status,
    logo_url: p.partner_logo_url ?? null,
    industries: p.partner_industries,
    type: p.partner_type,
    capacity: p.partner_capacity ?? null,
    created_at: p.assigned_at,
    updated_at: p.assigned_at,
  };
}

/** Manages edit mode for adding/removing partners on a campaign. */
export function useEditCampaignPartners({
  slug,
  assignedPartners,
  campaignStatus,
  onSaved,
}: UseEditCampaignPartnersOptions): UseEditCampaignPartnersReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [initialSlugs, setInitialSlugs] = useState<Set<string>>(new Set());
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const pageRef = useRef(1);

  /** Fetch the first page of all partners and build initial selection. */
  const enterEditMode = useCallback(async () => {
    setIsEditing(true);
    setLoadingPartners(true);
    setEditSearchQuery('');
    try {
      const res = await getPartners({ page_size: 50 });
      const assignedSlugs = new Set(assignedPartners.map((p) => p.partner_slug));
      const fetchedSlugs = new Set(res.items.map((p) => p.slug));

      // Assigned partners missing from the fetched page (e.g. on a later page)
      const missingAssigned = assignedPartners
        .filter((p) => !fetchedSlugs.has(p.partner_slug))
        .map(assignmentToSummary);

      // Sort: missing assigned first, then fetched assigned, then rest
      const fetchedAssigned = res.items.filter((p) => assignedSlugs.has(p.slug));
      const rest = res.items.filter((p) => !assignedSlugs.has(p.slug));
      setPartners([...missingAssigned, ...fetchedAssigned, ...rest]);

      setHasMore(res.has_next);
      pageRef.current = 1;
      setSelectedSlugs(new Set(assignedSlugs));
      setInitialSlugs(new Set(assignedSlugs));
    } catch (err) {
      console.error('Failed to load partners:', err);
      toast.error('Failed to load partners');
      setIsEditing(false);
    } finally {
      setLoadingPartners(false);
    }
  }, [assignedPartners]);

  /** Load the next page of partners and append to the list. */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const res = await getPartners({ page_size: 50, page: nextPage });
      setPartners((prev) => {
        const existing = new Set(prev.map((p) => p.slug));
        const newItems = res.items.filter((p) => !existing.has(p.slug));
        return [...prev, ...newItems];
      });
      setHasMore(res.has_next);
      pageRef.current = nextPage;
    } catch (err) {
      console.error('Failed to load more partners:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  /** Partners that cannot be deselected (published + has assigned companies). */
  const disabledSlugs = useMemo(() => {
    if (campaignStatus === 'draft') return new Set<string>();
    return new Set(
      assignedPartners
        .filter((p) => p.assigned_company_count > 0)
        .map((p) => p.partner_slug),
    );
  }, [assignedPartners, campaignStatus]);

  const togglePartner = useCallback((partnerSlug: string) => {
    if (disabledSlugs.has(partnerSlug)) return;
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(partnerSlug)) next.delete(partnerSlug);
      else next.add(partnerSlug);
      return next;
    });
  }, [disabledSlugs]);

  const cancelEditMode = useCallback(() => {
    setIsEditing(false);
    setPartners([]);
    setSelectedSlugs(new Set());
    setInitialSlugs(new Set());
    setHasMore(false);
    setEditSearchQuery('');
  }, []);

  /** Compute diffs and save changes via API. */
  const saveChanges = useCallback(async () => {
    const addedSlugs = [...selectedSlugs].filter((s) => !initialSlugs.has(s));
    const removedSlugs = [...initialSlugs].filter((s) => !selectedSlugs.has(s));

    if (addedSlugs.length === 0 && removedSlugs.length === 0) return;

    setIsSaving(true);
    try {
      const promises: Promise<unknown>[] = [];

      if (addedSlugs.length > 0) {
        const addedIds = partners
          .filter((p) => addedSlugs.includes(p.slug))
          .map((p) => p.id);
        if (addedIds.length > 0) {
          promises.push(bulkAssignPartners(slug, addedIds));
        }
      }

      if (removedSlugs.length > 0) {
        const removedIds = assignedPartners
          .filter((p) => removedSlugs.includes(p.partner_slug))
          .map((p) => p.partner_id);
        const removePromises = removedIds.map((id) => removeCampaignPartner(slug, id));
        promises.push(...removePromises);
      }

      const results = await Promise.allSettled(promises);
      const failures = results.filter((r) => r.status === 'rejected');

      if (failures.length > 0) {
        toast.error(`Some changes failed (${failures.length} error${failures.length > 1 ? 's' : ''})`);
      } else {
        toast.success('Partners updated');
      }

      onSaved();
      cancelEditMode();
    } catch (err) {
      console.error('Failed to save partner changes:', err);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [selectedSlugs, initialSlugs, partners, assignedPartners, slug, onSaved, cancelEditMode]);

  const hasChanges = useMemo(() => {
    if (selectedSlugs.size !== initialSlugs.size) return true;
    for (const s of selectedSlugs) {
      if (!initialSlugs.has(s)) return true;
    }
    return false;
  }, [selectedSlugs, initialSlugs]);

  const availablePartners = useMemo(() => partners.map(toPartnerRowDataFromSummary), [partners]);

  const filteredPartners = useMemo(() => {
    if (!editSearchQuery.trim()) return availablePartners;
    const q = editSearchQuery.trim().toLowerCase();
    return availablePartners.filter((p) => p.name.toLowerCase().includes(q));
  }, [availablePartners, editSearchQuery]);

  return {
    isEditing,
    enterEditMode,
    cancelEditMode,
    saveChanges,
    isSaving,
    availablePartners,
    loadingPartners,
    loadingMore,
    hasMore,
    loadMore,
    selectedSlugs,
    disabledSlugs,
    togglePartner,
    hasChanges,
    editSearchQuery,
    setEditSearchQuery,
    filteredPartners,
  };
}
