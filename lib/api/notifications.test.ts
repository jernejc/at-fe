import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUnreadCount, getNotifications, markNotificationRead, markAllRead } from "./notifications";

const mockFetchAPI = vi.fn();
const mockBuildQueryString = vi.fn();

vi.mock("./core", () => ({
  fetchAPI: (...args: unknown[]) => mockFetchAPI(...args),
  buildQueryString: (...args: unknown[]) => mockBuildQueryString(...args),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockBuildQueryString.mockReturnValue("");
});

describe("getUnreadCount", () => {
  it("calls the unread-count endpoint and returns the response", async () => {
    mockFetchAPI.mockResolvedValue({ unread_count: 5 });

    const result = await getUnreadCount();

    expect(mockFetchAPI).toHaveBeenCalledWith("/api/v1/notifications/unread-count");
    expect(result).toEqual({ unread_count: 5 });
  });

  it("propagates errors from fetchAPI", async () => {
    mockFetchAPI.mockRejectedValue(new Error("Unauthorized"));

    await expect(getUnreadCount()).rejects.toThrow("Unauthorized");
  });
});

describe("getNotifications", () => {
  it("fetches notifications with default page size of 25", async () => {
    mockBuildQueryString.mockReturnValue("?page_size=25");
    mockFetchAPI.mockResolvedValue({ items: [], total: 0 });

    await getNotifications();

    expect(mockBuildQueryString).toHaveBeenCalledWith({ page_size: 25 });
    expect(mockFetchAPI).toHaveBeenCalledWith("/api/v1/notifications?page_size=25");
  });

  it("accepts a custom page size", async () => {
    mockBuildQueryString.mockReturnValue("?page_size=50");
    mockFetchAPI.mockResolvedValue({ items: [], total: 0 });

    await getNotifications(50);

    expect(mockBuildQueryString).toHaveBeenCalledWith({ page_size: 50 });
    expect(mockFetchAPI).toHaveBeenCalledWith("/api/v1/notifications?page_size=50");
  });

  it("returns paginated notification items", async () => {
    const mockResponse = {
      items: [{ id: 1, title: "Test", read: false }],
      total: 1,
      page: 0,
      page_size: 25,
      total_pages: 1,
      has_next: false,
      has_previous: false,
    };
    mockBuildQueryString.mockReturnValue("?page_size=25");
    mockFetchAPI.mockResolvedValue(mockResponse);

    const result = await getNotifications();

    expect(result).toEqual(mockResponse);
  });

  it("propagates errors from fetchAPI", async () => {
    mockBuildQueryString.mockReturnValue("?page_size=25");
    mockFetchAPI.mockRejectedValue(new Error("Server error"));

    await expect(getNotifications()).rejects.toThrow("Server error");
  });
});

describe("markNotificationRead", () => {
  it("sends a PATCH request with read payload to the notification endpoint", async () => {
    mockFetchAPI.mockResolvedValue(undefined);

    await markNotificationRead(42);

    expect(mockFetchAPI).toHaveBeenCalledWith("/api/v1/notifications/42", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
  });

  it("propagates errors from fetchAPI", async () => {
    mockFetchAPI.mockRejectedValue(new Error("Not found"));

    await expect(markNotificationRead(42)).rejects.toThrow("Not found");
  });
});

describe("markAllRead", () => {
  it("sends a POST request to mark-all-read endpoint", async () => {
    mockFetchAPI.mockResolvedValue(undefined);

    await markAllRead();

    expect(mockFetchAPI).toHaveBeenCalledWith("/api/v1/notifications/mark-all-read", {
      method: "POST",
    });
  });

  it("propagates errors from fetchAPI", async () => {
    mockFetchAPI.mockRejectedValue(new Error("Network error"));

    await expect(markAllRead()).rejects.toThrow("Network error");
  });
});
