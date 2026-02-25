import * as React from "react"

import { cn } from "@/lib/utils"

/** Cell body — 40px display font (Exo 2) for large stat values. */
function DashboardCellBody({
  className,
  children,
  ...props
}: React.ComponentProps<"p">) {
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
