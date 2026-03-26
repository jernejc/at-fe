import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBulkActions } from './useBulkActions';
import type { CompanyRowData } from '@/lib/schemas';

const mockRemoveCompany = vi.fn();
const mockBulkAssign = vi.fn();
const mockUnassign = vi.fn();

vi.mock('@/lib/api/campaigns', () => ({
  removeCompanyFromCampaign: (...args: any[]) => mockRemoveCompany(...args),
}));

vi.mock('@/lib/api/partners', () => ({
  bulkAssignCompaniesToPartner: (...args: any[]) => mockBulkAssign(...args),
  unassignCompanyFromPartner: (...args: any[]) => mockUnassign(...args),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

function makeCompany(overrides: Partial<CompanyRowData> = {}): CompanyRowData {
  return { id: 1, company_id: 101, name: 'Acme', domain: 'acme.com', status: 'default', ...overrides };
}

const companies = [
  makeCompany({ id: 1, company_id: 101, domain: 'acme.com' }),
  makeCompany({ id: 2, company_id: 102, domain: 'beta.io', partner_id: 10, partner_name: 'Brio' }),
  makeCompany({ id: 3, company_id: 103, domain: 'gamma.dev' }),
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBulkActions — handleRemove', () => {
  it('starts with isRemoving false', () => {
    const { result } = renderHook(() => useBulkActions());
    expect(result.current.isRemoving).toBe(false);
  });

  it('calls removeCompanyFromCampaign for each selected company', async () => {
    mockRemoveCompany.mockResolvedValue(undefined);
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleRemove('test-slug', new Set([1, 3]), companies, refetch, onDone);
    });

    expect(mockRemoveCompany).toHaveBeenCalledTimes(2);
    expect(mockRemoveCompany).toHaveBeenCalledWith('test-slug', 'acme.com');
    expect(mockRemoveCompany).toHaveBeenCalledWith('test-slug', 'gamma.dev');
    expect(refetch).toHaveBeenCalledOnce();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('does nothing when no companies match selectedIds', async () => {
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleRemove('slug', new Set([999]), companies, refetch, onDone);
    });

    expect(mockRemoveCompany).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('handles partial failures gracefully', async () => {
    mockRemoveCompany
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('fail'));
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleRemove('slug', new Set([1, 2]), companies, refetch, onDone);
    });

    expect(refetch).toHaveBeenCalledOnce();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('resets isRemoving after completion', async () => {
    mockRemoveCompany.mockResolvedValue(undefined);
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleRemove('slug', new Set([1]), companies, vi.fn(), vi.fn());
    });

    expect(result.current.isRemoving).toBe(false);
  });
});

describe('useBulkActions — handleReassign', () => {
  it('starts with isReassigning false', () => {
    const { result } = renderHook(() => useBulkActions());
    expect(result.current.isReassigning).toBe(false);
  });

  it('unassigns existing partners before bulk assigning to new partner', async () => {
    mockUnassign.mockResolvedValue(undefined);
    mockBulkAssign.mockResolvedValue({ assigned: 2 });
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    // Company id=2 has partner_id=10, so it should be unassigned first
    await act(async () => {
      await result.current.handleReassign('slug', 5, new Set([1, 2]), companies, refetch, onDone);
    });

    // Unassign company with existing partner
    expect(mockUnassign).toHaveBeenCalledOnce();
    expect(mockUnassign).toHaveBeenCalledWith('slug', 10, 102);
    // Then bulk assign all selected
    expect(mockBulkAssign).toHaveBeenCalledOnce();
    expect(mockBulkAssign).toHaveBeenCalledWith('slug', 5, [101, 102]);
    expect(refetch).toHaveBeenCalledOnce();
    expect(onDone).toHaveBeenCalledOnce();
  });

  it('calls unassignCompanyFromPartner for each company with a partner when partnerId is 0', async () => {
    mockUnassign.mockResolvedValue(undefined);
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    // Only company id=2 has partner_id='10'
    await act(async () => {
      await result.current.handleReassign('slug', 0, new Set([1, 2, 3]), companies, refetch, onDone);
    });

    expect(mockUnassign).toHaveBeenCalledOnce();
    expect(mockUnassign).toHaveBeenCalledWith('slug', 10, 102);
    expect(mockBulkAssign).not.toHaveBeenCalled();
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('does nothing when no companies match selectedIds', async () => {
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleReassign('slug', 5, new Set([999]), companies, refetch, onDone);
    });

    expect(mockBulkAssign).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('resets isReassigning after completion', async () => {
    mockBulkAssign.mockResolvedValue({ assigned: 1 });
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleReassign('slug', 5, new Set([1]), companies, vi.fn(), vi.fn());
    });

    expect(result.current.isReassigning).toBe(false);
  });

  it('skips companies already assigned to the target partner', async () => {
    mockBulkAssign.mockResolvedValue({ assigned: 1 });
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    // Company id=2 has partner_id=10, so it should be skipped when reassigning to partner 10
    await act(async () => {
      await result.current.handleReassign('slug', 10, new Set([1, 2]), companies, refetch, onDone);
    });

    expect(mockBulkAssign).toHaveBeenCalledOnce();
    expect(mockBulkAssign).toHaveBeenCalledWith('slug', 10, [101]); // only company_id 101, not 102
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('shows message when all selected are already assigned to the target partner', async () => {
    const { toast } = await import('sonner');
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    // Only select company id=2 which is already assigned to partner 10
    await act(async () => {
      await result.current.handleReassign('slug', 10, new Set([2]), companies, refetch, onDone);
    });

    expect(mockBulkAssign).not.toHaveBeenCalled();
    expect(refetch).not.toHaveBeenCalled();
    expect(onDone).toHaveBeenCalledOnce();
    expect(toast.success).toHaveBeenCalledWith('All selected companies are already assigned to this partner');
  });

  it('handles API failure gracefully', async () => {
    mockBulkAssign.mockRejectedValue(new Error('Network error'));
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleReassign('slug', 5, new Set([1]), companies, refetch, onDone);
    });

    expect(result.current.isReassigning).toBe(false);
    expect(refetch).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
