'use client';

import { useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, useMap, useMapEvents, Pane } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { LatLng } from '@/lib/geo';
import type { GoogleOffice } from '@/lib/geo';
import type { PartnerEvent } from '@/data/partner-events';
import type { CompetitorEvent } from '@/data/competitor-events';
import { COMPETITOR_BRAND_COLORS } from '@/data/competitor-events';
import 'leaflet/dist/leaflet.css';

const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export interface EventCompanyMarker {
  domain: string;
  name: string;
  position: LatLng;
  contactName?: string;
  contactTitle?: string;
  contactLinkedIn?: string;
}

export interface ViewportInfo {
  companies: EventCompanyMarker[];
  eventIds: Set<string>;
  zoom: number;
}

export interface EventsMapHandle {
  flyTo: (lat: number, lng: number) => void;
  getCenter: () => { lat: number; lng: number };
  getZoom: () => number;
}

interface EventsMapProps {
  companyMarkers: EventCompanyMarker[];
  googleOffices: GoogleOffice[];
  partnerEvents: PartnerEvent[];
  competitorEvents?: CompetitorEvent[];
  selectedEventId: string | null;
  onEventSelect: (id: string | null) => void;
  isDark: boolean;
  onViewportChange?: (info: ViewportInfo) => void;
  resizeKey?: number;
  mapRef?: React.MutableRefObject<EventsMapHandle | null>;
  initialCenter?: [number, number];
  initialZoom?: number;
}

function InvalidateSize({ resizeKey }: { resizeKey?: number }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 320);
    return () => clearTimeout(timer);
  }, [resizeKey, map]);
  return null;
}

function MapRefBridge({ mapRef }: { mapRef: React.MutableRefObject<EventsMapHandle | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = {
      flyTo: (lat, lng) => map.flyTo([lat, lng], 10, { duration: 0.8 }),
      getCenter: () => {
        const c = map.getCenter();
        return { lat: c.lat, lng: c.lng };
      },
      getZoom: () => map.getZoom(),
    };
    return () => { mapRef.current = null; };
  }, [map, mapRef]);
  return null;
}

const GOOGLE_PIN_SVG = `<svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#56B4E9" stroke="#fff" stroke-width="2"/>
  <text x="16" y="19" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui,sans-serif">G</text>
</svg>`;

const GOOGLE_EVENT_COLOR = '#0072B2';
const GOOGLE_EVENT_COLOR_SELECTED = '#005A8E';
const PARTNER_EVENT_COLOR = '#009E73';
const PARTNER_EVENT_COLOR_SELECTED = '#007F5C';

function eventPinSvg(color: string, size: 'normal' | 'selected' = 'normal'): string {
  const w = size === 'selected' ? 40 : 32;
  const h = size === 'selected' ? 50 : 40;
  const sw = size === 'selected' ? '2.5' : '2';
  return `<svg width="${w}" height="${h}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}" stroke="#fff" stroke-width="${sw}"/>
  <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="14" font-weight="700" font-family="system-ui,sans-serif">★</text>
</svg>`;
}

function getEventIcon(event: PartnerEvent, isSelected: boolean): L.DivIcon {
  const isPartner = !!event.partner;
  const color = isSelected
    ? (isPartner ? PARTNER_EVENT_COLOR_SELECTED : GOOGLE_EVENT_COLOR_SELECTED)
    : (isPartner ? PARTNER_EVENT_COLOR : GOOGLE_EVENT_COLOR);
  const size = isSelected ? 'selected' as const : 'normal' as const;
  return L.divIcon({
    html: eventPinSvg(color, size),
    className: `event-pin${isSelected ? ' event-pin-selected' : ''}`,
    iconSize: isSelected ? L.point(40, 50) : L.point(32, 40),
    iconAnchor: isSelected ? L.point(20, 50) : L.point(16, 40),
    popupAnchor: isSelected ? L.point(0, -50) : L.point(0, -40),
  });
}

