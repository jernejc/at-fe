'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { CompanyMapMarker } from '../hooks/useCompanyMapData';
import 'leaflet/dist/leaflet.css';

const LIGHT_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

interface CompanyMapProps {
  markers: CompanyMapMarker[];
  isDark: boolean;
}

/** Creates a custom cluster icon matching the design (yellow/orange circles with count). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** Auto-fits the map bounds to show all markers. */
function FitBounds({ markers }: { markers: CompanyMapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;

    const bounds = L.latLngBounds(
      markers.map((m) => [m.position.lat, m.position.lng] as L.LatLngTuple),
    );
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 });
  }, [markers, map]);

  return null;
}

/** Interactive Leaflet map showing clustered company HQ locations. */
export function CompanyMap({ markers, isDark }: CompanyMapProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      scrollWheelZoom={false}
      zoomControl
      attributionControl={false}
      className="h-full w-full"
    >
      <TileLayer url={isDark ? DARK_TILES : LIGHT_TILES} attribution={TILE_ATTRIBUTION} />
      <FitBounds markers={markers} />
      <MarkerClusterGroup
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        spiderfyOnMaxZoom={false}
        showCoverageOnHover={false}
        animate
      >
        {markers.map((marker) => (
          <CircleMarker
            key={marker.domain}
            center={[marker.position.lat, marker.position.lng]}
            radius={4}
            pathOptions={{
              fillColor: 'var(--accent-yellow)',
              fillOpacity: 0.8,
              stroke: false,
            }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
