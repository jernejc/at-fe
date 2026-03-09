'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { WSCompanyResult } from '@/lib/schemas';

interface UseResultsFiltersReturn {
  filteredCompanies: WSCompanyResult[];
  fitRange: [number, number];
  employeeRange: [number, number];
  revenueRange: [number, number];
  selectedIndustries: Set<string>;
  fitValues: number[];
  employeeValues: number[];
  revenueValues: number[];
  allIndustries: { name: string; count: number }[];
  onFitRangeChange: (range: [number, number]) => void;
  onEmployeeRangeChange: (range: [number, number]) => void;
  onRevenueRangeChange: (range: [number, number]) => void;
  onIndustryToggle: (industry: string) => void;
  resetFilters: () => void;
}

/** Manages local filter state for search results — no re-search, purely client-side. */
export function useResultsFilters(companies: WSCompanyResult[]): UseResultsFiltersReturn {
  const [fitRange, setFitRange] = useState<[number, number]>([0, 100]);
  const [employeeRange, setEmployeeRange] = useState<[number, number]>([0, 0]);
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 0]);
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set());
  const prevCompaniesRef = useRef(companies);

  // Derive histogram values from raw results
  const fitValues = useMemo(
    () => companies.map((c) => Math.round(c.match_score * 100)),
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

  // Reset filters when companies change (new search)
  useEffect(() => {
    if (companies !== prevCompaniesRef.current && companies.length > 0) {
      const empNums = companies
        .map((c) => c.employee_count)
        .filter((n): n is number => n != null);
      const empMin = empNums.length > 0 ? Math.min(...empNums) : 0;
      const empMax = empNums.length > 0 ? Math.max(...empNums) : 0;

      const revNums = companies
        .map((c) => c.revenue_amount)
        .filter((n): n is number => n != null);
      const revMin = revNums.length > 0 ? Math.min(...revNums) : 0;
      const revMax = revNums.length > 0 ? Math.max(...revNums) : 0;

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFitRange([0, 100]);
      setEmployeeRange([empMin, empMax]);
      setRevenueRange([revMin, revMax]);
      setSelectedIndustries(
        new Set(companies.map((c) => c.industry).filter(Boolean) as string[]),
      );
    }
    prevCompaniesRef.current = companies;
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const fitScore = Math.round(c.match_score * 100);
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
  }, [companies, fitRange, employeeRange, revenueRange, selectedIndustries]);

  const onFitRangeChange = useCallback((range: [number, number]) => setFitRange(range), []);
  const onEmployeeRangeChange = useCallback(
    (range: [number, number]) => setEmployeeRange(range),
    [],
  );
  const onRevenueRangeChange = useCallback(
    (range: [number, number]) => setRevenueRange(range),
    [],
  );

  const onIndustryToggle = useCallback((industry: string) => {
    setSelectedIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(industry)) next.delete(industry);
      else next.add(industry);
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFitRange([0, 100]);
    const empNums = companies
      .map((c) => c.employee_count)
      .filter((n): n is number => n != null);
    setEmployeeRange([
      empNums.length > 0 ? Math.min(...empNums) : 0,
      empNums.length > 0 ? Math.max(...empNums) : 0,
    ]);
    const revNums = companies
      .map((c) => c.revenue_amount)
      .filter((n): n is number => n != null);
    setRevenueRange([
      revNums.length > 0 ? Math.min(...revNums) : 0,
      revNums.length > 0 ? Math.max(...revNums) : 0,
    ]);
    setSelectedIndustries(
      new Set(companies.map((c) => c.industry).filter(Boolean) as string[]),
    );
  }, [companies]);

  return {
    filteredCompanies,
    fitRange,
    employeeRange,
    revenueRange,
    selectedIndustries,
    fitValues,
    employeeValues,
    revenueValues,
    allIndustries,
    onFitRangeChange,
    onEmployeeRangeChange,
    onRevenueRangeChange,
    onIndustryToggle,
    resetFilters,
  };
}
