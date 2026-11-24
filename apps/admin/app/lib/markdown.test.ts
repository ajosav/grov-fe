import {describe, expect, it} from 'vitest';

import {insertLink, markdownProblem, toggleList, wrapSelection} from './markdown';

describe('markdownProblem', () => {
  it('accepts plain text and the allowed Markdown', () => {
    expect(
      markdownProblem('Sold **by the bag**, *not* loose.\n\n- Stone-free\n- Ready')
    ).toBeUndefined();
    expect(markdownProblem('[how](https://grov.example/x) and 5 > 3')).toBeUndefined();
  });

  it('refuses HTML, images, headings, code, quotes, tables and odd links', () => {
    for (const bad of [
      '<b>x</b>',
      '![a](https://x/y.png)',
      '# Title',
      '```\nx\n```',
      '> q',
      '| a | b |',
      '[x](javascript:alert(1))',
    ]) {
      expect(markdownProblem(bad)).toBeDefined();
    }
  });
});

describe('wrapSelection', () => {
  it('wraps the selection and keeps it selected', () => {
    expect(wrapSelection('big bag', 4, 7, '**', 'bold')).toEqual({
      text: 'big **bag**',
      start: 6,
      end: 9,
    });
  });

  it('uses a placeholder with nothing selected, and unwraps when already wrapped', () => {
    expect(wrapSelection('', 0, 0, '*', 'italic')).toEqual({text: '*italic*', start: 1, end: 7});
    expect(wrapSelection('big **bag**', 6, 9, '**', 'bold')).toEqual({
      text: 'big bag',
      start: 4,
      end: 7,
    });
  });
});

describe('toggleList', () => {
  it('lists the lines the selection touches, and unlists them again', () => {
    const listed = toggleList('one\ntwo\nthree', 0, 7, false);
    expect(listed.text).toBe('- one\n- two\nthree');
    expect(toggleList(listed.text, listed.start, listed.end, false).text).toBe('one\ntwo\nthree');
  });

  it('numbers an ordered list', () => {
    expect(toggleList('one\ntwo', 0, 7, true).text).toBe('1. one\n2. two');
  });
});

describe('insertLink', () => {
  it('wraps the selection and selects the address', () => {
    const edit = insertLink('see sourcing now', 4, 12);
    expect(edit.text).toBe('see [sourcing](https://) now');
    expect(edit.text.slice(edit.start, edit.end)).toBe('https://');
  });
});
