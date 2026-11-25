import {describe, expect, it} from 'vitest';

import {greetingFor, todayLabel} from './greeting';

describe('greetingFor', () => {
  it('follows Lagos time, not the browser’s', () => {
    // 22:30 UTC is 23:30 in Lagos.
    expect(greetingFor(new Date('2026-11-25T22:30:00Z'))).toBe('Good evening');
    // 06:59 UTC is 07:59 in Lagos.
    expect(greetingFor(new Date('2026-11-25T06:59:00Z'))).toBe('Good morning');
  });

  it('switches at 12:00 and 17:00', () => {
    expect(greetingFor(new Date('2026-11-25T10:59:00Z'))).toBe('Good morning');
    expect(greetingFor(new Date('2026-11-25T11:00:00Z'))).toBe('Good afternoon');
    expect(greetingFor(new Date('2026-11-25T15:59:00Z'))).toBe('Good afternoon');
    expect(greetingFor(new Date('2026-11-25T16:00:00Z'))).toBe('Good evening');
  });
});

describe('todayLabel', () => {
  it('names the weekday and writes the date DD/MM/YYYY', () => {
    expect(todayLabel(new Date('2026-11-25T12:00:00Z'))).toBe('Wednesday 25/11/2026');
  });

  it('rolls over at Lagos midnight', () => {
    expect(todayLabel(new Date('2026-11-25T23:30:00Z'))).toBe('Thursday 26/11/2026');
  });
});
