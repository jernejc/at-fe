import * as React from "react"

import { cn } from "@/lib/utils"

/** Cell title — 16px medium weight. */
function DashboardCellTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-base font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export { DashboardCellTitle }
