'use client';

import { useState, useCallback } from 'react';
import { getEmployee } from '@/lib/api/employees';
import type { EmployeeDetailResponse } from '@/lib/schemas';

export interface UseEmployeeSelectionReturn {
  selectedEmployeeId: number | null;
  employee: EmployeeDetailResponse | null;
  employeeLoading: boolean;
  selectEmployee: (employeeId: number) => void;
  clearSelection: () => void;
}

/** Manages employee selection and detail fetching for detail panels. */
export function useEmployeeSelection(): UseEmployeeSelectionReturn {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [employee, setEmployee] = useState<EmployeeDetailResponse | null>(null);
  const [employeeLoading, setEmployeeLoading] = useState(false);

  const selectEmployee = useCallback((employeeId: number) => {
    // Toggle off if same employee clicked
    if (employeeId === selectedEmployeeId) {
      setSelectedEmployeeId(null);
      setEmployee(null);
      return;
    }

    setSelectedEmployeeId(employeeId);
    setEmployeeLoading(true);
    setEmployee(null);

    getEmployee(employeeId)
      .then((res) => {
        setEmployee(res);
      })
      .catch((err) => {
        console.error('Failed to fetch employee detail', err);
      })
      .finally(() => {
        setEmployeeLoading(false);
      });
  }, [selectedEmployeeId]);

  const clearSelection = useCallback(() => {
    setSelectedEmployeeId(null);
    setEmployee(null);
  }, []);

  return { selectedEmployeeId, employee, employeeLoading, selectEmployee, clearSelection };
}
