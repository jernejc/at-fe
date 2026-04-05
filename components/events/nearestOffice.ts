import type { LatLng } from '@/lib/geo';
import type { GoogleOffice } from '@/lib/geo';
import type { PartnerEvent } from '@/data/partner-events';
import type { EventCompanyMarker } from './EventsMap';

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export const KM_TO_MI = 0.621371;
export const MI_TO_KM = 1.60934;

export interface NearestOfficeResult {
  office: GoogleOffice;
  distanceKm: number;
  distanceMi: number;
}

export function findNearestOffice(
  position: LatLng,
  offices: GoogleOffice[],
): NearestOfficeResult | null {
  if (offices.length === 0) return null;

  let best: NearestOfficeResult | null = null;
  for (const office of offices) {
    const km = haversineKm(position, office.position);
    if (!best || km < best.distanceKm) {
      best = { office, distanceKm: km, distanceMi: km * KM_TO_MI };
    }
  }
  return best;
}

export function companiesWithinRadius(
  center: LatLng,
  radiusKm: number,
  companies: EventCompanyMarker[],
): EventCompanyMarker[] {
  return companies.filter((c) => haversineKm(center, c.position) <= radiusKm);
}

export function findNearestEvent(
  position: LatLng,
  events: PartnerEvent[],
): { event: PartnerEvent; distanceMi: number } | null {
  if (events.length === 0) return null;
  let bestKm = Infinity;
  let bestEvent: PartnerEvent | null = null;
  for (const ev of events) {
    const km = haversineKm(position, ev.position);
    if (km < bestKm) {
      bestKm = km;
      bestEvent = ev;
    }
  }
  return bestEvent ? { event: bestEvent, distanceMi: bestKm * KM_TO_MI } : null;
}

export function formatDistance(mi: number): string {
  if (mi < 1) return '<1 mi';
  return `${Math.round(mi)} mi`;
}
