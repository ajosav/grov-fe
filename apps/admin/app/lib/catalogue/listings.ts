import type {StoreListing} from '@grov/models';

export type ListingState = 'ACTIVE' | 'PAUSED' | 'DELISTED';

export function listingState(
  listing: Pick<StoreListing, 'active' | 'pausedUntil'>,
  now: Date = new Date()
): ListingState {
  if (!listing.active) return 'DELISTED';
  if (listing.pausedUntil && new Date(listing.pausedUntil).getTime() > now.getTime()) {
    return 'PAUSED';
  }
  return 'ACTIVE';
}

export function pauseUntilDay(day: Date): string {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString();
}

/** The earliest day a pause can end: tomorrow. A pause that ends today is no pause. */
export function earliestResumeDay(now: Date = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

/** "2.000" → "2", "0.500" → "0.5". The API stores three decimals. */
export function formatQty(quantity: string | null): string | null {
  if (quantity === null) return null;
  if (!quantity.includes('.')) return quantity;
  return quantity.replace(/0+$/, '').replace(/\.$/, '');
}

/** Body that keeps a listing as it is but selling: used by Resume and List again. */
export function sellingBody(listing: Pick<StoreListing, 'minOrderQty'>) {
  return {active: true, pausedUntil: null, minOrderQty: listing.minOrderQty};
}
