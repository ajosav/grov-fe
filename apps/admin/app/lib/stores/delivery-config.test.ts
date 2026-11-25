import {describe, expect, it} from 'vitest';

import {draftErrors, formatConfigValue, formatDays, toDraft, toPatch} from './delivery-config';

describe('formatDays', () => {
  it('joins runs of three or more with a dash', () => {
    expect(formatDays(['SAT'])).toBe('Sat');
    expect(formatDays(['MON', 'TUE', 'WED', 'THU', 'FRI'])).toBe('Mon–Fri');
    expect(formatDays(['SAT', 'SUN'])).toBe('Sat, Sun');
    expect(formatDays(['SUN', 'MON', 'WED', 'THU', 'FRI'])).toBe('Mon, Wed–Fri, Sun');
    expect(formatDays(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])).toBe('Every day');
  });
});

describe('formatConfigValue', () => {
  it('describes each setting in a line', () => {
    expect(formatConfigValue('leadDays', 0)).toBe('Same day');
    expect(formatConfigValue('leadDays', 2)).toBe('2 days');
    expect(formatConfigValue('editCutoff', {daysBefore: 2, time: '18:00'})).toBe(
      '2 days before, 18:00'
    );
    expect(formatConfigValue('deliveryFee', {kobo: 50_000, currency: 'NGN'}, 'PER_KM')).toBe(
      '₦500 per km'
    );
    expect(formatConfigValue('minBasket', {kobo: 0, currency: 'NGN'})).toBe('No minimum');
  });
});

describe('drafts', () => {
  it('round-trips only the settings set here', () => {
    const patch = {leadDays: 3, deliveryDays: ['WED' as const, 'SAT' as const]};
    const draft = toDraft(patch, {leadDays: 1});
    expect(draft.leadDays).toEqual({set: true, value: 3});
    expect(draft.minBasket.set).toBe(false);
    expect(toPatch(draft)).toEqual(patch);
  });

  it('starts unset fields from what applies today', () => {
    const draft = toDraft({}, {deliveryWindow: {start: '10:00', end: '16:00'}});
    expect(draft.deliveryWindow).toEqual({set: false, value: {start: '10:00', end: '16:00'}});
  });

  it('flags what the API would reject', () => {
    const draft = toDraft({
      deliveryDays: [],
      deliveryWindow: {start: '18:00', end: '09:00'},
      leadDays: 20,
    });
    expect(draftErrors(draft)).toEqual({
      deliveryDays: 'Pick at least one day',
      deliveryWindow: 'The window must end after it starts',
      leadDays: 'Use 0 to 14 days',
    });
    expect(draftErrors(toDraft({}))).toEqual({});
  });
});