function competitorPinSvg(color: string, initial: string, size: 'normal' | 'selected' = 'normal'): string {
  const w = size === 'selected' ? 40 : 32;
  const h = size === 'selected' ? 50 : 40;
  const sw = size === 'selected' ? '2.5' : '2';
  return `<svg width="${w}" height="${h}" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="${color}" stroke="#fff" stroke-width="${sw}"/>
  <text x="16" y="20" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="system-ui,sans-serif">${initial}</text>
</svg>`;
}

function getCompetitorIcon(event: CompetitorEvent, isSelected: boolean): L.DivIcon {
  const color = COMPETITOR_BRAND_COLORS[event.brand];
  const initial = event.brand.charAt(0);
  const size = isSelected ? 'selected' as const : 'normal' as const;
  return L.divIcon({
    html: competitorPinSvg(color, initial, size),
    className: `competitor-pin${isSelected ? ' competitor-pin-selected' : ''}`,
    iconSize: isSelected ? L.point(40, 50) : L.point(32, 40),
    iconAnchor: isSelected ? L.point(20, 50) : L.point(16, 40),
    popupAnchor: isSelected ? L.point(0, -50) : L.point(0, -40),
  });
}

const GOOGLE_ICON = L.divIcon({
  html: GOOGLE_PIN_SVG,
  className: 'google-office-pin',
  iconSize: L.point(32, 40),
  iconAnchor: L.point(16, 40),
  popupAnchor: L.point(0, -40),
});


function createClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount();
  const size = count < 20 ? 36 : count < 50 ? 44 : count < 100 ? 52 : 60;
  const className = count >= 50 ? 'company-cluster company-cluster-large' : 'company-cluster';

  return L.divIcon({
    html: `<div class="${className}">${count}</div>`,
    className: '',
    iconSize: L.point(size, size),
  });
}

function FitBounds({ companyMarkers, googleOffices, skip }: { companyMarkers: EventCompanyMarker[]; googleOffices: GoogleOffice[]; skip?: boolean }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current || skip) return;

    const allPoints: L.LatLngTuple[] = [
      ...companyMarkers.map((m) => [m.position.lat, m.position.lng] as L.LatLngTuple),
      ...googleOffices.map((o) => [o.position.lat, o.position.lng] as L.LatLngTuple),
    ];

    if (allPoints.length === 0) return;

    hasFit.current = true;
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 5 });
  }, [companyMarkers, googleOffices, map, skip]);

  return null;
}

function ViewportTracker({
  companyMarkers,
  partnerEvents,
  competitorEvents,
  onViewportChange,
}: {
  companyMarkers: EventCompanyMarker[];
  partnerEvents: PartnerEvent[];
  competitorEvents: CompetitorEvent[];
  onViewportChange: (info: ViewportInfo) => void;
}) {
  const map = useMap();

  const report = useCallback(() => {
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const companies = companyMarkers.filter((m) =>
      bounds.contains([m.position.lat, m.position.lng]),
    );
    const partnerIds = partnerEvents
      .filter((e) => bounds.contains([e.position.lat, e.position.lng]))
      .map((e) => e.id);
    const competitorIds = competitorEvents
      .filter((e) => bounds.contains([e.position.lat, e.position.lng]))
      .map((e) => e.id);
    const eventIds = new Set([...partnerIds, ...competitorIds]);
    onViewportChange({ companies, eventIds, zoom });
  }, [map, companyMarkers, partnerEvents, competitorEvents, onViewportChange]);

  useMapEvents({
    moveend: report,
    zoomend: report,
  });

  useEffect(() => {
    report();
  }, [report]);

  return null;
}

