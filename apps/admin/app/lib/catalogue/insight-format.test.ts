import {describe, expect, it} from 'vitest';

import {formatBps, formatChange, formatQty, periodParams, readPeriod} from './insight-format';

describe('insight formats', () => {
  it('shows quantities in the clearer unit', () => {
    expect(formatQty(2500, 'g')).toBe('2.5 kg');
    expect(formatQty(750, 'ml')).toBe('750 ml');
    expect(formatQty(1, 'piece')).toBe('1 piece');
    expect(formatQty(null, 'g')).toBe('—');
  });

  it('shows basis points as percentages and changes with a sign', () => {
    expect(formatBps(1250)).toBe('12.5%');
    expect(formatChange(2049)).toBe('+20%');
    expect(formatChange(-1500)).toBe('−15%');
    expect(formatChange(null)).toBeNull();
  });

  it('leaves the 30-day default to the server and reads custom ranges', () => {
    expect(periodParams({preset: '30d'})).toEqual({});
    expect(periodParams({preset: 'custom', from: '2026-11-01', to: '2026-11-07'})).toEqual({
      from: '2026-11-01',
      to: '2026-11-07',
    });
    expect(readPeriod(new URLSearchParams('period=custom&from=2026-11-01&to=2026-11-07'))).toEqual({
      preset: 'custom',
      from: '2026-11-01',
      to: '2026-11-07',
    });
  });
});
