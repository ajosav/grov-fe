import {describe, expect, it} from 'vitest';

import {auditRange, readAuditPeriod, writeAuditPeriod} from './range';

describe('audit period', () => {
  it('opens on the last 7 days', () => {
    expect(readAuditPeriod(new URLSearchParams())).toEqual({preset: '7d'});
    expect(readAuditPeriod(new URLSearchParams('period=90d'))).toEqual({preset: '90d'});
    expect(readAuditPeriod(new URLSearchParams('period=nonsense'))).toEqual({preset: '7d'});
  });

  it('keeps the default out of the URL', () => {
    const params = new URLSearchParams('period=30d');
    writeAuditPeriod(params, {preset: '7d'});
    expect(params.has('period')).toBe(false);
    writeAuditPeriod(params, {preset: 'custom', from: '2026-11-01', to: '2026-11-07'});
    expect(params.toString()).toBe('period=custom&from=2026-11-01&to=2026-11-07');
  });

  it('starts presets at the beginning of a Lagos day', () => {
    // 00:30 in Lagos on the 25th is still the 24th in UTC.
    const anchor = new Date('2026-11-24T23:30:00.000Z');
    expect(auditRange({preset: 'today'}, anchor)).toEqual({
      from: '2026-11-24T23:00:00.000Z',
      to: '2026-11-24T23:30:00.000Z',
    });
    expect(auditRange({preset: '7d'}, anchor).from).toBe('2026-11-18T23:00:00.000Z');
  });

  it('ends a custom range at the end of its last Lagos day', () => {
    expect(
      auditRange({preset: 'custom', from: '2026-11-01', to: '2026-11-07'}, new Date())
    ).toEqual({from: '2026-10-31T23:00:00.000Z', to: '2026-11-07T22:59:59.999Z'});
  });
});
