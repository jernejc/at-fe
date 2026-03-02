import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useBulkSelection } from './useBulkSelection';
import type { CompanyRowData } from '@/lib/schemas';

function makeCompany(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return { id: 1, name: 'Acme', domain: 'acme.com', status: 'default', ...overrides };
}

const companies = [
  makeCompany({ id: 1 }),
  makeCompany({ id: 2 }),
  makeCompany({ id: 3 }),
  makeCompany({ id: 4 }),
  makeCompany({ id: 5 }),
];

describe('useBulkSelection', () => {
  describe('edit mode', () => {
    it('starts with editing off', () => {
      const { result } = renderHook(() => useBulkSelection());
      expect(result.current.isEditing).toBe(false);
    });

    it('enters edit mode via startEditing', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.startEditing());
      expect(result.current.isEditing).toBe(true);
    });

    it('exits edit mode and clears selection via cancelEditing', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.startEditing());
      act(() => result.current.toggleSelect(1, false, companies));
      expect(result.current.selectedCount).toBe(1);

      act(() => result.current.cancelEditing());
      expect(result.current.isEditing).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('toggleSelect', () => {
    it('selects a company by id', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelect(2, false, companies));
      expect(result.current.selectedIds.has(2)).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('deselects an already-selected company', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelect(2, false, companies));
      act(() => result.current.toggleSelect(2, false, companies));
      expect(result.current.selectedIds.has(2)).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });

    it('selects multiple companies independently', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelect(1, false, companies));
      act(() => result.current.toggleSelect(3, false, companies));
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectedIds.has(1)).toBe(true);
      expect(result.current.selectedIds.has(3)).toBe(true);
    });
  });

  describe('shift-click range selection', () => {
    it('selects range between last-clicked and current when shift is held', () => {
      const { result } = renderHook(() => useBulkSelection());
      // First click on id=1 (index 0)
      act(() => result.current.toggleSelect(1, false, companies));
      // Shift+click on id=4 (index 3) — should select 1,2,3,4
      act(() => result.current.toggleSelect(4, true, companies));
      expect(result.current.selectedCount).toBe(4);
      expect(result.current.selectedIds.has(1)).toBe(true);
      expect(result.current.selectedIds.has(2)).toBe(true);
      expect(result.current.selectedIds.has(3)).toBe(true);
      expect(result.current.selectedIds.has(4)).toBe(true);
    });

    it('handles reverse shift-click range (higher to lower index)', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelect(4, false, companies));
      act(() => result.current.toggleSelect(2, true, companies));
      expect(result.current.selectedCount).toBe(3);
      expect(result.current.selectedIds.has(2)).toBe(true);
      expect(result.current.selectedIds.has(3)).toBe(true);
      expect(result.current.selectedIds.has(4)).toBe(true);
    });

    it('does not range-select without a prior click', () => {
      const { result } = renderHook(() => useBulkSelection());
      // Shift+click with no prior click — should just toggle single item
      act(() => result.current.toggleSelect(3, true, companies));
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.selectedIds.has(3)).toBe(true);
    });
  });

  describe('toggleSelectAll', () => {
    it('selects all companies when none are selected', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelectAll(companies));
      expect(result.current.selectedCount).toBe(5);
    });

    it('deselects all companies when all are selected', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelectAll(companies));
      act(() => result.current.toggleSelectAll(companies));
      expect(result.current.selectedCount).toBe(0);
    });

    it('selects all when only some are selected (partial → all)', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelect(1, false, companies));
      act(() => result.current.toggleSelectAll(companies));
      expect(result.current.selectedCount).toBe(5);
    });

    it('does nothing for an empty list', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelectAll([]));
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe('isAllSelected / isPartiallySelected', () => {
    it('returns false for both when nothing is selected', () => {
      const { result } = renderHook(() => useBulkSelection());
      expect(result.current.isAllSelected(companies)).toBe(false);
      expect(result.current.isPartiallySelected(companies)).toBe(false);
    });

    it('returns partial when some are selected', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelect(1, false, companies));
      expect(result.current.isAllSelected(companies)).toBe(false);
      expect(result.current.isPartiallySelected(companies)).toBe(true);
    });

    it('returns all when everything is selected', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.toggleSelectAll(companies));
      expect(result.current.isAllSelected(companies)).toBe(true);
      expect(result.current.isPartiallySelected(companies)).toBe(false);
    });

    it('returns false for both on empty companies list', () => {
      const { result } = renderHook(() => useBulkSelection());
      expect(result.current.isAllSelected([])).toBe(false);
      expect(result.current.isPartiallySelected([])).toBe(false);
    });
  });

  describe('clearSelection', () => {
    it('clears selection without exiting edit mode', () => {
      const { result } = renderHook(() => useBulkSelection());
      act(() => result.current.startEditing());
      act(() => result.current.toggleSelect(1, false, companies));
      act(() => result.current.toggleSelect(2, false, companies));
      expect(result.current.selectedCount).toBe(2);

      act(() => result.current.clearSelection());
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isEditing).toBe(true);
    });
  });
});
