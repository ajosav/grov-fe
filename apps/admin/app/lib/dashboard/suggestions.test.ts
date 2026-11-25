import {describe, expect, it} from 'vitest';

import type {CatalogueAnalytics, CatalogueRow} from '@grov/models';

import {buildSuggestions} from './suggestions';

const row = (id: string, patch: Partial<CatalogueRow> = {}): CatalogueRow =>
  ({
    id,
    displayName: `Product ${id}`,
    baseUnit: 'g',
    stockState: 'OUT',
    availableQty: 0,
    qtySold: 0,
    orders: 0,
    ...patch,
  }) as CatalogueRow;

const decliner = (id: string, now: number, before: number) =>
  ({
    productId: id,
    displayName: `Product ${id}`,
    revenue: {kobo: now, currency: 'NGN'},
    previousRevenue: {kobo: before, currency: 'NGN'},
    orders: 3,
  }) as CatalogueAnalytics['decliners'][number];

describe('buildSuggestions', () => {
  it('suggests nothing when stock and sales look steady', () => {
    expect(buildSuggestions({outOfStock: [], lowStock: [], decliners: []})).toEqual([]);
  });

  it('restocks out-of-stock products before low ones, best sellers first', () => {
    const result = buildSuggestions({
      outOfStock: [row('a', {qtySold: 100}), row('b', {qtySold: 900})],
      lowStock: [row('c', {stockState: 'LOW', availableQty: 500, qtySold: 5000})],
      decliners: [],
    });
    expect(result.map(s => s.key)).toEqual(['restock-b', 'restock-a', 'restock-c']);
  });

  it('caps restock suggestions at three, then adds products that are selling less', () => {
    const result = buildSuggestions({
      outOfStock: ['a', 'b', 'c', 'd'].map(id => row(id)),
      lowStock: [],
      decliners: [decliner('x', 100, 900), decliner('y', 500, 600)],
    });
    expect(result.filter(s => s.kind === 'RESTOCK')).toHaveLength(3);
    expect(result.filter(s => s.kind === 'REVIEW_SALES')).toHaveLength(2);
  });

  it('never exceeds five suggestions', () => {
    const result = buildSuggestions({
      outOfStock: ['a', 'b', 'c'].map(id => row(id)),
      lowStock: [],
      decliners: ['w', 'x', 'y', 'z'].map(id => decliner(id, 1, 100)),
    });
    expect(result).toHaveLength(5);
  });

  it('ignores a "decliner" that did not sell less', () => {
    expect(
      buildSuggestions({outOfStock: [], lowStock: [], decliners: [decliner('a', 500, 500)]})
    ).toEqual([]);
  });

  it('shows the inputs behind every suggestion', () => {
    const [restock, review] = buildSuggestions({
      outOfStock: [row('a', {qtySold: 2000, orders: 4})],
      lowStock: [],
      decliners: [decliner('b', 100, 400)],
    });
    expect(restock?.evidence.map(e => e.label)).toContain('Sold this period');
    expect(restock?.rationale).toContain('Out of stock');
    expect(review?.evidence.find(e => e.label === 'Change')?.value).toBe('−75%');
  });

  it('opens restocks on the inventory tab and reviews on the analytics tab', () => {
    const [restock, review] = buildSuggestions({
      outOfStock: [row('a')],
      lowStock: [],
      decliners: [decliner('b', 1, 9)],
    });
    expect(restock?.to).toBe('/catalogue/products/a?tab=inventory');
    expect(review?.to).toBe('/catalogue/products/b?tab=analytics');
  });
});
