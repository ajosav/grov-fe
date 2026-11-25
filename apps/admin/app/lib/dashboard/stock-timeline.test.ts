import {describe, expect, it} from 'vitest';

import type {CatalogueRow} from '@grov/models';

import {coverStatus, formatDaysLeft, stockCover} from './stock-timeline';

const row = (id: string, patch: Partial<CatalogueRow>): CatalogueRow =>
  ({
    id,
    displayName: `P ${id}`,
    baseUnit: 'g',
    stockState: 'IN_STOCK',
    availableQty: 1000,
    qtySold: 300,
    ...patch,
  }) as CatalogueRow;

describe('stockCover', () => {
  it('divides available stock by average daily sales', () => {
    // 300 sold over 30 days = 10 a day; 100 available = 10 days.
    const [cover] = stockCover([row('a', {availableQty: 100, qtySold: 300})], 30);
    expect(cover?.perDay).toBe(10);
    expect(cover?.daysLeft).toBe(10);
    expect(cover?.status).toBe('OK');
  });

  it('puts the product that runs out soonest first', () => {
    const result = stockCover(
      [
        row('slow', {availableQty: 900}),
        row('fast', {availableQty: 30}),
        row('out', {availableQty: 0}),
      ],
      30
    );
    expect(result.map(c => c.id)).toEqual(['out', 'fast', 'slow']);
  });

  it('marks out of stock, order now, soon and ok', () => {
    expect(coverStatus(0)).toBe('OUT');
    expect(coverStatus(3)).toBe('ORDER_NOW');
    expect(coverStatus(3.1)).toBe('SOON');
    expect(coverStatus(7)).toBe('SOON');
    expect(coverStatus(7.1)).toBe('OK');
  });

  it('leaves out products no store counts and products that sold nothing', () => {
    const result = stockCover(
      [
        row('uncounted', {availableQty: null}),
        row('untracked', {stockState: 'UNTRACKED'}),
        row('idle', {qtySold: 0}),
      ],
      30
    );
    expect(result).toEqual([]);
  });

  it('keeps an out-of-stock product even if it sold nothing', () => {
    const [cover] = stockCover([row('a', {availableQty: 0, qtySold: 0})], 30);
    expect(cover?.status).toBe('OUT');
  });

  it('does not divide by a zero-day period', () => {
    expect(stockCover([row('a', {})], 0)[0]?.perDay).toBe(300);
  });
});

describe('formatDaysLeft', () => {
  it('reads naturally', () => {
    expect(formatDaysLeft(0)).toBe('Out now');
    expect(formatDaysLeft(0.4)).toBe('1 day left');
    expect(formatDaysLeft(5.2)).toBe('5 days left');
    expect(formatDaysLeft(30)).toBe('4+ weeks');
  });
});
