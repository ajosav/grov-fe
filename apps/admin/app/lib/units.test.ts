import {describe, expect, it} from 'vitest';

import {
  entryUnits,
  formatAmount,
  fromBaseAmount,
  isBaseUnit,
  pickEntryUnit,
  toBaseAmount,
  unitNoun,
  unitShort,
} from './units';

describe('units', () => {
  it('says weights and volumes the way people do', () => {
    expect(formatAmount('1000', 'g')).toBe('1 kg');
    expect(formatAmount('50000', 'g')).toBe('50 kg');
    expect(formatAmount('2500', 'g')).toBe('2.5 kg');
    expect(formatAmount('250', 'g')).toBe('250 g');
    expect(formatAmount('1000.000', 'ml')).toBe('1 l');
    expect(formatAmount('750', 'ml')).toBe('750 ml');
  });

  it('counts pieces', () => {
    expect(formatAmount('1', 'piece')).toBe('1 piece');
    expect(formatAmount('30', 'piece')).toBe('30 pieces');
  });

  it('returns null for nothing to show and keeps unknown units as they are', () => {
    expect(formatAmount('', 'g')).toBeNull();
    expect(formatAmount(null, 'g')).toBeNull();
    expect(formatAmount('abc', 'g')).toBeNull();
    expect(formatAmount('3', 'bunch')).toBe('3 bunch');
  });

  it('knows the base units', () => {
    expect(isBaseUnit('ml')).toBe(true);
    expect(isBaseUnit('kg')).toBe(false);
    expect(unitNoun('piece')).toBe('pieces');
    expect(unitShort('g')).toBe('g');
  });

  it('turns what is typed into the base unit and back', () => {
    expect(toBaseAmount('4', 1000)).toBe('4000');
    expect(toBaseAmount('2.5', 1000)).toBe('2500');
    expect(toBaseAmount('0.001', 1000)).toBe('1');
    expect(toBaseAmount('750', 1)).toBe('750');
    expect(toBaseAmount('2.', 1000)).toBe('2000');
    expect(toBaseAmount('', 1000)).toBe('');
    expect(fromBaseAmount('4000', 1000)).toBe('4');
    expect(fromBaseAmount('2500.000', 1000)).toBe('2.5');
    expect(fromBaseAmount('', 1000)).toBe('');
    expect(fromBaseAmount('1.5', 1000)).toBeNull();
  });

  it('picks the unit an amount is naturally said in', () => {
    expect(pickEntryUnit('g', '2500').code).toBe('kg');
    expect(pickEntryUnit('g', '250').code).toBe('g');
    expect(pickEntryUnit('ml', '4000').code).toBe('l');
    expect(pickEntryUnit('ml', '750').code).toBe('ml');
    expect(pickEntryUnit('g', '').code).toBe('kg');
    expect(pickEntryUnit('piece', '30').code).toBe('piece');
    expect(pickEntryUnit('piece', '24').code).toBe('dozen');
    expect(pickEntryUnit('piece', '').code).toBe('piece');
    expect(entryUnits('bunch')).toEqual([{code: 'bunch', short: 'bunch', factor: 1}]);
  });
});
