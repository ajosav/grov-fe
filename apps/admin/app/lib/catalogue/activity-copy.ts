import type {ActivityItem} from '@grov/models';
import {formatNaira} from '@grov/ui';

import {formatDay} from '../format/dates';
import {formatQty} from './insight-format';

const FIELD_LABEL: Record<string, string> = {
  displayName: 'Name',
  brand: 'Brand',
  categoryId: 'Category',
  baseUnit: 'Counted in',
  active: 'Published',
  draft: 'Draft',
  availableAtAllStores: 'Sold at every store',
  description: 'Description',
  storageNote: 'Storage note',
  originNote: 'Origin',
  grade: 'Grade',
  qualityTier: 'Quality tier',
  tags: 'Tags',
  imagePaths: 'Photos',
  sizes: 'Sizes',
  prepOptions: 'Prep options',
};

const STOCK_LABEL: Record<string, string> = {
  'stock.RECEIPT': 'Stock received',
  'stock.ADJUSTMENT': 'Stock count corrected',
  'stock.WRITE_OFF': 'Stock written off',
  'stock.TRANSFER_IN': 'Stock transferred in',
  'stock.TRANSFER_OUT': 'Stock transferred out',
};

function str(value: string | number | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

/** A sentence for each event, from its action code and details. */
export function activityTitle(item: ActivityItem): string {
  const d = item.details;
  switch (item.action) {
    case 'products.product.created':
    case 'products.product.created_from_food':
      return 'Product created';
    case 'products.product.updated':
      return 'Product information updated';
    case 'products.product.sizes_replaced':
      return 'Sizes and prices updated';
    case 'products.product.prep_options_replaced':
      return 'Prep options updated';
    case 'products.listing.put':
      return `${d.active === 'false' ? 'Paused or unlisted' : 'Listed'} at ${str(d.storeName) || 'a store'}${d.pausedUntil ? ` (paused until ${formatDay(str(d.pausedUntil))})` : ''}`;
    case 'products.listing.delisted':
      return `Delisted at ${str(d.storeName) || 'a store'}`;
    case 'price.set':
      return `Base price set for ${str(d.sizeLabel)}: ${formatNaira(Number(d.priceKobo ?? 0))}`;
    default:
      if (item.action.startsWith('stock.')) {
        return `${STOCK_LABEL[item.action] ?? 'Stock movement'} at ${str(d.storeName)}: ${formatQty(Number(d.qty ?? 0), item.baseUnit)}`;
      }
      return item.action;
  }
}

/** A changed value as people read it. */
export function changeValue(field: string, value: string | null) {
  if (value === null) return '—';
  if (field.startsWith('price:')) return formatNaira(Number(value));
  // Audit snapshots keep category ids; the product page shows the current name.
  if (field === 'categoryId') return 'Moved';
  if (value === 'true') return 'Yes';
  if (value === 'false') return 'No';
  return value;
}

/** The label of a changed field. */
export function changeLabel(field: string) {
  return field.startsWith('price:') ? `Price, ${field.slice(6)}` : (FIELD_LABEL[field] ?? field);
}
