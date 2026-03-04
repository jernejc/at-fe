import { COUNTRY_CENTROIDS } from './country-centroids';
import { CITY_COORDINATES } from './city-coordinates';

/** Latitude/longitude coordinate pair. */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Resolve city/country strings to lat/lng coordinates.
 * Tries exact city+country match first, then country centroid with jitter.
 * @returns Coordinates or null if neither city nor country can be resolved.
 */
export function resolveCoordinates(
  hqCity: string | null | undefined,
  hqCountry: string | null | undefined,
): LatLng | null {
  const country = hqCountry?.trim().toLowerCase();
  const city = hqCity?.trim().toLowerCase();

  // Try city+country exact match
  if (city && country) {
    const cityKey = `${city},${country}`;
    const cityMatch = CITY_COORDINATES[cityKey];
    if (cityMatch) return cityMatch;
  }

  // Fall back to country centroid with slight jitter
  if (country) {
    const countryMatch = COUNTRY_CENTROIDS[country];
    if (countryMatch) {
      return {
        lat: countryMatch.lat + (seededRandom(city ?? country) - 0.5) * 0.8,
        lng: countryMatch.lng + (seededRandom((city ?? country) + '_lng') - 0.5) * 0.8,
      };
    }
  }

  return null;
}

/** Simple seeded pseudo-random for deterministic jitter (same input → same offset). */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash & 0x7fffffff) % 1000) / 1000;
}
