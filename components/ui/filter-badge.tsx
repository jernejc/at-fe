"use client"

import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { FILTER_OPERATOR_LABELS } from "@/lib/schemas/filter"
import type { ActiveFilter } from "@/lib/schemas/filter"

const divider = <span className="w-px self-stretch bg-border" aria-hidden />

interface FilterBadgeProps {
  filter: ActiveFilter
  onRemove: () => void
  className?: string
}

/** Renders an active filter as a segmented pill: field | operator | value | X */
export function FilterBadge({ filter, onRemove, className }: FilterBadgeProps) {
  const operatorLabel = FILTER_OPERATOR_LABELS[filter.operator]

  return (
    <span
      data-slot="filter-badge"
      className={cn(
        "inline-flex h-7 items-center rounded-lg border border-border bg-background text-sm",
        className,
      )}
    >
      <span className="px-2.5 text-foreground">{filter.fieldLabel}</span>
      {divider}
      <span className="px-2 text-muted-foreground">{operatorLabel}</span>
      {divider}
      <span className="px-2.5 text-foreground">{filter.valueLabel}</span>
      {divider}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-full items-center px-1.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${filter.fieldLabel} filter`}
      >
        <X className="size-3.5" />
      </button>
    </span>
  )
}
