'use client';

import { useState, useMemo, useSyncExternalStore, useCallback } from 'react';
import {
  Download, List, PanelRightClose, PanelRightOpen,
  Search, Star, CalendarRange,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { EventListItem, formatEventDate } from './EventListItem';
import { CompanyListItem } from './CompanyListItem';
import type { EventCompanyMarker } from './EventsMap';
import type { SidebarTab, AnyEvent } from './events.types';

interface EventsSidebarProps {
  tab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  events: AnyEvent[];
  selectedEventId: string | null;
  onEventClick: (event: AnyEvent) => void;
  visibleCompanies: EventCompanyMarker[];
  filteredCompanies: EventCompanyMarker[];
  totalCompanies: number;
  companySearch: string;
  onCompanySearchChange: (search: string) => void;
  onExport: () => void;
}

function useIsMobile(breakpoint = 1024): boolean {
  const query = `(max-width: ${breakpoint - 1}px)`;
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function groupByDate(events: AnyEvent[]): [string, AnyEvent[]][] {
  const map = new Map<string, AnyEvent[]>();
  for (const ev of events) {
    const arr = map.get(ev.date) ?? [];
    arr.push(ev);
    map.set(ev.date, arr);
  }
  return Array.from(map);
}

/** Responsive sidebar: inline panel on desktop, bottom sheet on mobile. */
export function EventsSidebar(props: EventsSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        {!props.isOpen && (
          <ExpandButton onClick={() => props.onOpenChange(true)} count={props.visibleCompanies.length} />
        )}
        <Sheet open={props.isOpen} onOpenChange={props.onOpenChange}>
          <SheetContent side="bottom" showCloseButton={false} className="h-[70vh] gap-0 rounded-t-xl">
            <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-muted-foreground/20 shrink-0" />
            <SheetTitle className="sr-only">Events sidebar</SheetTitle>
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <div
        className={`shrink-0 flex flex-col border-l transition-[width] duration-300 ease-in-out overflow-hidden ${
          props.isOpen ? 'w-96' : 'w-0 border-l-0'
        }`}
      >
        <div className="w-96 flex flex-col max-h-full">
          <SidebarContent {...props} />
        </div>
      </div>
      {!props.isOpen && (
        <ExpandButton onClick={() => props.onOpenChange(true)} count={props.visibleCompanies.length} />
      )}
    </>
  );
}

function ExpandButton({ onClick, count }: { onClick: () => void; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-3 right-3 z-[700] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border shadow-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Expand sidebar"
    >
      <PanelRightOpen className="size-4" />
      <span>{count} companies</span>
    </button>
  );
}

function SidebarContent({
  tab, onTabChange, onOpenChange, events, selectedEventId, onEventClick,
  visibleCompanies, filteredCompanies, totalCompanies,
  companySearch, onCompanySearchChange, onExport,
}: EventsSidebarProps) {
  const [eventSearch, setEventSearch] = useState('');

  const filteredEvents = useMemo(() => {
    if (!eventSearch.trim()) return events;
    const q = eventSearch.toLowerCase();
    return events.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      (e._kind === 'competitor' && e.brand.toLowerCase().includes(q)) ||
      (e._kind === 'partner' && e.partner?.toLowerCase().includes(q)),
    );
  }, [events, eventSearch]);

  const dateGroups = useMemo(() => groupByDate(filteredEvents), [filteredEvents]);

  return (
    <>
      {/* Tab bar */}
      <div className="flex items-stretch border-b bg-muted/30 shrink-0">
        <button
          type="button"
          onClick={() => onTabChange('events')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            tab === 'events'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className="size-3.5" />
          Events
          <motion.span key={events.length} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="tabular-nums">
            ({events.length})
          </motion.span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange('companies')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
            tab === 'companies'
              ? 'border-[var(--accent-yellow)] text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <List className="size-3.5" />
          Companies
          <motion.span key={visibleCompanies.length} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="tabular-nums">
            ({visibleCompanies.length})
          </motion.span>
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelRightClose className="size-4" />
        </button>
      </div>

      {/* Events tab */}
      {tab === 'events' && (
        <>
          <SearchInput value={eventSearch} onChange={setEventSearch} placeholder="Search events…" />
          <div className="flex-1 overflow-y-auto">
            {filteredEvents.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <CalendarRange className="size-8 opacity-20" />
                <p>{eventSearch ? 'No events match your search.' : 'No events in the current view. Try zooming out or enabling more layers.'}</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {dateGroups.map(([date, group]) => (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="sticky top-0 z-10 px-4 py-1.5 text-[11px] font-medium text-muted-foreground bg-muted/80 backdrop-blur-sm border-b border-border/30">
                      {formatEventDate(date)}
                    </div>
                    {group.map((event) => (
                      <EventListItem
                        key={event.id}
                        event={event}
                        isSelected={event.id === selectedEventId}
                        onClick={() => onEventClick(event)}
                      />
                    ))}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </>
      )}

      {/* Companies tab */}
      {tab === 'companies' && (
        <>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b text-xs text-muted-foreground shrink-0">
            <span className="font-medium text-foreground">
              {filteredCompanies.length !== visibleCompanies.length
                ? `${filteredCompanies.length} of ${visibleCompanies.length}`
                : `${visibleCompanies.length} in view`}
            </span>
            {visibleCompanies.length < totalCompanies && <span>of {totalCompanies}</span>}
            <div className="ml-auto">
              <button
                type="button"
                onClick={onExport}
                disabled={filteredCompanies.length === 0}
                className="flex items-center gap-1 px-2 py-1 rounded-md border bg-background hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:pointer-events-none"
                title="Export filtered companies as CSV"
              >
                <Download className="size-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
          <SearchInput value={companySearch} onChange={onCompanySearchChange} placeholder="Search companies…" />
          <div className="flex-1 overflow-y-auto">
            {filteredCompanies.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                {companySearch ? 'No companies match your search' : 'Pan or zoom the map to see companies'}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <CompanyListItem key={company.domain} company={company} />
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="px-3 py-2 border-b shrink-0">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-8 pl-8 pr-3 rounded-md border bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
