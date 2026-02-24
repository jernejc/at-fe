"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
    React.ComponentRef<typeof TooltipPrimitive.Popup>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> & {
        side?: 'top' | 'bottom' | 'left' | 'right'
        sideOffset?: number
    }
>(({ className, side = 'top', sideOffset = 4, children, ...props }, ref) => (
    <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
            <TooltipPrimitive.Popup
                ref={ref}
                className={cn(
                    "z-50 overflow-hidden rounded-md bg-gray-700 px-3 py-1.5 text-xs text-gray-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                    className
                )}
                {...props}
            >
                {children}
            </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
