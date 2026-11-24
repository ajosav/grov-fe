import {describe, expect, it} from 'vitest';

import type {Category} from '@grov/models';

import {categoryPath, categoryRows} from './categories';

const make = (id: string, name: string, parentId: string | null = null): Category => ({
  id,
  parentId,
  slug: name.toLowerCase(),
  name,
  tintKey: 'GRAIN',
  sort: 100,
  discretionaryRank: null,
  active: true,
  productCount: 0,
  createdAt: '2026-11-24T10:00:00.000Z',
  updatedAt: '2026-11-24T10:00:00.000Z',
});

describe('categoryRows', () => {
  it('puts sub-categories under their parent and counts them', () => {
    const rows = categoryRows([
      make('grains', 'Grains'),
      make('oils', 'Oils'),
      make('rice', 'Rice', 'grains'),
      make('beans', 'Beans', 'grains'),
    ]);
    expect(rows.map(row => [row.category.id, row.depth, row.childCount])).toEqual([
      ['grains', 0, 2],
      ['rice', 1, 0],
      ['beans', 1, 0],
      ['oils', 0, 0],
    ]);
  });

  it('keeps a sub-category whose parent is missing, at the top level', () => {
    const rows = categoryRows([make('rice', 'Rice', 'gone')]);
    expect(rows).toEqual([
      {category: expect.objectContaining({id: 'rice'}), depth: 0, childCount: 0},
    ]);
  });
});

describe('categoryPath', () => {
  const all = [make('grains', 'Grains'), make('rice', 'Rice', 'grains')];

  it('joins a sub-category to its parent', () => {
    expect(categoryPath('rice', all)).toBe('Grains › Rice');
    expect(categoryPath('grains', all)).toBe('Grains');
  });

  it('is null for an unknown or missing id', () => {
    expect(categoryPath('nope', all)).toBeNull();
    expect(categoryPath(undefined, all)).toBeNull();
  });
});
