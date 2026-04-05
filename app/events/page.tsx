'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Loader2,
  List,
  Linkedin,
  MapPin,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Star,
  ExternalLink,
  User,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EventsMapWrapper } from '@/components/events/EventsMapWrapper';
import { useEventsData } from '@/components/events/useEventsData';
import { GOOGLE_OFFICES_NA } from '@/lib/geo';
import { PARTNER_EVENTS } from '@/data/partner-events';
import type { ViewportInfo, EventCompanyMarker, EventsMapHandle } from '@/components/events/EventsMap';
import type { PartnerEvent } from '@/data/partner-events';

type SidebarTab = 'companies' | 'events';

function formatEventDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


export default function EventsPage() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      document.documentElement.classList.contains('dark'));

  const {
    campaigns,
    campaignsLoading,
    selectedSlug,
    selectedCampaign,
    selectCampaign,
    companyMarkers,
    companiesLoading,
    totalCompanies,
    loadedCompanies,
  } = useEventsData();

  const [visibleCompanies, setVisibleCompanies] = useState<EventCompanyMarker[]>([]);
  const [visibleEventIds, setVisibleEventIds] = useState<Set<string>>(new Set());
  const [listOpen, setListOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<SidebarTab>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showOffices, setShowOffices] = useState(false);
  const [showGoogleEvents, setShowGoogleEvents] = useState(true);
  const [showPartnerEvents, setShowPartnerEvents] = useState(true);
  const mapRef = useRef<EventsMapHandle | null>(null);

  const handleViewportChange = useCallback((info: ViewportInfo) => {
    setVisibleCompanies(info.companies);
    setVisibleEventIds(info.eventIds);
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return visibleCompanies;
    const q = search.toLowerCase();
    return visibleCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.contactName?.toLowerCase().includes(q),
    );
  }, [visibleCompanies, search]);

  const visibleEvents = useMemo(
    () =>
      PARTNER_EVENTS.filter(
        (e) => e.type !== 'webinar' && (e.partner ? showPartnerEvents : showGoogleEvents),
      ),
    [showGoogleEvents, showPartnerEvents],
  );

  const sortedEvents = useMemo(() => {
    const filtered = visibleEvents
      .filter((e) => visibleEventIds.size === 0 || visibleEventIds.has(e.id))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!selectedEventId) return filtered;
    const idx = filtered.findIndex((e) => e.id === selectedEventId);
    if (idx > 0) {
      const [selected] = filtered.splice(idx, 1);
      filtered.unshift(selected);
    }
    return filtered;
  }, [visibleEvents, visibleEventIds, selectedEventId]);


  const handleCompanyClick = useCallback((company: EventCompanyMarker) => {
    mapRef.current?.flyTo(company.position.lat, company.position.lng);
  }, []);

  const selectEvent = useCallback((id: string | null) => {
    setSelectedEventId(id);
    if (id) setTab('events');
  }, []);

  const handleEventClick = useCallback((event: PartnerEvent) => {
    setSelectedEventId((prev) => {
      const next = prev === event.id ? null : event.id;
      if (next) setTab('events');
      return next;
    });
    mapRef.current?.flyTo(event.position.lat, event.position.lng);
  }, []);

  if (status === 'loading' || !session || session.user?.role === 'partner') {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="max-w-[1600px] w-full mx-auto px-10 py-6 flex flex-col flex-1 min-w-0 min-h-0 gap-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Map campaign accounts to partner events and Google offices
            </p>
          </div>

          <div className="flex items-center gap-3">
            {campaignsLoading ? (
              <Skeleton className="h-9.5 w-[240px] rounded-lg" />
            ) : (
              <Select
                value={selectedSlug}
                onValueChange={(val) => selectCampaign(val as string)}
              >
                <SelectTrigger className="w-[280px]">
                  <SelectValue>
                    {selectedCampaign?.name ?? (
                      <span className="text-muted-foreground">Select a campaign…</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Legend / layer toggles */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-[var(--accent-yellow)]" />
            {companiesLoading ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="size-3 animate-spin" />
                {loadedCompanies}/{totalCompanies || '…'}
              </span>
            ) : (
              <span>{companyMarkers.length} companies</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowGoogleEvents((v) => !v)}
            className={`flex items-center gap-1.5 transition-opacity ${showGoogleEvents ? '' : 'opacity-30 hover:opacity-60'}`}
          >
            <span className="inline-block size-2 rounded-full bg-[#0072B2]" />
            <span>{PARTNER_EVENTS.filter((e) => !e.partner).length} Google events</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPartnerEvents((v) => !v)}
            className={`flex items-center gap-1.5 transition-opacity ${showPartnerEvents ? '' : 'opacity-30 hover:opacity-60'}`}
          >
            <span className="inline-block size-2 rounded-full bg-[#009E73]" />
            <span>{PARTNER_EVENTS.filter((e) => !!e.partner).length} partner events</span>
          </button>
          <button
            type="button"
            onClick={() => setShowOffices((v) => !v)}
            className={`flex items-center gap-1.5 transition-opacity ${showOffices ? '' : 'opacity-30 hover:opacity-60'}`}
          >
            <span className="inline-block size-2 rounded-full bg-[#56B4E9]" />
            <span>{GOOGLE_OFFICES_NA.length} offices</span>
          </button>
        </div>

        {/* Map + Sidebar */}
        <div className="flex-1 flex gap-0 rounded-xl border bg-card overflow-hidden min-h-[500px] max-h-[calc(100vh-280px)] relative isolate">
          {/* Map */}
          <div className="flex-1 relative min-w-0">
            {companiesLoading && companyMarkers.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin opacity-40" />
                <p className="text-sm">Loading companies…</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <EventsMapWrapper
                  companyMarkers={companyMarkers}
                  googleOffices={showOffices ? GOOGLE_OFFICES_NA : []}
                  partnerEvents={visibleEvents}
                  selectedEventId={selectedEventId}
                  onEventSelect={selectEvent}
                  isDark={isDark}
                  onViewportChange={handleViewportChange}
                  resizeKey={listOpen ? 1 : 0}
                  mapRef={mapRef}
                />
              </div>
            )}
          </div>

          {/* Sidebar — collapsible */}
          <div
            className={`shrink-0 flex flex-col border-l transition-[width] duration-300 ease-in-out overflow-hidden ${
              listOpen ? 'w-96' : 'w-0 border-l-0'
            }`}
          >
            <div className="w-96 flex flex-col max-h-full">
              {/* Tab bar */}
              <div className="flex items-stretch border-b bg-muted/30">
                <button
                  type="button"
                  onClick={() => setTab('events')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    tab === 'events'
                      ? 'border-foreground text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Star className="size-3.5" />
                  Events ({sortedEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('companies')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    tab === 'companies'
                      ? 'border-[var(--accent-yellow)] text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="size-3.5" />
                  Companies ({visibleCompanies.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListOpen(false)}
                  className="px-3 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <PanelRightClose className="size-4" />
                </button>
              </div>

              {/* Events tab */}
              {tab === 'events' && (
                <div className="flex-1 overflow-y-auto">
                  {sortedEvents.map((event) => {
                    const isSelected = event.id === selectedEventId;
                    const isPartner = !!event.partner;
                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={`w-full text-left px-4 py-2.5 border-b border-border/50 transition-colors ${
                          isSelected
                            ? isPartner
                              ? 'bg-emerald-50 dark:bg-emerald-950/20'
                              : 'bg-sky-50 dark:bg-sky-950/20'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="inline-block size-2 rounded-full shrink-0"
                              style={{ backgroundColor: isPartner ? '#009E73' : '#0072B2' }}
                            />
                            <span className="text-sm font-medium truncate">{event.name}</span>
                          </div>
                          {event.url && (
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <span>{formatEventDate(event.date)}</span>
                          <span>·</span>
                          <span className="truncate">{event.city}{event.state ? `, ${event.state}` : ''}</span>
                          <span>·</span>
                          <span className={`shrink-0 ${
                            event.type === 'in-person'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : event.type === 'webinar'
                                ? 'text-violet-600 dark:text-violet-400'
                                : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {event.type === 'in-person' ? 'In-person' : event.type === 'webinar' ? 'Virtual' : 'Hybrid'}
                          </span>
                        </div>
                        {isPartner && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Partner: <span className="text-foreground/70">{event.partner}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Companies tab */}
              {tab === 'companies' && (
                <>
                  {/* Header + Search */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {filteredCompanies.length !== visibleCompanies.length
                        ? `${filteredCompanies.length} of ${visibleCompanies.length}`
                        : `${visibleCompanies.length} in view`}
                    </span>
                    {visibleCompanies.length < companyMarkers.length && (
                      <span>of {companyMarkers.length}</span>
                    )}
                    <MapPin className="size-3 opacity-40 ml-auto" />
                    <span>Pan &amp; zoom to filter</span>
                  </div>
                  <div className="px-3 py-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search companies…"
                        className="w-full h-8 pl-8 pr-3 rounded-md border bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredCompanies.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                        {search ? 'No companies match your search' : 'Pan or zoom the map to see companies'}
                      </div>
                    ) : (
                      filteredCompanies.map((company) => (
                          <button
                            type="button"
                            key={company.domain}
                            onClick={() => handleCompanyClick(company)}
                            className="w-full text-left px-4 py-2.5 border-b border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-sm font-medium truncate">{company.name}</span>
                                <a
                                  href={`https://${company.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <ExternalLink className="size-3" />
                                </a>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {company.contactLinkedIn && (
                                  <a
                                    href={company.contactLinkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-muted-foreground hover:text-blue-500 transition-colors"
                                  >
                                    <Linkedin className="size-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                            {company.contactName && (
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-sky-600 dark:text-sky-400 truncate">
                                <User className="size-3 shrink-0" />
                                <span className="shrink-0">{company.contactName}</span>
                                {company.contactTitle && (
                                  <span className="truncate max-w-[140px] text-muted-foreground">· {company.contactTitle}</span>
                                )}
                              </div>
                            )}
                          </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Expand button (visible when sidebar is collapsed) */}
          {!listOpen && (
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="absolute top-3 right-3 z-[700] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border shadow-sm text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelRightOpen className="size-4" />
              <span>{visibleCompanies.length} companies</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
