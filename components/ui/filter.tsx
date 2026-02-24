"use client"

import { cn } from "@/lib/utils"
import { FilterMenu } from "@/components/ui/filter-menu"
import { FilterBadge } from "@/components/ui/filter-badge"
import type {
  FilterDefinition,
  FilterOperator,
  ActiveFilter,
} from "@/lib/schemas/filter"

interface FilterProps {
  /** Filter category definitions */
  definitions: FilterDefinition[]
  /** Currently active filters (controlled) */
  value: ActiveFilter[]
  /** Callback when filters change */
  onValueChange: (filters: ActiveFilter[]) => void
  className?: string
}

/**
 * Reusable filter component with dropdown menu and active filter badges.
 * Accepts filter definitions for configuration and emits active filter state.
 */
export function Filter({
  definitions,
  value,
  onValueChange,
  className,
}: FilterProps) {
  const handleFilterSelect = (
    key: string,
    operator: FilterOperator,
    optionValue: string,
  ) => {
    const def = definitions.find((d) => d.key === key)
    const opt = def?.options.find((o) => o.value === optionValue)
    if (!def || !opt) return

    const newFilter: ActiveFilter = {
      key,
      operator,
      value: optionValue,
      fieldLabel: def.label,
      valueLabel: opt.label,
    }

    const existingIdx = value.findIndex((f) => f.key === key)
    const updated = [...value]
    if (existingIdx >= 0) {
      updated[existingIdx] = newFilter
    } else {
      updated.push(newFilter)
    }
    onValueChange(updated)
  }

  const handleRemove = (key: string) => {
    onValueChange(value.filter((f) => f.key !== key))
  }

  return (
    <div
      data-slot="filter"
      className={cn("flex items-center gap-2 flex-wrap", className)}
    >
      <FilterMenu
        definitions={definitions}
        activeFilters={value}
        onFilterSelect={handleFilterSelect}
      />
      {value.map((filter) => (
        <FilterBadge
          key={filter.key}
          filter={filter}
          onRemove={() => handleRemove(filter.key)}
        />
      ))}
    </div>
  )
}
