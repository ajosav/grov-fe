import {describe, expect, it} from 'vitest';

import {earliestResumeDay, formatQty, listingState, pauseUntilDay, sellingBody} from './listings';

const now = new Date('2026-11-24T10:00:00Z');

describe('listingState', () => {
  it('is delisted whenever the listing is inactive', () => {
    expect(listingState({active: false, pausedUntil: null}, now)).toBe('DELISTED');
    expect(listingState({active: false, pausedUntil: '2026-12-01T00:00:00Z'}, now)).toBe(
      'DELISTED'
    );
  });
  it('is paused only until the pause ends', () => {
    expect(listingState({active: true, pausedUntil: '2026-11-25T00:00:00Z'}, now)).toBe('PAUSED');
    expect(listingState({active: true, pausedUntil: '2026-11-24T10:00:00Z'}, now)).toBe('ACTIVE');
    expect(listingState({active: true, pausedUntil: '2026-11-01T00:00:00Z'}, now)).toBe('ACTIVE');
  });
  it('is active with no pause', () => {
    expect(listingState({active: true, pausedUntil: null}, now)).toBe('ACTIVE');
  });
});

describe('pauseUntilDay', () => {
  it('is the start of that local day', () => {
    const iso = pauseUntilDay(new Date(2026, 11, 3, 15, 30));
    expect(new Date(iso).getTime()).toBe(new Date(2026, 11, 3).getTime());
  });
});

describe('earliestResumeDay', () => {
  it('is tomorrow at the start of the day', () => {
    const day = earliestResumeDay(new Date(2026, 10, 24, 23, 59));
    expect(day.getTime()).toBe(new Date(2026, 10, 25).getTime());
  });
});

describe('formatQty', () => {
  it('drops trailing zeros', () => {
    expect(formatQty('2.000')).toBe('2');
    expect(formatQty('0.500')).toBe('0.5');
    expect(formatQty('12.250')).toBe('12.25');
    expect(formatQty('5')).toBe('5');
    expect(formatQty(null)).toBeNull();
  });
});

describe('sellingBody', () => {
  it('keeps the minimum and clears the pause', () => {
    expect(sellingBody({minOrderQty: '2.000'})).toEqual({
      active: true,
      pausedUntil: null,
      minOrderQty: '2.000',
    });
  });
});
