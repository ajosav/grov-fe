import {describe, expect, it} from 'vitest';

import {toCsv} from './csv';

describe('toCsv', () => {
  it('quotes what needs quoting and leaves the rest', () => {
    expect(toCsv([['a', 'b,c', 'say "hi"', null, 3]])).toBe('a,"b,c","say ""hi""",,3');
  });

  it('defuses spreadsheet formulas in text', () => {
    expect(toCsv([['=SUM(A1)', '-5', 7]])).toBe("'=SUM(A1),'-5,7");
  });
});
