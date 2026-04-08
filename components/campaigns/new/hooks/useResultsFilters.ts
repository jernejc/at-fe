'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { WSCompanyResult } from '@/lib/schemas';

interface UseResultsFiltersReturn {
  filteredCompanies: WSCompanyResult[];
  matchRange: [number, number];
  fitRange: [number, number];
  employeeRange: [number, number];
  revenueRange: [number, number];
  selectedIndustries: Set<string>;
  matchValues: number[];
  fitValues: number[];
  employeeValues: number[];
  revenueValues: number[];
  allIndustries: { name: string; count: number }[];
  onMatchRangeChange: (range: [number, number]) => void;
  onFitRangeChange: (range: [number, number]) => void;
  onEmployeeRangeChange: (range: [number, number]) => void;
  onRevenueRangeChange: (range: [number, number]) => void;
  onIndustryToggle: (industry: string) => void;
  resetFilters: () => void;
}

type Range = [number, number];

/** Compute [min, max] of a numeric field across companies, ignoring null/undefined. */
function computeExtent(
  companies: WSCompanyResult[],
  pick: (c: WSCompanyResult) => number | null | undefined,
): Range {
  let min = Infinity;
  let max = -Infinity;
  for (const c of companies) {
    const v = pick(c);
    if (v == null) continue;
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return min === Infinity ? [0, 0] : [min, max];
}

/** Manages local filter state for search results — no re-search, purely client-side. */
export function useResultsFilters(companies: WSCompanyResult[]): UseResultsFiltersReturn {
  // User overrides — null means "follow the data extent". This avoids the
  // cascading-render trap of syncing data-derived state inside an effect.
  const [matchOverride, setMatchOverride] = useState<Range | null>(null);
  const [fitOverride, setFitOverride] = useState<Range | null>(null);
  const [employeeOverride, setEmployeeOverride] = useState<Range | null>(null);
  const [revenueOverride, setRevenueOverride] = useState<Range | null>(null);
  const [industriesOverride, setIndustriesOverride] = useState<Set<string> | null>(null);

  // Derive histogram values from raw results
  const matchValues = useMemo(
    () => companies.map((c) => Math.round(c.match_score * 100)),
    [companies],
  );

  const fitValues = useMemo(
    () => companies.map((c) => Math.round(c.product_fit_score * 100)),
    [companies],
  );

  const employeeValues = useMemo(
    () => companies.filter((c) => c.employee_count).map((c) => c.employee_count!),
    [companies],
  );

  const revenueValues = useMemo(
    () => companies.filter((c) => c.revenue_amount).map((c) => c.revenue_amount!),
    [companies],
  );

  const allIndustries = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of companies) {
      if (c.industry) counts.set(c.industry, (counts.get(c.industry) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [companies]);

  // Auto extents derived from current data; effective range falls back to these
  // when the user hasn't overridden the filter.
  const employeeAuto = useMemo(() => computeExtent(companies, (c) => c.employee_count), [companies]);
  const revenueAuto = useMemo(() => computeExtent(companies, (c) => c.revenue_amount), [companies]);
  const industriesAuto = useMemo(
    () => new Set(allIndustries.map((i) => i.name)),
    [allIndustries],
  );

  // Mirror the latest auto industry set into a ref so the stable toggle
  // callback can read it without depending on it.
  const industriesAutoRef = useRef(industriesAuto);
  useEffect(() => {
    industriesAutoRef.current = industriesAuto;
  }, [industriesAuto]);

  const matchRange: Range = useMemo(() => matchOverride ?? [0, 100], [matchOverride]);
  const fitRange: Range = useMemo(() => fitOverride ?? [0, 100], [fitOverride]);
  const employeeRange: Range = employeeOverride ?? employeeAuto;
  const revenueRange: Range = revenueOverride ?? revenueAuto;
  const selectedIndustries: Set<string> = industriesOverride ?? industriesAuto;

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchScoreVal = Math.round(c.match_score * 100);
      if (matchScoreVal < matchRange[0] || matchScoreVal > matchRange[1]) return false;

      const fitScore = Math.round(c.product_fit_score * 100);
      if (fitScore < fitRange[0] || fitScore > fitRange[1]) return false;

      if (c.employee_count != null) {
        if (c.employee_count < employeeRange[0] || c.employee_count > employeeRange[1]) {
          return false;
        }
      }

      if (c.revenue_amount != null) {
        if (c.revenue_amount < revenueRange[0] || c.revenue_amount > revenueRange[1]) {
          return false;
        }
      }

      if (selectedIndustries.size > 0 && c.industry) {
        if (!selectedIndustries.has(c.industry)) return false;
      }

      return true;
    });
  }, [companies, matchRange, fitRange, employeeRange, revenueRange, selectedIndustries]);

  const onMatchRangeChange = useCallback((range: Range) => setMatchOverride(range), []);
  const onFitRangeChange = useCallback((range: Range) => setFitOverride(range), []);
  const onEmployeeRangeChange = useCallback((range: Range) => setEmployeeOverride(range), []);
  const onRevenueRangeChange = useCallback((range: Range) => setRevenueOverride(range), []);

  const onIndustryToggle = useCallback((industry: string) => {
    setIndustriesOverride((prev) => {
      // First touch: branch off the current auto set so toggling one industry
      // deselects only that one (the rest stay selected).
      const base = prev ?? industriesAutoRef.current;
      const next = new Set(base);
      if (next.has(industry)) next.delete(industry);
      else next.add(industry);
      return next;
    });
  }, []);

  /** Stable reset — clears all user overrides so filters fall back to data extents. */
  const resetFilters = useCallback(() => {
    setMatchOverride(null);
    setFitOverride(null);
    setEmployeeOverride(null);
    setRevenueOverride(null);
    setIndustriesOverride(null);
  }, []);

  return {
    filteredCompanies,
    matchRange,
    fitRange,
    employeeRange,
    revenueRange,
    selectedIndustries,
    matchValues,
    fitValues,
    employeeValues,
    revenueValues,
    allIndustries,
    onMatchRangeChange,
    onFitRangeChange,
    onEmployeeRangeChange,
    onRevenueRangeChange,
    onIndustryToggle,
    resetFilters,
  };
}
