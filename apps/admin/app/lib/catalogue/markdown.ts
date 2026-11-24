const RULES: readonly {test: RegExp; message: string}[] = [
  {
    test: /<\/?[a-z][^>]*>/i,
    message: 'HTML isn’t allowed. Use the toolbar: bold, italic, lists, links.',
  },
  {
    test: /!\[[^\]]*\]\([^)]*\)/,
    message: 'Images aren’t allowed here. Add photos on the Photos tab.',
  },
  {test: /^ {0,3}#{1,6}(\s|$)/m, message: 'Headings aren’t allowed. Use bold for emphasis.'},
  {test: /^ {0,3}(```|~~~)/m, message: 'Code blocks aren’t allowed.'},
  {test: /^ {0,3}>/m, message: 'Quotes aren’t allowed.'},
  {test: /^ {0,3}\|.*\|\s*$/m, message: 'Tables aren’t allowed. Use a list.'},
  {
    test: /\]\(\s*(?!https?:\/\/|mailto:|tel:)[^)\s]*\)/i,
    message: 'Links must start with https://.',
  },
];

export function markdownProblem(text: string): string | undefined {
  return RULES.find(rule => rule.test.test(text))?.message;
}

export interface Edit {
  text: string;
  start: number;
  end: number;
}

export function wrapSelection(
  text: string,
  start: number,
  end: number,
  mark: string,
  placeholder: string
): Edit {
  const before = text.slice(0, start);
  const selected = text.slice(start, end) || placeholder;
  const after = text.slice(end);
  if (before.endsWith(mark) && after.startsWith(mark)) {
    const cut = before.length - mark.length;
    return {
      text: before.slice(0, cut) + selected + after.slice(mark.length),
      start: cut,
      end: cut + selected.length,
    };
  }
  return {
    text: before + mark + selected + mark + after,
    start: start + mark.length,
    end: start + mark.length + selected.length,
  };
}

/** Turn every line the selection touches into list items (`- ` or `1. `), or back to plain lines. */
export function toggleList(text: string, start: number, end: number, ordered: boolean): Edit {
  const from = text.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = text.indexOf('\n', end);
  const to = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(from, to).split('\n');
  const marker = /^(?:[-*] |\d+\. )/;
  const allListed = lines.every(line => marker.test(line));
  const next = lines.map((line, index) =>
    allListed
      ? line.replace(marker, '')
      : `${ordered ? `${index + 1}. ` : '- '}${line.replace(marker, '')}`
  );
  const body = next.join('\n');
  return {text: text.slice(0, from) + body + text.slice(to), start: from, end: from + body.length};
}

/** Make the selection a link; the address is selected so it can be typed over. */
export function insertLink(text: string, start: number, end: number): Edit {
  const label = text.slice(start, end) || 'link text';
  const url = 'https://';
  const link = `[${label}](${url})`;
  const urlStart = start + label.length + 3;
  return {
    text: text.slice(0, start) + link + text.slice(end),
    start: urlStart,
    end: urlStart + url.length,
  };
}
