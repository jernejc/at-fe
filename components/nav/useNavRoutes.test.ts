import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNavRoutes } from "./useNavRoutes";

const mockUseSession = vi.fn();
const mockUsePathname = vi.fn();

vi.mock("next-auth/react", () => ({ useSession: () => mockUseSession() }));
vi.mock("next/navigation", () => ({ usePathname: () => mockUsePathname() }));

beforeEach(() => {
  mockUseSession.mockReturnValue({ data: null });
  mockUsePathname.mockReturnValue("/");
});

describe("useNavRoutes", () => {
  it("returns PDM routes for non-partner users", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "pdm" } },
    });

    const { result } = renderHook(() => useNavRoutes());

    expect(result.current.routes).toEqual([
      { label: "Campaigns", href: "/" },
      { label: "Partners", href: "/partner-portal" },
      { label: "Discovery", href: "/discovery" },
    ]);
  });

  it("returns partner routes for partner users", () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: "partner" } },
    });

    const { result } = renderHook(() => useNavRoutes());

    expect(result.current.routes).toEqual([
      { label: "Campaigns", href: "/partner" },
    ]);
  });

  it("marks Campaigns active on the root path for PDM users", () => {
    mockUseSession.mockReturnValue({ data: { user: { role: "pdm" } } });
    mockUsePathname.mockReturnValue("/");

    const { result } = renderHook(() => useNavRoutes());
    expect(result.current.activeHref).toBe("/");
  });

  it("marks Campaigns active on /campaigns/* for PDM users", () => {
    mockUseSession.mockReturnValue({ data: { user: { role: "pdm" } } });
    mockUsePathname.mockReturnValue("/campaigns/some-slug");

    const { result } = renderHook(() => useNavRoutes());
    expect(result.current.activeHref).toBe("/");
  });

  it("marks Partners active on /partner-portal paths", () => {
    mockUseSession.mockReturnValue({ data: { user: { role: "pdm" } } });
    mockUsePathname.mockReturnValue("/partner-portal/123");

    const { result } = renderHook(() => useNavRoutes());
    expect(result.current.activeHref).toBe("/partner-portal");
  });

  it("marks Discovery active on /discovery paths", () => {
    mockUseSession.mockReturnValue({ data: { user: { role: "pdm" } } });
    mockUsePathname.mockReturnValue("/discovery");

    const { result } = renderHook(() => useNavRoutes());
    expect(result.current.activeHref).toBe("/discovery");
  });

  it("marks /partner active for partner users regardless of pathname", () => {
    mockUseSession.mockReturnValue({ data: { user: { role: "partner" } } });
    mockUsePathname.mockReturnValue("/partner");

    const { result } = renderHook(() => useNavRoutes());
    expect(result.current.activeHref).toBe("/partner");
  });

  it("returns empty activeHref for unmatched PDM paths", () => {
    mockUseSession.mockReturnValue({ data: { user: { role: "pdm" } } });
    mockUsePathname.mockReturnValue("/settings");

    const { result } = renderHook(() => useNavRoutes());
    expect(result.current.activeHref).toBe("");
  });
});
