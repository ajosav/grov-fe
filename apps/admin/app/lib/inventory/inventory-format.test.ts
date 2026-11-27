import {describe, expect, it} from 'vitest';

import {costText, dayText, qtyText, TRANSFER_STATUS} from './inventory-format';

describe('inventory format', () => {
  it('shows decimal-string quantities in the unit people say', () => {
    expect(qtyText('12500.000', 'g')).toBe('12.5 kg');
    expect(qtyText('250.000', 'g')).toBe('250 g');
    expect(qtyText('1.000', 'pcs')).toBe('1 piece');
    expect(qtyText(null, 'g')).toBe('—');
    expect(qtyText('abc', 'g')).toBe('—');
  });

  it('hides cost when the API sends null', () => {
    expect(costText(null)).toBe('—');
    expect(costText({kobo: 1_850_000, currency: 'NGN'})).toBe('₦18,500');
  });

  it('shows no date for a missing instant', () => {
    expect(dayText(null)).toBe('—');
  });

  it('labels every transfer status', () => {
    for (const status of Object.keys(TRANSFER_STATUS)) {
      expect(TRANSFER_STATUS[status as keyof typeof TRANSFER_STATUS].label).not.toBe('');
    }
  });
});
