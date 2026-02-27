"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "striped"
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, variant = "default", indicatorClassName, ...props }, ref) => {
    const percentage = value != null ? Math.min(Math.max((value / max) * 100, 0), 100) : 0

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            variant === "default" && "bg-foreground",
            indicatorClassName
          )}
          style={{
            width: `${percentage}%`,
            ...(variant === "striped" ? {
              backgroundImage: `repeating-linear-gradient(
                                -45deg,
                                var(--foreground),
                                var(--foreground) 1px,
                                transparent 1px,
                                transparent 4px
                            )`,
            } : {}),
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
