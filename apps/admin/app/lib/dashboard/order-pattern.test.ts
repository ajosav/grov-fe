import {describe, expect, it} from 'vitest';

import type {OrderBucket} from '@grov/models';

import {bucketLabel, bucketTitle, busiest, patternSentence} from './order-pattern';

const money = (kobo: number) => ({kobo, currency: 'NGN' as const});
const bucket = (b: number, orders: number): OrderBucket => ({
  bucket: b,
  orders,
  revenue: money(orders * 1000),
});

describe('bucket labels', () => {
  it('labels hours on a 12-hour clock', () => {
    expect(bucketLabel('day', 0)).toBe('12am');
    expect(bucketLabel('day', 12)).toBe('12pm');
    expect(bucketLabel('day', 19)).toBe('7pm');
    expect(bucketTitle('day', 23)).toBe('11pm to 12am');
  });

  it('starts the week on Monday', () => {
    expect(bucketLabel('week', 1)).toBe('Mon');
    expect(bucketLabel('week', 7)).toBe('Sun');
    expect(bucketTitle('week', 5)).toBe('Friday');
  });

  it('labels days of the month with the number', () => {
    expect(bucketLabel('month', 20)).toBe('20');
  });
});

describe('busiest', () => {
  it('is null when nothing was ordered', () => {
    expect(busiest([bucket(1, 0), bucket(2, 0)])).toBeNull();
    expect(patternSentence('week', [bucket(1, 0)])).toBe('No orders in this period.');
  });

  it('finds the top bucket and its share, earliest on a tie', () => {
    expect(busiest([bucket(1, 1), bucket(2, 3), bucket(3, 3), bucket(4, 1)])).toEqual({
      bucket: 2,
      orders: 3,
      share: 3 / 8,
    });
  });

  it('writes counts only, never a reason', () => {
    expect(patternSentence('week', [bucket(5, 3), bucket(2, 1)])).toBe(
      'Friday is the busiest day (75% of orders).'
    );
    expect(patternSentence('day', [bucket(19, 1)])).toBe(
      'Orders peak from 7pm to 8pm (100% of orders).'
    );
    expect(patternSentence('month', [bucket(22, 1)])).toBe(
      'The 22nd is the busiest day of the month (100% of orders).'
    );
  });
});
