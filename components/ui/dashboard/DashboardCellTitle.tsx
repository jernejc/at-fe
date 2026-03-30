import * as React from "react"
import { Info } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface DashboardCellTitleProps extends React.ComponentProps<"p"> {
  /** Optional tooltip text shown via an info icon next to the title. */
  tooltip?: string
}

/** Cell title — 16px medium weight. */
function DashboardCellTitle({
  className,
  tooltip,
  children,
  ...props
}: DashboardCellTitleProps) {
  return (
    <p
      className={cn("text-base font-medium text-foreground", tooltip && "inline-flex items-center gap-1", className)}
      {...props}
    >
      {children}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
            <Info className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-52 font-normal">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      )}
    </p>
  )
}

export { DashboardCellTitle }
