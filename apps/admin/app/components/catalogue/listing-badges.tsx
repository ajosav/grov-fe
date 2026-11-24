import type {StoreListing} from '@grov/models';
import {Badge} from '@grov/ui';

import {formatMoment} from '../../lib/dates';
import {listingState} from '../../lib/listings';

/** Selling, Paused until a date, or Delisted. Paused and delisted products can't be bought. */
export function ListingStateBadge({
  listing,
}: {
  listing: Pick<StoreListing, 'active' | 'pausedUntil'>;
}) {
  const state = listingState(listing);
  if (state === 'DELISTED') return <Badge tone="neutral">Delisted</Badge>;
  if (state === 'PAUSED') {
    return (
      <div className="grid gap-0.5">
        <Badge tone="palm" className="w-fit">
          Paused
        </Badge>
        <span className="text-body-sm tabular text-ink-muted">
          until {formatMoment(listing.pausedUntil ?? '')}
        </span>
      </div>
    );
  }
  return <Badge tone="leaf">Selling</Badge>;
}