export function EventsMap({
  companyMarkers,
  googleOffices,
  partnerEvents,
  competitorEvents = [],
  selectedEventId,
  onEventSelect,
  isDark,
  onViewportChange,
  resizeKey,
  mapRef,
  initialCenter,
  initialZoom,
}: EventsMapProps) {
  const hasRestoredView = !!(initialCenter && initialZoom);

  // MapContainer freezes className on first mount (react-leaflet useState) — keep selection state on a wrapper so dimming toggles correctly.
  return (
    <div
      className="h-full w-full min-h-0"
      data-map-event-selection={selectedEventId ? 'true' : undefined}
    >
    <MapContainer
      center={initialCenter ?? [39, -98]}
      zoom={initialZoom ?? 4}
      scrollWheelZoom
      zoomControl
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer url={isDark ? DARK_TILES : LIGHT_TILES} attribution={TILE_ATTRIBUTION} />
      <FitBounds companyMarkers={companyMarkers} googleOffices={googleOffices} skip={hasRestoredView} />
      <InvalidateSize resizeKey={resizeKey} />

      {mapRef && <MapRefBridge mapRef={mapRef} />}

      {onViewportChange && (
        <ViewportTracker
          companyMarkers={companyMarkers}
          partnerEvents={partnerEvents}
          competitorEvents={competitorEvents}
          onViewportChange={onViewportChange}
        />
      )}

      <MarkerClusterGroup
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={false}
        showCoverageOnHover={false}
        animate
      >
        {companyMarkers.map((marker) => (
          <CircleMarker
            key={marker.domain}
            center={[marker.position.lat, marker.position.lng]}
            radius={4}
            pathOptions={{
              fillColor: 'var(--accent-yellow)',
              fillOpacity: 0.7,
              stroke: false,
            }}
          />
        ))}
      </MarkerClusterGroup>

      {/* Partner event markers */}
      <Pane name="partner-events" style={{ zIndex: 660 }}>
        {partnerEvents.map((event) => {
          const isSelected = event.id === selectedEventId;
          return (
            <Marker
              key={event.id}
              position={[event.position.lat, event.position.lng]}
              icon={getEventIcon(event, isSelected)}
              pane="partner-events"
              eventHandlers={{
                click: () => onEventSelect(isSelected ? null : event.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={L.point(0, isSelected ? -52 : -42)}
                className="event-tooltip"
                permanent={false}
              >
                <strong>{event.name}</strong>
                {event.partner && <span> · {event.partner}</span>}
                <br />
                {event.city}{event.state ? `, ${event.state}` : ''} · {formatEventDate(event.date)}
              </Tooltip>
            </Marker>
          );
        })}
      </Pane>

      {/* Competitor event markers */}
      <Pane name="competitor-events" style={{ zIndex: 655 }}>
        {competitorEvents.map((event) => {
          const isSelected = event.id === selectedEventId;
          return (
            <Marker
              key={event.id}
              position={[event.position.lat, event.position.lng]}
              icon={getCompetitorIcon(event, isSelected)}
              pane="competitor-events"
              eventHandlers={{
                click: () => onEventSelect(isSelected ? null : event.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={L.point(0, isSelected ? -52 : -42)}
                className="event-tooltip"
                permanent={false}
              >
                <strong>{event.name}</strong>
                <span> · {event.brand}</span>
                <br />
                {event.city}{event.state ? `, ${event.state}` : ''} · {formatEventDate(event.date)}
              </Tooltip>
            </Marker>
          );
        })}
      </Pane>

      <Pane name="google-offices" style={{ zIndex: 650 }}>
        {googleOffices.map((office) => (
          <Marker
            key={office.name}
            position={[office.position.lat, office.position.lng]}
            icon={GOOGLE_ICON}
            pane="google-offices"
          >
            <Tooltip
              direction="top"
              offset={L.point(0, -42)}
              className="google-office-tooltip"
              permanent={false}
            >
              {office.city}, {office.state}
            </Tooltip>
          </Marker>
        ))}
      </Pane>
    </MapContainer>
    </div>
  );
}

function formatEventDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
