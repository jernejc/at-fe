import { useState, useCallback, useRef } from 'react';
import type { CompanyRowData } from '@/lib/schemas';

interface UseBulkSelectionReturn {
  /** Whether edit/selection mode is active. */
  isEditing: boolean;
  /** Set of currently selected company IDs. */
  selectedIds: Set<number>;
  /** Number of selected companies. */
  selectedCount: number;
  /** Enter edit mode. */
  startEditing: () => void;
  /** Exit edit mode and clear selections. */
  cancelEditing: () => void;
  /** Toggle selection for a single company. Pass shiftKey for range selection. */
  toggleSelect: (id: number, shiftKey: boolean, companies: CompanyRowData[]) => void;
  /** Toggle all visible companies. Selects all if not all selected, otherwise deselects all. */
  toggleSelectAll: (companies: CompanyRowData[]) => void;
  /** Whether all visible companies are selected. */
  isAllSelected: (companies: CompanyRowData[]) => boolean;
  /** Whether some but not all visible companies are selected. */
  isPartiallySelected: (companies: CompanyRowData[]) => boolean;
  /** Clear all selections without exiting edit mode. */
  clearSelection: () => void;
}

/** Manages bulk selection state with shift-click range support. */
export function useBulkSelection(): UseBulkSelectionReturn {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const lastClickedIdRef = useRef<number | null>(null);

  const startEditing = useCallback(() => {
    setIsEditing(true);
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedIdRef.current = null;
  }, []);

  const toggleSelect = useCallback((id: number, shiftKey: boolean, companies: CompanyRowData[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (shiftKey && lastClickedIdRef.current !== null) {
        const lastIdx = companies.findIndex((c) => c.id === lastClickedIdRef.current);
        const currentIdx = companies.findIndex((c) => c.id === id);

        if (lastIdx !== -1 && currentIdx !== -1) {
          const start = Math.min(lastIdx, currentIdx);
          const end = Math.max(lastIdx, currentIdx);
          for (let i = start; i <= end; i++) {
            next.add(companies[i].id);
          }
          lastClickedIdRef.current = id;
          return next;
        }
      }

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      lastClickedIdRef.current = id;
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((companies: CompanyRowData[]) => {
    setSelectedIds((prev) => {
      const allIds = companies.map((c) => c.id);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, []);

  const isAllSelected = useCallback((companies: CompanyRowData[]) => {
    if (companies.length === 0) return false;
    return companies.every((c) => selectedIds.has(c.id));
  }, [selectedIds]);

  const isPartiallySelected = useCallback((companies: CompanyRowData[]) => {
    if (companies.length === 0) return false;
    const someSelected = companies.some((c) => selectedIds.has(c.id));
    const allSelected = companies.every((c) => selectedIds.has(c.id));
    return someSelected && !allSelected;
  }, [selectedIds]);

  return {
    isEditing,
    selectedIds,
    selectedCount: selectedIds.size,
    startEditing,
    cancelEditing,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,
    isPartiallySelected,
    clearSelection,
  };
}
