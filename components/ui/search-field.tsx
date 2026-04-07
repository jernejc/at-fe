"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface SearchFieldProps
  extends Omit<React.ComponentProps<"input">, "type" | "size"> {
  /** Called when the clear button is clicked. If omitted, fires onChange with an empty value. */
  onClear?: () => void
  /** Visual size. Defaults to "default" (h-9.5). "sm" matches Button sm (h-8, text-[0.8rem]). */
  size?: "default" | "sm"
}

/**
 * Compact search input with a leading search icon and a conditional clear button.
 * Height is h-7 with rounded-lg border, designed for use in toolbars and filter bars.
 */
const SearchField = React.forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ className, value, onClear, onChange, size = "default", ...props }, ref) => {
    const hasValue = value != null && String(value).length > 0
    const isSm = size === "sm"
    const iconClass = isSm
      ? "pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      : "pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2"
    const inputClass = isSm
      ? "h-8 pl-8 pr-7 text-[0.8rem] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden rounded-full"
      : "h-9.5 pl-9 pr-8 text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden rounded-full"
    const clearClass = isSm
      ? "absolute right-2.5 top-1/2 flex size-3.5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      : "absolute right-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
    const clearIconClass = isSm ? "size-3.5" : "size-4"

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
        <Search className={iconClass} />
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={onChange}
          className={inputClass}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className={clearClass}
            aria-label="Clear search"
          >
            <X className={clearIconClass} />
          </button>
        )}
      </div>
    )
  },
)
SearchField.displayName = "SearchField"

export { SearchField }
export type { SearchFieldProps }
