import * as React from "react"

import { cn } from "@/lib/utils"

interface DashboardCellBodyProps extends React.ComponentProps<"p"> {
  /** Show a skeleton pulse instead of children. */
  loading?: boolean
}

/** Cell body — 40px display font (Exo 2) for large stat values. */
function DashboardCellBody({
  className,
  children,
  loading,
  ...props
}: DashboardCellBodyProps) {
  if (loading) {
    return (
      <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
    )
  }

  return (
    <p
      className={cn(
        "text-[40px] font-display font-semibold text-foreground leading-tight",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}

export { DashboardCellBody }
export type { DashboardCellBodyProps }
