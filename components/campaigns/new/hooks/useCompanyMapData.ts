import { useMemo } from 'react';
import type { WSCompanyResult } from '@/lib/schemas';
import { resolveCoordinates, type LatLng } from '@/lib/geo';

/** A company marker with resolved coordinates for the map. */
export interface CompanyMapMarker {
  domain: string;
  name: string;
  position: LatLng;
}

/**
 * Transforms company search results into geocoded map markers.
 * Filters out companies without resolvable coordinates.
 */
export function useCompanyMapData(companies: WSCompanyResult[]): CompanyMapMarker[] {
  return useMemo(() => {
    const markers: CompanyMapMarker[] = [];
    for (const c of companies) {
      const position = resolveCoordinates(c.hq_city, c.hq_country);
      if (position) {
        markers.push({ domain: c.domain, name: c.name, position });
      }
    }
    return markers;
  }, [companies]);
}
