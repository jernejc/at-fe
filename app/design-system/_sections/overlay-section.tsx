'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/** Overlay components: dialog, sheet, tooltip. */
export function OverlaySection() {
  return (
    <section id="overlays" className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Overlays</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Dialog, sheet, and tooltip — interactive demos.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Dialog */}
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>
            Open Dialog
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
              <DialogDescription>
                This is a dialog description. It provides context about the
                action or content.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Dialog body content goes here.
            </p>
            <DialogFooter showCloseButton>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sheet */}
        <Sheet>
          <SheetTrigger render={<Button variant="outline" />}>
            Open Sheet
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet Title</SheetTitle>
              <SheetDescription>
                A side panel for detailed content.
              </SheetDescription>
            </SheetHeader>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Sheet body content. Slides in from the right by default.
              </p>
            </div>
          </SheetContent>
        </Sheet>

        {/* Tooltips */}
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover (top)
          </TooltipTrigger>
          <TooltipContent side="top">Tooltip on top</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover (bottom)
          </TooltipTrigger>
          <TooltipContent side="bottom">Tooltip on bottom</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover (left)
          </TooltipTrigger>
          <TooltipContent side="left">Tooltip on left</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover (right)
          </TooltipTrigger>
          <TooltipContent side="right">Tooltip on right</TooltipContent>
        </Tooltip>
      </div>
    </section>
  );
}
