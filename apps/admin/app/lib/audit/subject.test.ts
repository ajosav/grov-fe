import {describe, expect, it} from 'vitest';

import {exportRows} from './export';
import {subjectLink, subjectName} from './subject';

const base = {entityType: 'product', entityId: 'p1', action: 'catalogue.product.updated'};

describe('audit subject', () => {
  it('links products, with the tab the change belongs to', () => {
    const subject = {kind: 'product', id: 'p1', name: 'Rice'} as const;
    expect(subjectLink({...base, subject})).toBe('/catalogue/products/p1');
    expect(subjectLink({...base, entityType: 'stock', subject})).toContain('tab=inventory');
    expect(subjectLink({...base, entityType: 'price', subject})).toContain('tab=pricing');
  });

  it('does not link a record that was deleted or has no page', () => {
    const subject = {kind: 'product', id: 'p1', name: 'Rice'} as const;
    expect(subjectLink({...base, action: 'catalogue.product.deleted', subject})).toBeNull();
    expect(subjectLink({...base, subject: {kind: 'file', id: null, name: 'a/b.png'}})).toBeNull();
  });

  it('falls back to a short id when the name is unknown', () => {
    const subject = {kind: 'product', id: '12345678-aaaa', name: null} as const;
    expect(subjectName({...base, subject})).toBe('Unnamed product · 12345678');
  });

  it('exports a header and one row per entry', () => {
    const rows = exportRows([
      {
        ...base,
        id: 'a',
        at: '2026-11-25T10:00:00.000Z',
        label: 'Product updated',
        kind: 'update',
        moduleLabel: 'Catalogue',
        subject: {kind: 'product', id: 'p1', name: 'Rice'},
        actor: null,
        storeId: null,
        storeName: null,
        ip: null,
        requestId: null,
        module: 'catalogue',
      } as never,
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[1]?.[7]).toBe('Rice');
    expect(rows[1]?.[9]).toBe('System');
  });
});
