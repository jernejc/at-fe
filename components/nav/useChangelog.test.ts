import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/changelog.json", () => ({
  default: {
    versions: [
      { version: "1.2.0", date: "2026-03-20", changes: ["Changelog feature"] },
      { version: "1.1.0", date: "2026-03-19", changes: ["Partner editing"] },
      { version: "1.0.0", date: "2026-03-18", changes: ["Initial release"] },
    ],
  },
}));

vi.stubEnv("NEXT_PUBLIC_APP_VERSION", "1.2.0");

import { useChangelog } from "./useChangelog";

beforeEach(() => {
  localStorage.clear();
});

describe("useChangelog", () => {
  it("shows hasNewVersion when no version seen before", () => {
    const { result } = renderHook(() => useChangelog());
    expect(result.current.hasNewVersion).toBe(true);
  });

  it("shows hasNewVersion when seen version is older", () => {
    localStorage.setItem("changelog-seen-version", "1.0.0");
    const { result } = renderHook(() => useChangelog());
    expect(result.current.hasNewVersion).toBe(true);
  });

  it("does not show hasNewVersion when seen version matches current", () => {
    localStorage.setItem("changelog-seen-version", "1.2.0");
    const { result } = renderHook(() => useChangelog());
    expect(result.current.hasNewVersion).toBe(false);
  });

  it("returns empty newVersions when dialog is closed", () => {
    localStorage.setItem("changelog-seen-version", "1.0.0");
    const { result } = renderHook(() => useChangelog());
    expect(result.current.newVersions.size).toBe(0);
  });

  it("saves current version to localStorage on open", () => {
    localStorage.setItem("changelog-seen-version", "1.0.0");
    const { result } = renderHook(() => useChangelog());

    act(() => {
      result.current.openChangelog();
    });

    expect(localStorage.getItem("changelog-seen-version")).toBe("1.2.0");
    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.hasNewVersion).toBe(false);
  });

  it("highlights versions newer than previous seen version while dialog is open", () => {
    localStorage.setItem("changelog-seen-version", "1.0.0");
    const { result } = renderHook(() => useChangelog());

    act(() => {
      result.current.openChangelog();
    });

    expect(result.current.newVersions.has("1.2.0")).toBe(true);
    expect(result.current.newVersions.has("1.1.0")).toBe(true);
    expect(result.current.newVersions.has("1.0.0")).toBe(false);
  });

  it("clears highlights when dialog closes", () => {
    localStorage.setItem("changelog-seen-version", "1.0.0");
    const { result } = renderHook(() => useChangelog());

    act(() => {
      result.current.openChangelog();
    });
    act(() => {
      result.current.closeChangelog();
    });

    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.newVersions.size).toBe(0);
  });

  it("returns all changelog versions", () => {
    const { result } = renderHook(() => useChangelog());
    expect(result.current.versions).toHaveLength(3);
  });
});
