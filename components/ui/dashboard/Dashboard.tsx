import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Outer dashboard wrapper — white card with border, rounded corners, and a 4-column grid.
 * Cells inside use box-shadow for grid lines; overflow-hidden clips the outer edges.
 */
function Dashboard({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl overflow-hidden grid grid-cols-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Dashboard }
