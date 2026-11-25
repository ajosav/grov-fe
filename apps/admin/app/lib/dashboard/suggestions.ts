import type {CatalogueAnalytics, CatalogueRow} from '@grov/models';
import {formatNaira} from '@grov/ui';

import {productPath} from '../../paths';
import {formatChange, formatCount, formatQty} from '../catalogue/insight-format';

export type SuggestionKind = 'RESTOCK' | 'REVIEW_SALES';

export interface SuggestionEvidence {
  label: string;
  value: string;
}

/**
 * One thing the rules suggest doing, with the numbers behind it (non-negotiable 5: every
 * recommendation shows its inputs). Same shape the `intelligence` module's recommendations will
 * have (doc 38 §4.6), so the server's can replace these without changing the panel.
 */
export interface Suggestion {
  key: string;
  kind: SuggestionKind;
  title: string;
  rationale: string;
  evidence: SuggestionEvidence[];
  /** Where to review it. Nothing is applied from the dashboard. */
  to: string;
}

const MAX_RESTOCK = 3;
const MAX_TOTAL = 5;

function restock(row: CatalogueRow): Suggestion {
  const out = row.stockState === 'OUT';
  const sold = row.qtySold > 0;
  const available = out ? 'None' : formatQty(row.availableQty, row.baseUnit);
  return {
    key: `restock-${row.id}`,
    kind: 'RESTOCK',
    title: `Restock ${row.displayName}`,
    rationale: out
      ? sold
        ? `Out of stock, and it sold ${formatQty(row.qtySold, row.baseUnit)} in ${formatCount(row.orders)} orders this period.`
        : 'Out of stock. It had no sales this period.'
      : `${available} left, and ${formatQty(row.qtySold, row.baseUnit)} sold this period.`,
    evidence: [
      {label: 'Stock', value: out ? 'Out of stock' : 'Low'},
      {label: 'Available', value: available},
      {label: 'Sold this period', value: formatQty(row.qtySold, row.baseUnit)},
      {label: 'Orders this period', value: formatCount(row.orders)},
    ],
    to: productPath(row.id, 'inventory'),
  };
}

function review(row: CatalogueAnalytics['decliners'][number]): Suggestion {
  const change =
    row.previousRevenue.kobo > 0
      ? Math.round(
          ((row.revenue.kobo - row.previousRevenue.kobo) / row.previousRevenue.kobo) * 10_000
        )
      : null;
  return {
    key: `review-${row.productId}`,
    kind: 'REVIEW_SALES',
    title: `Review ${row.displayName}`,
    rationale: `Revenue fell to ${formatNaira(row.revenue.kobo)} from ${formatNaira(row.previousRevenue.kobo)}. Check its stock, price and visibility.`,
    evidence: [
      {label: 'Revenue this period', value: formatNaira(row.revenue.kobo)},
      {label: 'Revenue before', value: formatNaira(row.previousRevenue.kobo)},
      {label: 'Change', value: formatChange(change) ?? '—'},
      {label: 'Orders this period', value: formatCount(row.orders)},
    ],
    to: productPath(row.productId, 'analytics'),
  };
}

/**
 * Suggestions from the catalogue's own numbers: restock what is out or low (best sellers first),
 * then look at what is selling less. Deterministic; AI explanations come with `core/ai` (doc 38 M6).
 */
export function buildSuggestions(input: {
  outOfStock: readonly CatalogueRow[];
  lowStock: readonly CatalogueRow[];
  decliners: readonly CatalogueAnalytics['decliners'][number][];
}): Suggestion[] {
  const bySales = (a: CatalogueRow, b: CatalogueRow) => b.qtySold - a.qtySold;
  const restocks = [...[...input.outOfStock].sort(bySales), ...[...input.lowStock].sort(bySales)]
    .slice(0, MAX_RESTOCK)
    .map(restock);
  const reviews = input.decliners.filter(p => p.previousRevenue.kobo > p.revenue.kobo).map(review);
  return [...restocks, ...reviews].slice(0, MAX_TOTAL);
}
