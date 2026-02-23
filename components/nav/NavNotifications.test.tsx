import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { NavNotifications } from "./NavNotifications";

describe("NavNotifications", () => {
  it("renders the notification bell button", () => {
    render(<NavNotifications />);
    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });

  it("does not show the dropdown by default", () => {
    render(<NavNotifications />);
    expect(screen.queryByText("No notifications yet")).not.toBeInTheDocument();
  });

  it("shows the dropdown when the bell is clicked", async () => {
    const user = userEvent.setup();
    render(<NavNotifications />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });

  it("closes the dropdown when the bell is clicked again", async () => {
    const user = userEvent.setup();
    render(<NavNotifications />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.queryByText("No notifications yet")).not.toBeInTheDocument();
  });

  it("closes the dropdown when the backdrop overlay is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<NavNotifications />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();

    // Click the fixed backdrop overlay
    const backdrop = container.querySelector(".fixed.inset-0") as HTMLElement;
    await user.click(backdrop);
    expect(screen.queryByText("No notifications yet")).not.toBeInTheDocument();
  });
});
