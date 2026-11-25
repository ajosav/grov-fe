import {MoreHorizontal} from 'lucide-react';
import {Link} from 'react-router';

import type {PriceMarkupValue, StoreListing} from '@grov/models';
import {PERMISSIONS} from '@grov/models';
import {Can} from '@grov/shared';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {formatDay} from '../../../lib/format/dates';
import {formatQty, listingState} from '../../../lib/catalogue/listings';
import {describeMarkup} from '../../../lib/catalogue/markups';
import {productPath} from '../../../paths';
import {ListingStateBadge} from '../listing-badges';

interface ListingsTableProps {
  rows: StoreListing[];
  ownMarkup: (productId: string) => PriceMarkupValue | 'varies' | undefined;
  onEdit: (listing: StoreListing) => void;
  onSetMarkup: (listing: StoreListing) => void;
  onDelist: (listing: StoreListing) => void;
  onResume: (listing: StoreListing) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/** The listing table and its per-row actions. */
export function ListingsTable({
  rows,
  ownMarkup,
  onEdit,
  onSetMarkup,
  onDelist,
  onResume,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ListingsTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Markup</TableHead>
            <TableHead className="hidden md:table-cell">Minimum order</TableHead>
            <TableHead className="hidden lg:table-cell">Updated</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(listing => {
            const state = listingState(listing);
            return (
              <TableRow key={listing.productId}>
                <TableCell>
                  <Link
                    to={productPath(listing.productId)}
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {listing.displayName}
                  </Link>
                  <div className="truncate text-body-sm text-ink-muted">{listing.sku}</div>
                </TableCell>
                <TableCell>
                  <ListingStateBadge listing={listing} />
                </TableCell>
                <TableCell className="hidden text-body-sm tabular md:table-cell">
                  {(() => {
                    const own = ownMarkup(listing.productId);
                    if (own === 'varies') return 'Varies by size';
                    if (own) return describeMarkup(own);
                    return <span className="text-ink-muted">Store-wide</span>;
                  })()}
                </TableCell>
                <TableCell className="hidden text-body-sm tabular md:table-cell">
                  {formatQty(listing.minOrderQty) ?? (
                    <span className="text-ink-muted">None</span>
                  )}
                </TableCell>
                <TableCell className="hidden text-body-sm tabular text-ink-muted lg:table-cell">
                  {formatDay(listing.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Can permission={PERMISSIONS.PRODUCTS.LISTINGS_WRITE}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${listing.displayName}`}
                        >
                          <MoreHorizontal aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {state === 'DELISTED' ? (
                          <DropdownMenuItem onSelect={() => onResume(listing)}>
                            List again
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem onSelect={() => onSetMarkup(listing)}>
                              Set markup
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onEdit(listing)}>
                              {state === 'PAUSED'
                                ? 'Change pause or minimum'
                                : 'Pause or set minimum'}
                            </DropdownMenuItem>
                            {state === 'PAUSED' ? (
                              <DropdownMenuItem onSelect={() => onResume(listing)}>
                                Resume sales
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-danger"
                              onSelect={() => onDelist(listing)}
                            >
                              Delist
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Can>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {hasNextPage ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" loading={isFetchingNextPage} onClick={onLoadMore}>
            Show more
          </Button>
        </div>
      ) : null}
    </>
  );
}
