import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const bodyVariants = cva("mt-2 font-display font-semibold text-foreground leading-tight", {
  variants: {
    size: {
      default: "text-[40px]",
      sm: "text-2xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface DashboardCellBodyProps
  extends React.ComponentProps<"div">,
  VariantProps<typeof bodyVariants> {
  /** Show a skeleton pulse instead of children. */
  loading?: boolean
}

/** Cell body — display font (Exo 2) for stat values. */
function DashboardCellBody({
  size,
  className,
  children,
  loading,
  ...props
}: DashboardCellBodyProps) {
  if (loading) {
    return (
      <div className="mt-2 h-8 w-24 rounded-md bg-muted animate-pulse" />
    )
  }

  return (
    <div
      className={cn(bodyVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { DashboardCellBody, bodyVariants }
export type { DashboardCellBodyProps }
