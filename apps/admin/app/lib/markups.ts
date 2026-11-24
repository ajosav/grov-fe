import type {PriceMarkup, PriceMarkupValue} from '@grov/models';
import {formatNaira} from '@grov/ui';

export type MarkupKind = PriceMarkupValue['kind'];

export const MARKUP_KINDS: Record<MarkupKind, {label: string; hint: string}> = {
  NONE: {label: 'None', hint: 'Shoppers pay the base price.'},
  FIXED: {label: 'Add ₦', hint: 'The same amount on top of the base price.'},
  PERCENT: {label: 'Add %', hint: 'A share of the base price, rounded to the nearest ₦.'},
};

/** grov-be's cap on a percent markup, in basis points (100 bps = 1%). */
export const MAX_PERCENT = 500;

/** What the admin typed: an amount in kobo for ₦, a percent as text for %. */
export interface MarkupDraft {
  kind: MarkupKind;
  amountKobo: number | null;
  percent: string;
}

export const emptyMarkup = (): MarkupDraft => ({kind: 'NONE', amountKobo: null, percent: ''});

/** `12.5` → 1250 basis points. Whole basis points only, so at most two decimals. */
export function percentToBps(text: string): number | null {
  const value = text.trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(value)) return null;
  const bps = Math.round(Number(value) * 100);
  return bps > MAX_PERCENT * 100 ? null : bps;
}

export const bpsToPercent = (bps: number): string => String(bps / 100);

export function toMarkupDraft(value: PriceMarkupValue | undefined): MarkupDraft {
  if (!value || value.kind === 'NONE') return emptyMarkup();
  if (value.kind === 'FIXED') return {kind: 'FIXED', amountKobo: value.amountKobo, percent: ''};
  return {kind: 'PERCENT', amountKobo: null, percent: bpsToPercent(value.percentBps)};
}

/** The problem with a draft, or undefined when it can be sent. */
export function markupError(draft: MarkupDraft): string | undefined {
  if (draft.kind === 'FIXED' && (draft.amountKobo === null || draft.amountKobo <= 0)) {
    return 'Enter an amount above ₦0, or choose None.';
  }
  if (draft.kind === 'PERCENT') {
    const bps = percentToBps(draft.percent);
    if (bps === null || bps <= 0) {
      return `Enter a percent above 0, up to ${MAX_PERCENT}%, with at most 2 decimals.`;
    }
  }
  return undefined;
}

export function toMarkupValue(draft: MarkupDraft): PriceMarkupValue {
  if (draft.kind === 'FIXED') return {kind: 'FIXED', amountKobo: draft.amountKobo ?? 0};
  if (draft.kind === 'PERCENT')
    return {kind: 'PERCENT', percentBps: percentToBps(draft.percent) ?? 0};
  return {kind: 'NONE'};
}

export function describeMarkup(value: PriceMarkupValue | undefined): string {
  if (!value || value.kind === 'NONE') return 'None';
  if (value.kind === 'FIXED') {
    return `${value.amountKobo < 0 ? '−' : '+'}${formatNaira(Math.abs(value.amountKobo))}`;
  }
  return `${value.percentBps < 0 ? '−' : '+'}${bpsToPercent(Math.abs(value.percentBps))}%`;
}

/** The store-wide markup, if one is set. */
export function storeMarkup(markups: readonly PriceMarkup[]): PriceMarkupValue | undefined {
  return markups.find(markup => markup.scope.kind === 'STORE')?.markup;
}

const same = (a: PriceMarkupValue, b: PriceMarkupValue) => JSON.stringify(a) === JSON.stringify(b);

/**
 * A product's own markup: the shared value of its size markups, `'varies'` when its sizes differ,
 * or undefined when it has none (the store's markup applies).
 */
export function productMarkup(
  markups: readonly PriceMarkup[],
  productId: string
): PriceMarkupValue | 'varies' | undefined {
  const own = markups
    .filter(markup => markup.scope.kind === 'SIZE' && markup.scope.productId === productId)
    .map(markup => markup.markup);
  const [first, ...rest] = own;
  if (!first) return undefined;
  return rest.every(value => same(first, value)) ? first : 'varies';
}
