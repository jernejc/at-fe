'use client';

import * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableCardContextValue {
  expanded: boolean;
  hasDetails: boolean;
  toggle: () => void;
  collapse: () => void;
  registerDetails: () => void;
}

const ExpandableCardContext = createContext<ExpandableCardContextValue | null>(null);

/** Hook to access the ExpandableCard context from sub-components. */
function useExpandableCard(): ExpandableCardContextValue {
  const ctx = useContext(ExpandableCardContext);
  if (!ctx) throw new Error('ExpandableCard sub-components must be used within <ExpandableCard>');
  return ctx;
}

interface ExpandableCardProps extends React.ComponentProps<'div'> {
  /** Start expanded. @default false */
  defaultExpanded?: boolean;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Callback when expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void;
}

/** Expandable card container with optional collapsible details section. */
function ExpandableCard({
  className,
  defaultExpanded = false,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  ...props
}: ExpandableCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [hasDetails, setHasDetails] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const setExpanded = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalExpanded(value);
      onExpandedChange?.(value);
    },
    [isControlled, onExpandedChange],
  );

  const toggle = useCallback(() => setExpanded(!expanded), [expanded, setExpanded]);
  const collapse = useCallback(() => setExpanded(false), [setExpanded]);
  const registerDetails = useCallback(() => setHasDetails(true), []);

  const isCollapsible = hasDetails;
  const showHover = isCollapsible && !expanded;

  return (
    <ExpandableCardContext.Provider value={{ expanded, hasDetails, toggle, collapse, registerDetails }}>
      <div
        data-slot="expandable-card"
        data-expanded={expanded || undefined}
        role={showHover ? 'button' : undefined}
        tabIndex={showHover ? 0 : undefined}
        aria-expanded={isCollapsible ? expanded : undefined}
        onKeyDown={
          showHover
            ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle();
              }
            }
            : undefined
        }
        className={cn(
          'bg-card text-card-foreground rounded-xl ring-1 ring-foreground/10 overflow-hidden flex flex-col text-sm',
          showHover && 'cursor-pointer hover:ring-foreground/50 transition-shadow',
          className,
        )}
        onClick={showHover ? toggle : undefined}
        {...props}
      >
        {children}
        {isCollapsible && <ExpandableCardFooter />}
      </div>
    </ExpandableCardContext.Provider>
  );
}

/** Always-visible header content for an ExpandableCard. */
function ExpandableCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="expandable-card-header" className={cn('px-6 pt-5 last:pb-5', className)} {...props} />;
}

/** Collapsible content section that expands/collapses with animation. */
function ExpandableCardDetails({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { expanded, registerDetails } = useExpandableCard();

  React.useEffect(() => {
    registerDetails();
  }, [registerDetails]);

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          key="expandable-card-details"
          data-slot="expandable-card-details"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="overflow-hidden"
        >
          <div className={cn('px-6', className)} {...props}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Auto-rendered footer with expand/collapse toggle. */
function ExpandableCardFooter() {
  const { expanded, toggle, collapse } = useExpandableCard();

  return (
    <button
      data-slot="expandable-card-footer"
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (expanded) collapse();
        else toggle();
      }}
      className={cn(
        'mt-5 flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-2.5',
        'text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors',
      )}
    >
      {expanded ? (
        <>
          <span>Collapse</span>
          <ChevronDown className="h-3.5 w-3.5 rotate-180 transition-transform" />
        </>
      ) : (
        <ChevronDown className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export { ExpandableCard, ExpandableCardHeader, ExpandableCardDetails, useExpandableCard };
