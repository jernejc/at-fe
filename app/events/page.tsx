'use client';

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { EventsMapWrapper } from '@/components/events/EventsMapWrapper';
import { useEventsData } from '@/components/events/useEventsData';
import { EventsLegend } from '@/components/events/EventsLegend';
import { EventsSidebar } from '@/components/events/EventsSidebar';
import { GOOGLE_OFFICES_NA } from '@/lib/geo';
import { PARTNER_EVENTS } from '@/data/partner-events';
import { COMPETITOR_EVENTS } from '@/data/competitor-events';
import type { ViewportInfo, EventCompanyMarker, EventsMapHandle } from '@/components/events/EventsMap';
import type { SidebarTab, AnyEvent } from '@/components/events/events.types';

const SESSION_KEY = 'events-map-state';

interface PersistedMapState {
  center: [number, number];
  zoom: number;
  tab: SidebarTab;
  selectedEventId: string | null;
  showOffices: boolean;
  showGoogleEvents: boolean;
  showPartnerEvents: boolean;
  showCompetitorEvents: boolean;
  listOpen: boolean;
}

function loadPersistedState(): PersistedMapState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PersistedMapState) : null;
  } catch { return null; }
}

export default function EventsPage() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && document.documentElement.classList.contains('dark'));

  const { companyMarkers, companiesLoading, totalCompanies, loadedCompanies } = useEventsData();

  const [persisted] = useState(() => loadPersistedState());
  const [visibleCompanies, setVisibleCompanies] = useState<EventCompanyMarker[]>([]);
  const [visibleEventIds, setVisibleEventIds] = useState<Set<string>>(new Set());
  const [listOpen, setListOpen] = useState(persisted?.listOpen ?? true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<SidebarTab>(persisted?.tab ?? 'events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(persisted?.selectedEventId ?? null);
  const [showOffices, setShowOffices] = useState(persisted?.showOffices ?? false);
  const [showGoogleEvents, setShowGoogleEvents] = useState(persisted?.showGoogleEvents ?? true);
  const [showPartnerEvents, setShowPartnerEvents] = useState(persisted?.showPartnerEvents ?? true);
  const [showCompetitorEvents, setShowCompetitorEvents] = useState(persisted?.showCompetitorEvents ?? true);
  const mapRef = useRef<EventsMapHandle | null>(null);

  useEffect(() => {
    const save = () => {
      const center = mapRef.current?.getCenter();
      const zoom = mapRef.current?.getZoom();
      if (!center || zoom == null) return;
      const state: PersistedMapState = {
        center: [center.lat, center.lng], zoom, tab, selectedEventId,
        showOffices, showGoogleEvents, showPartnerEvents, showCompetitorEvents, listOpen,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    };
    save();
    return save;
  }, [tab, selectedEventId, showOffices, showGoogleEvents, showPartnerEvents, showCompetitorEvents, listOpen]);

  const handleViewportChange = useCallback((info: ViewportInfo) => {
    setVisibleCompanies(info.companies);
    setVisibleEventIds(info.eventIds);
    const center = mapRef.current?.getCenter();
    const zoom = mapRef.current?.getZoom();
    if (center && zoom != null) {
      try {
        const prev = sessionStorage.getItem(SESSION_KEY);
        const existing = prev ? JSON.parse(prev) : {};
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...existing, center: [center.lat, center.lng], zoom }));
      } catch { /* ignore */ }
    }
  }, []);

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return visibleCompanies;
    const q = search.toLowerCase();
    return visibleCompanies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q) || c.contactName?.toLowerCase().includes(q),
    );
  }, [visibleCompanies, search]);

  const visibleEvents = useMemo(
    () => PARTNER_EVENTS.filter((e) => e.type !== 'webinar' && (e.partner ? showPartnerEvents : showGoogleEvents)),
    [showGoogleEvents, showPartnerEvents],
  );

  const visibleCompetitorEvents = useMemo(
    () => (showCompetitorEvents ? COMPETITOR_EVENTS.filter((e) => e.type !== 'virtual') : []),
    [showCompetitorEvents],
  );

  const sortedEvents: AnyEvent[] = useMemo(() => {
    const tagged: AnyEvent[] = [
      ...visibleEvents
        .filter((e) => visibleEventIds.size === 0 || visibleEventIds.has(e.id))
        .map((e) => ({ ...e, _kind: 'partner' as const })),
      ...visibleCompetitorEvents
        .filter((e) => visibleEventIds.size === 0 || visibleEventIds.has(e.id))
        .map((e) => ({ ...e, _kind: 'competitor' as const })),
    ];
    tagged.sort((a, b) => a.date.localeCompare(b.date));
    return tagged;
  }, [visibleEvents, visibleCompetitorEvents, visibleEventIds]);

  // Per-layer in-view counts for the legend
  const googleAll = PARTNER_EVENTS.filter((e) => !e.partner && e.type !== 'webinar');
  const partnerAll = PARTNER_EVENTS.filter((e) => !!e.partner && e.type !== 'webinar');
  const competitorAll = COMPETITOR_EVENTS.filter((e) => e.type !== 'virtual');

  const inViewCount = (ids: string[]) =>
    visibleEventIds.size === 0 ? undefined : ids.filter((id) => visibleEventIds.has(id)).length;

  const legendLayers = useMemo(() => [
    { id: 'google', color: '#0072B2', label: 'Google events', count: googleAll.length, inView: showGoogleEvents ? inViewCount(googleAll.map((e) => e.id)) : undefined, active: showGoogleEvents, onToggle: () => setShowGoogleEvents((v) => !v) },
    { id: 'partner', color: '#009E73', label: 'partner events', count: partnerAll.length, inView: showPartnerEvents ? inViewCount(partnerAll.map((e) => e.id)) : undefined, active: showPartnerEvents, onToggle: () => setShowPartnerEvents((v) => !v) },
    { id: 'competitor', color: '#DC2626', label: 'competitor events', count: competitorAll.length, inView: showCompetitorEvents ? inViewCount(competitorAll.map((e) => e.id)) : undefined, active: showCompetitorEvents, onToggle: () => setShowCompetitorEvents((v) => !v) },
    { id: 'offices', color: '#56B4E9', label: 'offices', count: GOOGLE_OFFICES_NA.length, active: showOffices, onToggle: () => setShowOffices((v) => !v) },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [showGoogleEvents, showPartnerEvents, showCompetitorEvents, showOffices, visibleEventIds]);

  const handleExportCompanies = useCallback(() => {
    if (filteredCompanies.length === 0) return;
    const headers = ['Name', 'Domain', 'Contact Name', 'Contact Title', 'Contact LinkedIn', 'Lat', 'Lng'];
    const rows = filteredCompanies.map((c) => [
      c.name, c.domain, c.contactName ?? '', c.contactTitle ?? '', c.contactLinkedIn ?? '',
      String(c.position.lat), String(c.position.lng),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-companies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredCompanies]);

  const selectEvent = useCallback((id: string | null) => {
    setSelectedEventId(id);
    if (id) setTab('events');
  }, []);

  const handleEventClick = useCallback((event: AnyEvent) => {
    setSelectedEventId((prev) => {
      const next = prev === event.id ? null : event.id;
      if (next) setTab('events');
      return next;
    });
    mapRef.current?.flyTo(event.position.lat, event.position.lng);
  }, []);

  if (status === 'loading' || !session || session.user?.role === 'partner') return null;

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <div className="w-full px-6 lg:px-8 py-4 flex flex-col flex-1 min-w-0 min-h-0 gap-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Visualize events, competitors, and office locations across your accounts</p>
          </div>
          <EventsLegend
            layers={legendLayers}
            companiesCount={companyMarkers.length}
            companiesLoading={companiesLoading}
            loadedCompanies={loadedCompanies}
            totalCompanies={totalCompanies}
          />
        </div>

        <div className="flex-1 flex gap-0 rounded-xl border bg-card overflow-hidden min-h-[500px] max-h-[calc(100vh-200px)] relative isolate">
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
                  competitorEvents={visibleCompetitorEvents}
                  selectedEventId={selectedEventId}
                  onEventSelect={selectEvent}
                  isDark={isDark}
                  onViewportChange={handleViewportChange}
                  resizeKey={listOpen ? 1 : 0}
                  mapRef={mapRef}
                  initialCenter={persisted?.center}
                  initialZoom={persisted?.zoom}
                />
              </div>
            )}
          </div>

          <EventsSidebar
            tab={tab}
            onTabChange={setTab}
            isOpen={listOpen}
            onOpenChange={setListOpen}
            events={sortedEvents}
            selectedEventId={selectedEventId}
            onEventClick={handleEventClick}
            visibleCompanies={visibleCompanies}
            filteredCompanies={filteredCompanies}
            totalCompanies={companyMarkers.length}
            companySearch={search}
            onCompanySearchChange={setSearch}
            onExport={handleExportCompanies}
          />
        </div>
      </div>
    </main>
  );
}
