import {describe, expect, it} from 'vitest';

import {DEFAULT_STOCK_VIEW, readStockView, writeStockView} from './stock-view';

describe('readStockView', () => {
  it('starts with the most urgent first and ignores unknown values', () => {
    expect(readStockView(new URLSearchParams())).toEqual(DEFAULT_STOCK_VIEW);
    const read = readStockView(new URLSearchParams('view=nope&sort=bad&size=7&page=-3'));
    expect(read.view).toBe('all');
    expect(read.sort).toBe('urgency');
    expect(read.pageSize).toBe(25);
    expect(read.page).toBe(1);
  });

  it('reads the numbers largest first unless told otherwise', () => {
    expect(readStockView(new URLSearchParams('sort=value')).dir).toBe('desc');
    expect(readStockView(new URLSearchParams('sort=value&dir=asc')).dir).toBe('asc');
    expect(readStockView(new URLSearchParams('sort=name')).dir).toBe('asc');
  });
});

describe('writeStockView', () => {
  it('keeps defaults out of the URL', () => {
    const params = writeStockView(new URLSearchParams(), {view: 'needs_restock', q: ' rice '});
    expect(params.toString()).toBe('q=rice&view=needs_restock');
    expect(writeStockView(params, {view: 'all', q: ''}).toString()).toBe('');
  });

  it('goes back to the first page when anything but the page changes', () => {
    const params = new URLSearchParams('page=3&view=out');
    expect(writeStockView(params, {page: 4}).get('page')).toBe('4');
    expect(writeStockView(params, {view: 'low'}).get('page')).toBeNull();
  });

  it('writes a sort with its direction only when they differ from the default', () => {
    expect(writeStockView(new URLSearchParams(), {sort: 'value'}).toString()).toBe('sort=value');
    expect(writeStockView(new URLSearchParams(), {sort: 'value', dir: 'asc'}).toString()).toBe(
      'sort=value&dir=asc'
    );
    expect(
      writeStockView(new URLSearchParams('sort=value&dir=asc'), {sort: 'urgency'}).toString()
    ).toBe('');
  });
});
