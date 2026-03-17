import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NavNotifications } from "./NavNotifications";
import type { UseNavNotificationsReturn } from "./useNavNotifications";
import type { Notification } from "@/lib/schemas";

const mockHook: UseNavNotificationsReturn = {
  open: false,
  setOpen: vi.fn(),
  unreadCount: 0,
  notifications: [],
  loading: false,
};

vi.mock("./useNavNotifications", () => ({
  useNavNotifications: () => mockHook,
}));

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    type: "test",
    title: "Test Title",
    message: "Test message body",
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
  mockHook.open = false;
  mockHook.unreadCount = 0;
  mockHook.notifications = [];
  mockHook.loading = false;
  mockHook.setOpen = vi.fn();
});

describe("NavNotifications", () => {
  it("renders the notification bell button", () => {
    render(<NavNotifications />);

    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("does not show badge when unread count is zero", () => {
    mockHook.unreadCount = 0;
    render(<NavNotifications />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows badge with unread count", () => {
    mockHook.unreadCount = 5;
    render(<NavNotifications />);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows 99+ when unread count exceeds 99", () => {
    mockHook.unreadCount = 150;
    render(<NavNotifications />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("calls setOpen when bell button is clicked", async () => {
    const user = userEvent.setup();
    render(<NavNotifications />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    expect(mockHook.setOpen).toHaveBeenCalledWith(true);
  });

  it("does not show dropdown when closed", () => {
    mockHook.open = false;
    render(<NavNotifications />);

    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  it("shows dropdown with header when open", () => {
    mockHook.open = true;
    render(<NavNotifications />);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("shows skeleton loaders when loading", () => {
    mockHook.open = true;
    mockHook.loading = true;
    const { container } = render(<NavNotifications />);

    const skeletons = container.querySelectorAll("[class*='animate-pulse']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state when no notifications and not loading", () => {
    mockHook.open = true;
    mockHook.loading = false;
    mockHook.notifications = [];
    render(<NavNotifications />);

    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  it("renders notification items with title and message", () => {
    mockHook.open = true;
    mockHook.notifications = [
      makeNotification({ id: 1, title: "Campaign published", message: "Your campaign is live" }),
      makeNotification({ id: 2, title: "New signal", message: "Acme Corp showed intent", read: true }),
    ];
    render(<NavNotifications />);

    expect(screen.getByText("Campaign published")).toBeInTheDocument();
    expect(screen.getByText("Your campaign is live")).toBeInTheDocument();
    expect(screen.getByText("New signal")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp showed intent")).toBeInTheDocument();
  });

  it("highlights unread notifications with a dot indicator", () => {
    mockHook.open = true;
    mockHook.notifications = [
      makeNotification({ id: 1, read: false, title: "Unread" }),
      makeNotification({ id: 2, read: true, title: "Read" }),
    ];
    const { container } = render(<NavNotifications />);

    const dots = container.querySelectorAll(".bg-primary.rounded-full");
    expect(dots).toHaveLength(1);
  });

  it("closes dropdown when backdrop is clicked", async () => {
    const user = userEvent.setup();
    mockHook.open = true;
    const { container } = render(<NavNotifications />);

    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    await user.click(backdrop);

    expect(mockHook.setOpen).toHaveBeenCalledWith(false);
  });
});
