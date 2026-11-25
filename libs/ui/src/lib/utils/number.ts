/**
 * Keep only what a number field can hold: digits and, when `decimals` > 0, one
 * decimal point with at most that many places. Commas and letters are dropped, so a
 * pasted "1,000" becomes 1000. In a whole-number field the text stops at a point.
 */
export function sanitizeNumber(raw: string, decimals = 0, maxIntegerDigits = 9): string {
  let out = '';
  let integerDigits = 0;
  let decimalDigits = 0;
  let seenPoint = false;
  for (const char of raw) {
    if (char >= '0' && char <= '9') {
      if (seenPoint) {
        if (decimalDigits < decimals) {
          out += char;
          decimalDigits += 1;
        }
      } else if (integerDigits < maxIntegerDigits) {
        out += char;
        integerDigits += 1;
      }
    } else if (char === '.') {
      if (decimals === 0) break;
      if (!seenPoint) {
        seenPoint = true;
        out += out === '' ? '0.' : '.';
      }
    }
  }
  return out;
}
