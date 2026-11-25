import {describe, expect, it} from 'vitest';

import {type PermissionKey, PERMISSIONS} from '@grov/models';
import type {PermissionRequirement} from '@grov/shared';

import {paths} from '../../paths';
import {activeTrail, firstPage, flattenNav, visibleNav} from './nav';

const holding =
  (...held: PermissionKey[]) =>
  ({allOf = [], anyOf = []}: PermissionRequirement) =>
    allOf.every(k => held.includes(k)) && (anyOf.length === 0 || anyOf.some(k => held.includes(k)));

describe('admin nav', () => {
  it('hides pages without permission and drops empty sections', () => {
    const {groups} = visibleNav(holding(PERMISSIONS.STOCK.READ));
    const labels = groups.flatMap(g => g.entries.map(e => e.label));
    expect(labels).toEqual(['Dashboard', 'Stock']);
    const stock = groups[1]?.entries[0];
    expect(stock?.kind === 'section' ? stock.children.map(c => c.label) : []).toEqual([
      'Stock levels',
      'Movements',
    ]);
  });

  it('opens a section on its first visible page', () => {
    const {groups} = visibleNav(holding(PERMISSIONS.STOCK.READ));
    const stock = groups.flatMap(g => g.entries).find(e => e.label === 'Stock');
    expect(stock && firstPage(stock)?.to).toBe(paths.stockLevels);
  });

  it('finds the section trail for a deep link', () => {
    const {groups, footer} = visibleNav(() => true);
    const trails = flattenNav([...groups.flatMap(g => g.entries), ...footer]);
    const trail = activeTrail(trails, paths.cities);
    expect(trail?.page.label).toBe('Cities');
    expect(trail?.sections.map(s => s.id)).toEqual(['stores']);
    expect(activeTrail(trails, '/')?.page.label).toBe('Dashboard');
    expect(activeTrail(trails, '/orders/123')?.page.label).toBe('Orders');
    expect(activeTrail(trails, paths.productIntelligence)?.page.label).toBe('Products');
    expect(activeTrail(trails, paths.productAnalytics)?.sections.map(s => s.id)).toEqual([
      'catalogue',
    ]);
  });
});
