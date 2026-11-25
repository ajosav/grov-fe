import {describe, expect, it} from 'vitest';

import {
  boundsOf,
  circleRing,
  distanceMetres,
  formatDistance,
  outlinesOf,
  parseCoordinates,
  toMultiPolygon,
  zoneHasHoles,
} from './geo';

const BODIJA = {lat: 7.4429, lng: 3.9078};

describe('parseCoordinates', () => {
  it('reads pairs copied from map apps', () => {
    expect(parseCoordinates('7.4429, 3.9078')).toEqual(BODIJA);
    expect(parseCoordinates(' 7.4429 3.9078 ')).toEqual(BODIJA);
    expect(parseCoordinates('6.524379,3.379206')).toEqual({lat: 6.524379, lng: 3.379206});
  });

  it('rounds to the six decimals the API keeps', () => {
    expect(parseCoordinates('7.123456789, 3.987654321')).toEqual({lat: 7.123457, lng: 3.987654});
  });

  it('rejects anything else', () => {
    for (const text of ['', '7.44', 'abc, def', '91, 3', '7, 181', '1, 2, 3']) {
      expect(parseCoordinates(text)).toBeNull();
    }
  });
});

describe('circleRing', () => {
  it('is closed and every point sits at the radius', () => {
    const ring = circleRing(BODIJA, 3000);
    expect(ring).toHaveLength(65);
    expect(ring[0]).toEqual(ring.at(-1));
    for (const [lng, lat] of ring) {
      expect(Math.abs(distanceMetres(BODIJA, {lat, lng}) - 3000)).toBeLessThan(2);
    }
  });
});

describe('formatDistance', () => {
  it('uses metres below a kilometre', () => {
    expect(formatDistance(850)).toBe('850 m');
    expect(formatDistance(2400)).toBe('2.4 km');
    expect(formatDistance(12_600)).toBe('13 km');
  });
});

describe('zones', () => {
  const square = [
    [3.9, 7.4],
    [3.95, 7.4],
    [3.95, 7.45],
    [3.9, 7.45],
    [3.9, 7.4],
  ] as [number, number][];
  const hole = [
    [3.91, 7.41],
    [3.92, 7.41],
    [3.92, 7.42],
    [3.91, 7.41],
  ] as [number, number][];

  it('finds bounds over polygons and pins', () => {
    expect(boundsOf(toMultiPolygon([square]), [{lat: 7.5, lng: 3.8}])).toEqual([
      [3.8, 7.4],
      [3.95, 7.5],
    ]);
    expect(boundsOf(null)).toBeNull();
  });

  it('keeps outlines and reports holes', () => {
    const zone = {type: 'MultiPolygon' as const, coordinates: [[square, hole]]};
    expect(zoneHasHoles(zone)).toBe(true);
    expect(outlinesOf(zone)).toEqual([square]);
    expect(zoneHasHoles(toMultiPolygon([square]))).toBe(false);
  });
});
