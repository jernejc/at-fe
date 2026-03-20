import { describe, it, expect } from "vitest";
import pkg from "./package.json";
import changelog from "./changelog.json";

describe("changelog.json sync", () => {
  it("has an entry matching the current package.json version", () => {
    const match = changelog.versions.find((v) => v.version === pkg.version);
    expect(match).toBeDefined();
    expect(match!.changes.length).toBeGreaterThan(0);
  });

  it("has versions in descending order (newest first)", () => {
    const versions = changelog.versions.map((v) => v.version);
    for (let i = 0; i < versions.length - 1; i++) {
      const [aMaj, aMin, aPat] = versions[i].split(".").map(Number);
      const [bMaj, bMin, bPat] = versions[i + 1].split(".").map(Number);
      const aIsGreater =
        aMaj > bMaj ||
        (aMaj === bMaj && aMin > bMin) ||
        (aMaj === bMaj && aMin === bMin && aPat > bPat);
      expect(aIsGreater).toBe(true);
    }
  });

  it("has valid date format for all entries", () => {
    for (const entry of changelog.versions) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("has no duplicate version numbers", () => {
    const versions = changelog.versions.map((v) => v.version);
    expect(new Set(versions).size).toBe(versions.length);
  });
});
