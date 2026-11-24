import {describe, expect, it} from 'vitest';

import {sanitizeNumber} from './numbers';

describe('sanitizeNumber', () => {
  it('drops everything but digits', () => {
    expect(sanitizeNumber('12abc3')).toBe('123');
    expect(sanitizeNumber('1,000')).toBe('1000');
    expect(sanitizeNumber('abc')).toBe('');
    expect(sanitizeNumber('-5')).toBe('5');
  });

  it('keeps one decimal point and caps the places', () => {
    expect(sanitizeNumber('12a.5b6', 3)).toBe('12.56');
    expect(sanitizeNumber('1.2345', 3)).toBe('1.234');
    expect(sanitizeNumber('1.2.3', 3)).toBe('1.23');
    expect(sanitizeNumber('.5', 3)).toBe('0.5');
  });

  it('stops at a point in a whole-number field', () => {
    expect(sanitizeNumber('1.5')).toBe('1');
  });

  it('caps the whole part', () => {
    expect(sanitizeNumber('1234567890', 3, 9)).toBe('123456789');
    expect(sanitizeNumber('1234567890.5', 3, 9)).toBe('123456789.5');
  });
});
