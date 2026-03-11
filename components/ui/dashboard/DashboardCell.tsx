import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cellVariants = cva("p-4 shadow-[1px_1px_0_0_var(--border)]", {
  variants: {
    size: {
      quarter: "col-span-4 md:col-span-2 lg:col-span-1",
      half: "col-span-4 lg:col-span-2",
      full: "col-span-4",
    },
    height: {
      auto: "",
      default: "h-55",
    },
    rowSpan: {
      1: "",
      2: "row-span-2",
    },
  },
  defaultVariants: {
    size: "quarter",
    height: "default",
    rowSpan: 1,
  },
})

const innerVariants = cva("rounded-xl p-4 flex flex-col justify-between h-full", {
  variants: {
    gradient: {
      none: "",
      orange:
        "bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60",
      green:
        "bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-950/60 dark:to-emerald-950/60",
      red: "bg-gradient-to-b from-red-50 to-rose-50 dark:from-red-950/60 dark:to-rose-950/60",
    },
  },
  defaultVariants: {
    gradient: "none",
  },
})

type DashboardCellProps = React.ComponentProps<"div"> &
  VariantProps<typeof cellVariants> &
  VariantProps<typeof innerVariants>

/**
 * Individual dashboard cell with size, height, and gradient variants.
 * Outer div handles grid placement + shadow divider lines.
 * Inner div handles gradient background, padding, and flex layout.
 */
function DashboardCell({
  size,
  height,
  rowSpan,
  gradient,
  className,
  children,
  ...props
}: DashboardCellProps) {
  return (
    <div className={cn(cellVariants({ size, height, rowSpan }), className)} {...props}>
      <div className={cn(innerVariants({ gradient }))}>
        {children}
      </div>
    </div>
  )
}

export { DashboardCell, cellVariants, innerVariants }
export type { DashboardCellProps }
