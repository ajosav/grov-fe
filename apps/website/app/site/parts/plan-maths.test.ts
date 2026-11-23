import {canStep, computePlan, maxDrops} from './plan-maths';
import {nationalDigits} from './waitlist';

describe('sample plan maths (unchanged from the original page)', () => {
  it('reproduces the headline sample: family of 5, a month, 4 drops', () => {
    const plan = computePlan({ad: 2, te: 1, ki: 2, li: 0}, 4, 4, 160_000);
    expect(plan.food).toBe(168_500);
    expect(plan.total).toBe(184_500);
    expect(plan.budget).toEqual({kind: 'above', difference: 24_500, budget: 160_000});
    expect(plan.drops.reduce((sum, d) => sum + d.amount, 0)).toBe(plan.total);
  });

  it('limits drops by period and keeps someone 13+ in the house', () => {
    expect([maxDrops(1), maxDrops(2), maxDrops(4)]).toEqual([1, 2, 4]);
    expect(canStep({ad: 1, te: 0, ki: 0, li: 0}, 'ad', -1)).toBe(false);
    expect(canStep({ad: 8, te: 0, ki: 0, li: 0}, 'ad', 1)).toBe(false);
  });
});

describe('waitlist phone', () => {
  it.each(['0803 123 4567', '+234 803 123 4567', '8031234567'])('accepts %s', input => {
    expect(nationalDigits(input)).toBe('8031234567');
  });
  it('rejects non-mobile numbers', () => {
    expect(nationalDigits('0123')).toBeNull();
  });
});
