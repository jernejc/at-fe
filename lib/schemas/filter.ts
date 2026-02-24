import type { ReactNode } from "react";

// ---------- Filter Types ----------

/** Operators that can be used in filter expressions */
export type FilterOperator = "is" | "is_not" | "contains" | "gt" | "lt";

/** Human-readable labels for operators */
export const FILTER_OPERATOR_LABELS: Record<FilterOperator, string> = {
  is: "is",
  is_not: "is not",
  contains: "contains",
  gt: ">",
  lt: "<",
};

/** A single selectable option within a filter category */
export interface FilterOption {
  /** Machine-readable value sent to API / used in state */
  value: string;
  /** Human-readable label shown in the menu */
  label: string;
  /** Optional icon displayed before the label */
  icon?: ReactNode;
}

/** Definition of an available filter category */
export interface FilterDefinition {
  /** Unique key identifying this filter (e.g., "status", "industry") */
  key: string;
  /** Display label shown in the menu (e.g., "Status") */
  label: string;
  /** Optional icon for the category in the menu */
  icon?: ReactNode;
  /** Allowed operators. Defaults to ["is"] if omitted. */
  operators?: FilterOperator[];
  /** Available options the user can select from */
  options: FilterOption[];
}

/** Represents a currently active filter */
export interface ActiveFilter {
  /** The filter category key (matches FilterDefinition.key) */
  key: string;
  /** The selected operator */
  operator: FilterOperator;
  /** The selected value (matches FilterOption.value) */
  value: string;
  /** Display label for the field (for badge rendering) */
  fieldLabel: string;
  /** Display label for the value (for badge rendering) */
  valueLabel: string;
}

// ---------- Sort Types ----------

/** Definition of an available sort option */
export interface SortOptionDefinition {
  /** Machine-readable key (e.g., "created_at") */
  value: string;
  /** Human-readable label (e.g., "Date Created") */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
}

/** The current sort state */
export interface SortState {
  /** The active sort field key (matches SortOptionDefinition.value) */
  field: string;
  /** Sort direction */
  direction: "asc" | "desc";
}
