"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SearchFieldProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  /** Called when the clear button is clicked. If omitted, fires onChange with an empty value. */
  onClear?: () => void
}

/**
 * Compact search input with a leading search icon and a conditional clear button.
 * Height is h-7 with rounded-lg border, designed for use in toolbars and filter bars.
 */
const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, value, onClear, onChange, ...props }, ref) => {
    const hasValue = value != null && String(value).length > 0

    function handleClear() {
      if (onClear) {
        onClear()
        return
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: "" },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <div data-slot="search-field" className={cn("relative", className)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2" />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          className="h-9.5 pl-9 pr-8 text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden rounded-full"
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    )
  },
)
SearchField.displayName = "SearchField"

export { SearchField }
export type { SearchFieldProps }
