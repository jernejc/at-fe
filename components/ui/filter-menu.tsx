"use client"

import { Menu } from "@base-ui/react/menu"
import { ListFilterPlus, ChevronRight, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import type {
  FilterDefinition,
  FilterOperator,
  ActiveFilter,
} from "@/lib/schemas/filter"

const popupStyles =
  "bg-popover text-popover-foreground ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1 p-1 origin-(--transform-origin) data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100"

const itemStyles =
  "flex items-center gap-2 rounded-md py-1.5 px-2 text-sm cursor-default outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"

interface FilterMenuProps {
  /** Available filter definitions */
  definitions: FilterDefinition[]
  /** Currently active filters (to show checkmarks) */
  activeFilters: ActiveFilter[]
  /** Callback when a filter value is selected */
  onFilterSelect: (key: string, operator: FilterOperator, value: string) => void
  className?: string
}

/** Dropdown menu with submenus for selecting filter values */
export function FilterMenu({
  definitions,
  activeFilters,
  onFilterSelect,
  className,
}: FilterMenuProps) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        data-slot="filter-trigger"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1.5",
          className,
        )}
      >
        <ListFilterPlus className="size-4" data-icon="inline-start" />
        Filter
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="start" sideOffset={4} className="isolate z-50">
          <Menu.Popup data-slot="filter-menu" className={popupStyles}>
            {definitions.map((def) => (
              <FilterSubmenu
                key={def.key}
                definition={def}
                activeFilter={activeFilters.find((f) => f.key === def.key)}
                onSelect={(operator, value) =>
                  onFilterSelect(def.key, operator, value)
                }
              />
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

interface FilterSubmenuProps {
  definition: FilterDefinition
  activeFilter?: ActiveFilter
  onSelect: (operator: FilterOperator, value: string) => void
}

function FilterSubmenu({ definition, activeFilter, onSelect }: FilterSubmenuProps) {
  const defaultOperator: FilterOperator =
    definition.operators?.[0] ?? "is"

  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger
        openOnHover
        className={cn(itemStyles, "justify-between pr-1.5")}
      >
        <span className="flex items-center gap-2">
          {definition.icon}
          {definition.label}
        </span>
        <ChevronRight className="size-3.5 text-muted-foreground" />
      </Menu.SubmenuTrigger>
      <Menu.Portal>
        <Menu.Positioner side="right" align="start" sideOffset={2} className="isolate z-50">
          <Menu.Popup className={popupStyles}>
            {definition.options.map((option) => {
              const isActive = activeFilter?.value === option.value
              return (
                <Menu.Item
                  key={option.value}
                  className={cn(itemStyles, "justify-between pr-1.5")}
                  onClick={() => onSelect(defaultOperator, option.value)}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {isActive && (
                    <Check className="size-3.5 text-muted-foreground" />
                  )}
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  )
}
