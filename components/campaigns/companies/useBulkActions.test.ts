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
  return { id: 1, name: 'Acme', domain: 'acme.com', status: 'default', ...overrides };
}

const companies = [
  makeCompany({ id: 1, domain: 'acme.com' }),
  makeCompany({ id: 2, domain: 'beta.io', partner_id: 10, partner_name: 'Brio' }),
  makeCompany({ id: 3, domain: 'gamma.dev' }),
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

  it('calls bulkAssignCompaniesToPartner when partnerId > 0', async () => {
    mockBulkAssign.mockResolvedValue({ assigned: 2 });
    const refetch = vi.fn();
    const onDone = vi.fn();
    const { result } = renderHook(() => useBulkActions());

    await act(async () => {
      await result.current.handleReassign('slug', 5, new Set([1, 2]), companies, refetch, onDone);
    });

    expect(mockBulkAssign).toHaveBeenCalledOnce();
    expect(mockBulkAssign).toHaveBeenCalledWith('slug', 5, [1, 2]);
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
    expect(mockUnassign).toHaveBeenCalledWith('slug', 10, 2);
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
