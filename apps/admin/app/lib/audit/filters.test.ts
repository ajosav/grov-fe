import {describe, expect, it} from 'vitest';

import {
  formatFilter,
  parseFilter,
  personOf,
  readFilters,
  withPerson,
  writeFilters,
} from './filters';

describe('audit filters', () => {
  it('round-trips through the URL', () => {
    const params = new URLSearchParams();
    writeFilters(params, [
      {field: 'kind', op: 'not', value: 'delete'},
      {field: 'entityId', op: 'is', value: 'a:b'},
    ]);
    expect(params.getAll('f')).toEqual(['kind:not:delete', 'entityId:is:a:b']);
    expect(readFilters(params)).toHaveLength(2);
  });

  it('drops filters an edited URL made up', () => {
    expect(parseFilter('colour:is:red')).toBeNull();
    expect(parseFilter('kind:like:create')).toBeNull();
    expect(parseFilter('kind:is:')).toBeNull();
    expect(parseFilter('kind')).toBeNull();
    expect(formatFilter({field: 'store', op: 'is', value: 'x'})).toBe('store:is:x');
  });
});

describe('person filter', () => {
  it('narrows to one person and replaces the earlier choice', () => {
    const kind = {field: 'kind', op: 'not', value: 'delete'} as const;
    const first = withPerson([kind], 'u1');
    expect(first).toEqual([kind, {field: 'actor', op: 'is', value: 'u1'}]);
    expect(personOf(withPerson(first, 'u2'))).toBe('u2');
    expect(withPerson(first, null)).toEqual([kind]);
    expect(personOf([{field: 'actor', op: 'not', value: 'u1'}])).toBeNull();
  });
});
