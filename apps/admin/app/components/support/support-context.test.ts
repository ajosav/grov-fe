import {describe, expect, it} from 'vitest';

import {sampleConversations} from './sample-conversations';
import {customerConversations, filterInbox, otherOpen} from './support-context';

const now = Date.parse('2026-11-24T10:00:00Z');

describe('support inbox helpers', () => {
  const list = sampleConversations(now);
  const byId = (id: string) => {
    const found = list.find(c => c.id === id);
    if (!found) throw new Error(id);
    return found;
  };

  it('finds the same customer’s other open conversations', () => {
    expect(otherOpen(list, byId('c1')).map(c => c.number)).toEqual(['S-1043']);
    expect(otherOpen(list, byId('c2'))).toEqual([]);
  });

  it('lists a customer’s history open first, then newest first', () => {
    expect(customerConversations(list, 'u-ngozi').map(c => c.number)).toEqual([
      'S-1043',
      'S-1042',
      'S-0988',
    ]);
  });

  it('keeps conversations resolved over a week ago out of the inbox', () => {
    const numbers = filterInbox(list, 'all', 'Joshua', now).map(c => c.number);
    expect(numbers).toContain('S-1029');
    expect(numbers).not.toContain('S-0988');
  });

  it('hides merged conversations from the inbox but keeps them in history', () => {
    const merged = list.map(c => (c.id === 'c6' ? {...c, mergedIntoId: 'c1'} : c));
    expect(filterInbox(merged, 'all', 'Joshua', now).some(c => c.id === 'c6')).toBe(false);
    expect(customerConversations(merged, 'u-ngozi').at(-1)?.number).toBe('S-1043');
    expect(otherOpen(merged, byId('c1'))).toEqual([]);
  });
});
