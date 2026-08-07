/**
 * Geofence utility — Haversine formula for distance calculation.
 * Source: BR-GEO-004 (docs/04-business-rules.md §17)
 */

const EARTH_RADIUS_METERS = 6_371_000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate great-circle distance (meters) between two GPS coordinates
 * using the Haversine formula.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Check whether a point is within a given radius (meters) of a center point.
 * Returns `{ distance, inside }`.
 */
export function checkInsideGeofence(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeter: number,
): { distance: number; inside: boolean } {
  const distance = haversineDistance(userLat, userLon, centerLat, centerLon);
  return {
    distance: Math.round(distance * 100) / 100,
    inside: distance <= radiusMeter,
  };
}
