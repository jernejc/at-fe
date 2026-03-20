"use client";

import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

interface ChangelogVersion {
  version: string;
  date: string;
  changes: string[];
}

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: ChangelogVersion[];
  newVersions: Set<string>;
}

/** Single version entry in the changelog list. */
function VersionEntry({ entry, isNew }: { entry: ChangelogVersion; isNew: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg p-3 transition-colors",
        isNew ? "bg-primary/5 ring-1 ring-primary/20" : "bg-muted",
      )}
    >
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">v{entry.version}</h3>
        {isNew && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
            New
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {format(new Date(entry.date + "T00:00:00"), "MMM d, yyyy")}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {entry.changes.map((change, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-muted-foreground/50 select-none">–</span>
            <span>{change}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Modal dialog displaying the app changelog with highlighted new entries. */
export function ChangelogDialog({ open, onOpenChange, versions, newVersions }: ChangelogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] pb-0 gap-0 flex flex-col">
        <DialogHeader>
          <DialogTitle>What&apos;s New</DialogTitle>
          <DialogDescription>Release notes and recent changes</DialogDescription>
        </DialogHeader>
        <Separator className="mt-6" />
        <div className="overflow-y-auto -mx-6 p-6 space-y-3 flex-1 min-h-0">
          {versions.map((entry) => (
            <VersionEntry key={entry.version} entry={entry} isNew={newVersions.has(entry.version)} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
