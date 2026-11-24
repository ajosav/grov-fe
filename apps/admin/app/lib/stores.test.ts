import {describe, expect, it} from 'vitest';

import {cityView, hasAllStores, slugify} from './stores';

describe('slugify', () => {
  it('makes a slug the API accepts', () => {
    expect(slugify('Bodija Market')).toBe('bodija-market');
    expect(slugify('  Lekki Phase 1 — Admiralty  ')).toBe('lekki-phase-1-admiralty');
    expect(slugify('Ọjà Oba')).toBe('oja-oba');
    expect(slugify('---')).toBe('');
  });
});

describe('cityView', () => {
  it('falls back to Lagos for unknown cities', () => {
    expect(cityView('IBA')).toEqual({lat: 7.3775, lng: 3.947});
    expect(cityView('ABJ')).toEqual(cityView('LOS'));
    expect(cityView(undefined)).toEqual(cityView('LOS'));
  });
});

describe('hasAllStores', () => {
  it('is true only for all-store admins', () => {
    expect(hasAllStores({roles: [], permissions: [], stores: 'ALL'})).toBe(true);
    expect(hasAllStores({roles: [], permissions: [], stores: ['a']})).toBe(false);
    expect(hasAllStores(null)).toBe(false);
  });
});
