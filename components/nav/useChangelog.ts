"use client";

import { useState, useCallback, useMemo } from "react";
import changelog from "@/changelog.json";

const STORAGE_KEY = "changelog-seen-version";

/** Read the last-seen version from localStorage (SSR-safe). */
function getSeenVersion(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Compare two semver strings numerically.
 * @returns 1 if a > b, 0 if equal, -1 if a < b
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

/** Return type for the useChangelog hook. */
export interface UseChangelogReturn {
  dialogOpen: boolean;
  openChangelog: () => void;
  closeChangelog: () => void;
  hasNewVersion: boolean;
  versions: typeof changelog.versions;
  newVersions: Set<string>;
}

/** Manages changelog dialog state, localStorage tracking, and new-version detection. */
export function useChangelog(): UseChangelogReturn {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [seenVersion, setSeenVersionState] = useState<string | null>(getSeenVersion);
  // The version to compare against for highlighting. Set to the previous seen
  // version when the dialog opens, cleared (null) on close to remove highlights.
  const [highlightBase, setHighlightBase] = useState<string | null>(null);

  const hasNewVersion = useMemo(() => {
    if (!seenVersion) return true;
    return compareSemver(appVersion, seenVersion) > 0;
  }, [appVersion, seenVersion]);

  const newVersions = useMemo(() => {
    if (!dialogOpen) return new Set<string>();
    const result = new Set<string>();
    for (const entry of changelog.versions) {
      if (!highlightBase || compareSemver(entry.version, highlightBase) > 0) {
        result.add(entry.version);
      }
    }
    return result;
  }, [highlightBase, dialogOpen]);

  const openChangelog = useCallback(() => {
    setHighlightBase(seenVersion);
    setDialogOpen(true);
    localStorage.setItem(STORAGE_KEY, appVersion);
    setSeenVersionState(appVersion);
  }, [appVersion, seenVersion]);

  const closeChangelog = useCallback(() => {
    setDialogOpen(false);
    setHighlightBase(null);
  }, []);

  return {
    dialogOpen,
    openChangelog,
    closeChangelog,
    hasNewVersion,
    versions: changelog.versions,
    newVersions,
  };
}
