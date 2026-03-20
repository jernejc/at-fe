import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ChangelogDialog } from "./ChangelogDialog";

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

const mockVersions = [
  { version: "1.2.0", date: "2026-03-20", changes: ["Changelog feature", "Blue dot indicator"] },
  { version: "1.1.0", date: "2026-03-19", changes: ["Partner editing"] },
  { version: "1.0.0", date: "2026-03-18", changes: ["Initial release"] },
];

describe("ChangelogDialog", () => {
  it("renders nothing when closed", () => {
    render(
      <ChangelogDialog open={false} onOpenChange={vi.fn()} versions={mockVersions} newVersions={new Set()} />,
    );
    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("renders version entries when open", () => {
    render(
      <ChangelogDialog open={true} onOpenChange={vi.fn()} versions={mockVersions} newVersions={new Set()} />,
    );
    expect(screen.getByText("v1.2.0")).toBeInTheDocument();
    expect(screen.getByText("v1.1.0")).toBeInTheDocument();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
  });

  it("renders change items for each version", () => {
    render(
      <ChangelogDialog open={true} onOpenChange={vi.fn()} versions={mockVersions} newVersions={new Set()} />,
    );
    expect(screen.getByText("Changelog feature")).toBeInTheDocument();
    expect(screen.getByText("Blue dot indicator")).toBeInTheDocument();
    expect(screen.getByText("Partner editing")).toBeInTheDocument();
    expect(screen.getByText("Initial release")).toBeInTheDocument();
  });

  it("shows 'New' badge for new version entries", () => {
    render(
      <ChangelogDialog
        open={true}
        onOpenChange={vi.fn()}
        versions={mockVersions}
        newVersions={new Set(["1.2.0", "1.1.0"])}
      />,
    );
    const newBadges = screen.getAllByText("New");
    expect(newBadges).toHaveLength(2);
  });

  it("does not show 'New' badge for seen versions", () => {
    render(
      <ChangelogDialog
        open={true}
        onOpenChange={vi.fn()}
        versions={mockVersions}
        newVersions={new Set(["1.2.0"])}
      />,
    );
    const newBadges = screen.getAllByText("New");
    expect(newBadges).toHaveLength(1);
  });

  it("renders the dialog title", () => {
    render(
      <ChangelogDialog open={true} onOpenChange={vi.fn()} versions={mockVersions} newVersions={new Set()} />,
    );
    expect(screen.getByText("What's New")).toBeInTheDocument();
  });
});
