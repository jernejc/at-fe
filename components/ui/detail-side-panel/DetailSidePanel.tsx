'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DetailSidePanelProps {
  /** Whether the panel is open. */
  open: boolean;
  /** Called when the panel should close. */
  onClose: () => void;
  /** Content to render in the detail panel. */
  detail: React.ReactNode;
  /** Main content that gets constrained to the left half when open. */
  children: React.ReactNode;
}

/** Reusable split-panel wrapper. Desktop: fixed right panel. Mobile: bottom sheet. */
export function DetailSidePanel({ open, onClose, detail, children }: DetailSidePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Click outside to close (capture phase so row clicks can override via batching)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', handler, { capture: true });
    return () => document.removeEventListener('mousedown', handler, { capture: true });
  }, [open, onClose]);

  return (
    <>
      {/* Children wrapper */}
      <div>{children}</div>

      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 md:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel — slides from right on desktop, from bottom on mobile */}
      <div
        ref={panelRef}
        className={cn(
          'fixed bg-background overflow-y-auto transition-transform duration-300 ease-out',
          // Desktop
          'md:right-0 md:top-24 md:bottom-0 md:w-[50vw] md:border-l-[0.5px] md:border-border-d md:z-15',
          // Mobile
          'max-md:inset-x-0 max-md:bottom-0 max-md:z-50 max-md:rounded-t-2xl max-md:max-h-[85vh]',
          // Open/close transforms
          open
            ? 'translate-x-0 translate-y-0'
            : 'md:translate-x-full max-md:translate-y-full',
          !open && 'pointer-events-none',
        )}
      >
        <div className="sticky top-0 z-10 flex justify-end p-2 max-md:rounded-t-2xl">
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div className="px-6 pb-6">{detail}</div>
      </div>
    </>
  );
}
