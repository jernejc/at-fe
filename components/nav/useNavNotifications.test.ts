import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useNavNotifications } from "./useNavNotifications";
import type { Notification } from "@/lib/schemas";

const mockGetUnreadCount = vi.fn();
const mockGetNotifications = vi.fn();
const mockMarkAllRead = vi.fn();

vi.mock("@/lib/api", () => ({
  getUnreadCount: () => mockGetUnreadCount(),
  getNotifications: (...args: unknown[]) => mockGetNotifications(...args),
  markAllRead: () => mockMarkAllRead(),
}));

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    type: "test",
    title: "Test notification",
    message: "Test message",
    data: {},
    user_id: 1,
    campaign_id: 1,
    read: false,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  mockGetUnreadCount.mockResolvedValue({ unread_count: 0 });
  mockGetNotifications.mockResolvedValue({ items: [] });
  mockMarkAllRead.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useNavNotifications", () => {
  it("initializes with closed state and zero unread count", async () => {
    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current.open).toBe(false);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("fetches unread count on mount", async () => {
    mockGetUnreadCount.mockResolvedValue({ unread_count: 3 });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(mockGetUnreadCount).toHaveBeenCalledTimes(1);
    expect(result.current.unreadCount).toBe(3);
  });

  it("polls unread count every 60 seconds", async () => {
    mockGetUnreadCount.mockResolvedValue({ unread_count: 0 });

    renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(mockGetUnreadCount).toHaveBeenCalledTimes(1);

    mockGetUnreadCount.mockResolvedValue({ unread_count: 2 });
    await act(() => vi.advanceTimersByTimeAsync(60_000));

    expect(mockGetUnreadCount).toHaveBeenCalledTimes(2);
  });

  it("silently handles unread count fetch errors", async () => {
    mockGetUnreadCount.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current.unreadCount).toBe(0);
  });

  it("loads notifications on first open", async () => {
    const items = [makeNotification({ id: 1 }), makeNotification({ id: 2 })];
    mockGetNotifications.mockResolvedValue({ items });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    await act(async () => {
      result.current.setOpen(true);
    });
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(mockGetNotifications).toHaveBeenCalledWith(25);
    expect(result.current.notifications).toEqual(items);
    expect(result.current.loading).toBe(false);
  });

  it("does not reload notifications on subsequent opens", async () => {
    mockGetNotifications.mockResolvedValue({ items: [makeNotification()] });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    // First open
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    // Close
    await act(async () => result.current.setOpen(false));

    // Second open
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(mockGetNotifications).toHaveBeenCalledTimes(1);
  });

  it("uses dynamic page size based on unread count", async () => {
    mockGetUnreadCount.mockResolvedValue({ unread_count: 40 });
    mockGetNotifications.mockResolvedValue({ items: [] });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(mockGetNotifications).toHaveBeenCalledWith(40);
  });

  it("marks all as read locally and calls API when closing with unread items", async () => {
    const unreadItem = makeNotification({ id: 1, read: false });
    const readItem = makeNotification({ id: 2, read: true });
    mockGetUnreadCount.mockResolvedValue({ unread_count: 1 });
    mockGetNotifications.mockResolvedValue({ items: [unreadItem, readItem] });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    // Open
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current.notifications[0].read).toBe(false);

    // Close
    await act(async () => result.current.setOpen(false));

    expect(result.current.notifications.every((n) => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it("does not call markAllRead when closing with no unread items", async () => {
    mockGetUnreadCount.mockResolvedValue({ unread_count: 0 });
    mockGetNotifications.mockResolvedValue({
      items: [makeNotification({ read: true })],
    });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));
    await act(async () => result.current.setOpen(false));

    expect(mockMarkAllRead).not.toHaveBeenCalled();
  });

  it("invalidates cache when polled unread count increases", async () => {
    mockGetUnreadCount.mockResolvedValue({ unread_count: 0 });
    mockGetNotifications.mockResolvedValue({ items: [makeNotification()] });

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    // First open — loads notifications
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));
    await act(async () => result.current.setOpen(false));

    expect(mockGetNotifications).toHaveBeenCalledTimes(1);

    // Simulate new unread arriving via poll
    mockGetUnreadCount.mockResolvedValue({ unread_count: 2 });
    await act(() => vi.advanceTimersByTimeAsync(60_000));

    // Open again — should re-fetch because cache was invalidated
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(mockGetNotifications).toHaveBeenCalledTimes(2);
  });

  it("silently handles notification load errors and allows retry", async () => {
    mockGetNotifications.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => useNavNotifications());
    await act(() => vi.advanceTimersByTimeAsync(0));

    // First open — fails
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current.notifications).toEqual([]);
    expect(result.current.loading).toBe(false);

    // Close and re-open — retries because loaded is still false
    await act(async () => result.current.setOpen(false));
    mockGetNotifications.mockResolvedValue({ items: [makeNotification()] });
    await act(async () => result.current.setOpen(true));
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(result.current.notifications).toHaveLength(1);
  });
});
