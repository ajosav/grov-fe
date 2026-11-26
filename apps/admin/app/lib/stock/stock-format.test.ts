import {describe, expect, it} from 'vitest';

import type {StockOverviewRow} from '@grov/models';

import {
  agoText,
  formatCover,
  formatMovementQty,
  priceMoveText,
  reorderText,
  signalCopy,
  suggestionMath,
} from './stock-format';

const NOW = new Date('2026-11-26T12:00:00Z');

const row = (patch: Partial<StockOverviewRow> = {}): StockOverviewRow => ({
  productId: 'p1',
  sku: 'RICE-50',
  displayName: 'Rice 50 kg',
  categoryName: 'Grains',
  coverImagePath: null,
  baseUnit: 'g',
  onHandQty: 200_000,
  reservedQty: 0,
  availableQty: 200_000,
  lowThresholdQty: null,
  low: false,
  leadTimeDays: 2,
  leadTimeCustom: false,
  coverTargetDays: 7,
  coverTargetCustom: false,
  soldQty30d: 650_000,
  soldQty7d: 350_000,
  perDay: 50_000,
  trendBps: 13_333,
  coverDays: 4,
  status: 'ORDER_SOON',
  signals: [],
  suggestedQty: 450_000,
  reorderInDays: 2,
  coverTargetUsedDays: 11,
  sizeLabel: '50 kg bag',
  basePrice: {kobo: 8_000_000, currency: 'NGN'},
  retailPrice: {kobo: 9_000_000, currency: 'NGN'},
  marginBps: 1111,
  priceMoveBps: 1429,
  priceMovedAt: '2026-11-23T12:00:00Z',
  costValue: {kobo: 32_000_000, currency: 'NGN'},
  retailValue: {kobo: 36_000_000, currency: 'NGN'},
  restockCost: {kobo: 72_000_000, currency: 'NGN'},
  updatedAt: '2026-11-25T12:00:00Z',
  ...patch,
});

describe('formatCover', () => {
  it('reads days, weeks and the extremes', () => {
    expect(formatCover(null)).toBe('—');
    expect(formatCover(0)).toBe('Out now');
    expect(formatCover(0.4)).toBe('Under a day');
    expect(formatCover(1)).toBe('1 day');
    expect(formatCover(4.04)).toBe('4 days');
    expect(formatCover(59.5)).toBe('8+ weeks');
    expect(formatCover(54_000)).toBe('Over a year');
  });
});

describe('formatMovementQty', () => {
  it('signs a quantity and shows it in the larger unit', () => {
    expect(formatMovementQty('50000.000', 'g')).toBe('+50 kg');
    expect(formatMovementQty('-2500.000', 'g')).toBe('−2.5 kg');
    expect(formatMovementQty('12.000', 'piece')).toBe('+12 pieces');
  });
});

describe('agoText and priceMoveText', () => {
  it('says how long ago', () => {
    expect(agoText('2026-11-26T08:00:00Z', NOW)).toBe('today');
    expect(agoText('2026-11-25T08:00:00Z', NOW)).toBe('yesterday');
    expect(agoText('2026-11-23T12:00:00Z', NOW)).toBe('3 days ago');
    expect(agoText(null, NOW)).toBeNull();
  });

  it('shows a base price move only when there is one worth showing', () => {
    expect(priceMoveText(row(), NOW)).toBe('+14% 3 days ago');
    expect(priceMoveText(row({priceMoveBps: 40}), NOW)).toBeNull();
    expect(priceMoveText(row({priceMoveBps: null}), NOW)).toBeNull();
  });
});

describe('signalCopy', () => {
  it('explains a stretched cover target when the price is rising', () => {
    expect(signalCopy('PRICE_RISING', row(), NOW)).toBe(
      'Base price rose +14% 3 days ago. The suggestion covers 11 days instead of 7 days to buy ahead of it.'
    );
  });

  it('explains running out before a delivery could arrive', () => {
    expect(
      signalCopy('RUNS_OUT_BEFORE_DELIVERY', row({status: 'ORDER_NOW', coverDays: 1.5}), NOW)
    ).toBe('Runs out in 1.5 days, before a 2 days delivery could arrive.');
    expect(signalCopy('RUNS_OUT_BEFORE_DELIVERY', row({status: 'OUT', coverDays: null}), NOW)).toBe(
      'Nothing is available to sell.'
    );
  });
});

describe('suggestionMath and reorderText', () => {
  it('shows the sum behind the suggestion', () => {
    expect(suggestionMath(row())).toBe(
      '50 kg a day × (2 days delivery + 11 days cover) − 200 kg available = 450 kg'
    );
  });

  it('shows nothing when nothing is suggested', () => {
    expect(suggestionMath(row({suggestedQty: 0}))).toBeNull();
  });

  it('falls back to the low-stock level for a product that is not selling', () => {
    expect(
      suggestionMath(row({perDay: 0, availableQty: 0, lowThresholdQty: 5000, suggestedQty: 5000}))
    ).toBe('Brings 0 g up to the low-stock level of 5 kg.');
  });

  it('says when to order', () => {
    expect(reorderText(row({reorderInDays: 0}))).toBe('Order today');
    expect(reorderText(row({reorderInDays: 1}))).toBe('Order within 1 day');
    expect(reorderText(row({reorderInDays: null}))).toBeNull();
  });
});
