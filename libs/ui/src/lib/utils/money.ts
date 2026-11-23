/**
 * Money is integer kobo everywhere (DS4); the server computes every total.
 * Display: `₦184,500`, a true minus `−₦1,200`, kobo only when asked for.
 */
const MINUS = '−';

export interface FormatNairaOptions {
  /** Show kobo (exact charges and refunds only). */
  showKobo?: boolean;
  /** Prefix `+` on positive amounts (e.g. a refund line). */
  signed?: boolean;
}

export function formatNaira(kobo: number, options: FormatNairaOptions = {}): string {
  if (!Number.isFinite(kobo)) return '₦—';
  const negative = kobo < 0;
  const abs = Math.abs(Math.round(kobo));
  const naira = options.showKobo ? abs / 100 : Math.round(abs / 100);
  const text = naira.toLocaleString('en-NG', {
    minimumFractionDigits: options.showKobo ? 2 : 0,
    maximumFractionDigits: options.showKobo ? 2 : 0,
  });
  const sign = negative ? MINUS : options.signed && abs > 0 ? '+' : '';
  return `${sign}₦${text}`;
}
