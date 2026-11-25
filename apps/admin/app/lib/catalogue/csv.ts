/** RFC 4180 CSV: quote fields with commas, quotes or line breaks; neutralise spreadsheet formulas. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map(row =>
      row
        .map(cell => {
          if (cell === null || cell === undefined) return '';
          let text = String(cell);
          // A leading =, +, - or @ would run as a formula in a spreadsheet.
          if (typeof cell === 'string' && /^[=+\-@]/.test(text)) text = `'${text}`;
          return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
        })
        .join(',')
    )
    .join('\r\n');
}

/** Saves text as a file the browser downloads. */
export function downloadText(text: string, fileName: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], {type: `${type};charset=utf-8`}));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
