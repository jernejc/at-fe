"use client"

import { Menu } from "@base-ui/react/menu"
import { ArrowDownUp, ArrowUp, ArrowDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import type { SortOptionDefinition, SortState } from "@/lib/schemas/filter"

const popupStyles =
  "bg-popover text-popover-foreground ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100"

const itemStyles =
  "flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"

const divider = <span className="w-px self-stretch bg-border" aria-hidden />

interface SortProps {
  /** Available sort options */
  options: SortOptionDefinition[]
  /** Current sort state, or null if no sort is active (controlled) */
  value: SortState | null
  /** Callback when sort changes */
  onValueChange: (sort: SortState | null) => void
  className?: string
}

/**
 * Reusable sort component with dropdown menu and active sort badge.
 * Selecting an option shows a badge. The badge arrow toggles direction; X removes the sort.
 */
export function Sort({
  options,
  value,
  onValueChange,
  className,
}: SortProps) {
  const handleSelect = (field: string) => {
    onValueChange({ field, direction: "desc" })
  }

  const toggleDirection = () => {
    if (!value) return
    onValueChange({
      field: value.field,
      direction: value.direction === "asc" ? "desc" : "asc",
    })
  }

  const activeLabel = value
    ? options.find((o) => o.value === value.field)?.label
    : null

  return (
    <div data-slot="sort" className={cn("flex items-center gap-2", className)}>
      <Menu.Root modal={false}>
        <Menu.Trigger
          data-slot="sort-trigger"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ArrowDownUp className="size-4" data-icon="inline-start" />
          Sort
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="start" sideOffset={4} className="isolate z-50">
            <Menu.Popup data-slot="sort-menu" className={popupStyles}>
              {options.map((option) => (
                <Menu.Item
                  key={option.value}
                  data-slot="sort-item"
                  className={itemStyles}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.icon}
                  {option.label}
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {value && activeLabel && (
        <span
          data-slot="sort-badge"
          className="inline-flex h-7 items-center rounded-lg border border-border bg-background text-sm"
        >
          <span className="px-2.5 text-muted-foreground">by</span>
          {divider}
          <span className="px-2.5 text-foreground">{activeLabel}</span>
          {divider}
          <button
            type="button"
            onClick={toggleDirection}
            className="flex h-full items-center px-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Sort ${value.direction === "asc" ? "descending" : "ascending"}`}
          >
            {value.direction === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : (
              <ArrowDown className="size-3.5" />
            )}
          </button>
          {divider}
          <button
            type="button"
            onClick={() => onValueChange(null)}
            className="flex h-full items-center px-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remove sort"
          >
            <X className="size-3.5" />
          </button>
        </span>
      )}
    </div>
  )
}
