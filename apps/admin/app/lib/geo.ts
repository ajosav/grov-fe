import type {GeoJsonMultiPolygon, Pin} from '@grov/models';

/** A GeoJSON position: `[longitude, latitude]`. */
export type Position = [number, number];
/** A polygon's rings; the first is the outline, the rest are holes. */
export type PolygonRings = Position[][];

const EARTH_RADIUS_METRES = 6_371_000;
const rad = (degrees: number) => (degrees * Math.PI) / 180;
const deg = (radians: number) => (radians * 180) / Math.PI;

/** grov-be stores coordinates as decimal(9, 6). */
const round6 = (value: number) => Math.round(value * 1e6) / 1e6;

/** Mirrors grov-be's `DELIVERY_ZONE_RULES`. */
export const ZONE_RULES = {
  circleRadiusMinMetres: 200,
  circleRadiusMaxMetres: 30_000,
  maxPolygons: 20,
  maxPointsPerRing: 1_000,
} as const;

export function roundPin(pin: Pin): Pin {
  return {lat: round6(pin.lat), lng: round6(pin.lng)};
}

export function formatCoordinates(pin: Pin): string {
  return `${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`;
}

/**
 * Reads "lat, lng" as copied from Google Maps or OpenStreetMap
 * ("7.4429, 3.9078" or "7.4429 3.9078"). Null when it isn't a valid pair.
 */
export function parseCoordinates(text: string): Pin | null {
  const parts = text
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (parts.length !== 2) return null;
  const [lat, lng] = parts.map(Number);
  if (lat === undefined || lng === undefined) return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return roundPin({lat, lng});
}

/** The point `distance` metres from `from` along `bearing` (radians), on a sphere. */
function destination(from: Pin, distance: number, bearing: number): Position {
  const angular = distance / EARTH_RADIUS_METRES;
  const lat1 = rad(from.lat);
  const lng1 = rad(from.lng);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) + Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing)
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [round6(deg(lng2)), round6(deg(lat2))];
}

/**
 * A closed ring approximating a circle: a preview of what grov-be's starter
 * circle will be (it buffers the store's point with 64 segments).
 */
export function circleRing(center: Pin, radiusMetres: number, steps = 64): Position[] {
  const ring = Array.from({length: steps}, (_, i) =>
    destination(center, radiusMetres, (2 * Math.PI * i) / steps)
  );
  const first = ring[0];
  return first ? [...ring, [first[0], first[1]]] : ring;
}

export function distanceMetres(a: Pin, b: Pin): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(h)));
}

export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)} m`;
  const km = metres / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/** South-west and north-east corners around a zone and/or pins, or null when empty. */
export function boundsOf(
  zone: GeoJsonMultiPolygon | null | undefined,
  pins: (Pin | null | undefined)[] = []
): [Position, Position] | null {
  const positions: Position[] = [
    ...(zone?.coordinates.flatMap(polygon => polygon[0] ?? []) ?? []).map(
      p => [p[0], p[1]] as Position
    ),
    ...pins.filter((p): p is Pin => Boolean(p)).map(p => [p.lng, p.lat] as Position),
  ];
  if (positions.length === 0) return null;
  const lngs = positions.map(p => p[0]);
  const lats = positions.map(p => p[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function polygonCount(zone: GeoJsonMultiPolygon | null | undefined): number {
  return zone?.coordinates.length ?? 0;
}

export function zoneHasHoles(zone: GeoJsonMultiPolygon | null | undefined): boolean {
  return zone?.coordinates.some(polygon => polygon.length > 1) ?? false;
}

/** Outlines only: the drawing tool edits single-ring polygons. */
export function outlinesOf(zone: GeoJsonMultiPolygon | null | undefined): Position[][] {
  return (zone?.coordinates ?? []).flatMap(polygon => {
    const outline = polygon[0];
    return outline ? [outline.map(p => [round6(p[0] ?? 0), round6(p[1] ?? 0)] as Position)] : [];
  });
}

export function toMultiPolygon(outlines: Position[][]): GeoJsonMultiPolygon {
  return {type: 'MultiPolygon', coordinates: outlines.map(ring => [ring])};
}

/** A circle as a one-polygon zone, for previews. */
export function circleZone(center: Pin, radiusMetres: number): GeoJsonMultiPolygon {
  return toMultiPolygon([circleRing(center, radiusMetres)]);
}
