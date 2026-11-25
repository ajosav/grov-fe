import {describe, expect, it} from 'vitest';

import {replyTo} from './replies';

describe('replyTo', () => {
  it('says AI is off and never answers with a number', () => {
    const reply = replyTo('How did sales do this week?');
    expect(reply.text).toContain('AI isn’t switched on');
    expect(reply.text).not.toMatch(/₦|\d/);
  });

  it.each([
    ['How did sales do this week?', '/catalogue/analytics'],
    ['What should I restock?', '/catalogue/products?view=low_stock'],
    ['Which products are selling less?', '/catalogue/products?view=declining'],
    ['Which products have thin margins?', '/catalogue/products?profitability=thin'],
    ['Why did commodity prices move?', '/catalogue/intelligence'],
  ])('points "%s" to %s', (question, to) => {
    expect(replyTo(question).link.to).toBe(to);
  });

  it('falls back to analytics for anything else', () => {
    expect(replyTo('hello there').link.to).toBe('/catalogue/analytics');
  });
});
