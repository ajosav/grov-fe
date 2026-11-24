import {Link} from 'react-router';

import type {Category, ProductSummary} from '@grov/models';
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@grov/ui';

import {categoryPath} from '../../../lib/catalogue/categories';
import {formatDay} from '../../../lib/format/dates';
import {productPath} from '../../../paths';
import {ActiveBadge} from '../category-badges';
import {ProductThumb} from '../product-thumb';

interface ProductsTableProps {
  rows: ProductSummary[];
  categories: readonly Category[];
  coverFor: (path: string | undefined) => string | undefined;
  onOpen: (productId: string) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

/** The product master table; the row is a bigger click target than its name link. */
export function ProductsTable({
  rows,
  categories,
  coverFor,
  onOpen,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: ProductsTableProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Sold at</TableHead>
            <TableHead className="hidden lg:table-cell">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(product => (
            <TableRow
              key={product.id}
              className="cursor-pointer"
              onClick={event => {
                // The name is the real link; the row is a bigger target for mouse users.
                if ((event.target as HTMLElement).closest('a')) return;
                onOpen(product.id);
              }}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <ProductThumb url={coverFor(product.imagePaths[0])} name={product.displayName} />
                  <div className="min-w-0">
                    <Link
                      to={productPath(product.id)}
                      className="font-semibold text-ink underline-offset-4 hover:underline"
                    >
                      {product.displayName}
                    </Link>
                    <div className="truncate text-body-sm text-ink-muted">
                      {product.sku}
                      {product.brand ? ` · ${product.brand}` : ''}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-body-sm">
                {categoryPath(product.categoryId, categories) ?? '—'}
              </TableCell>
              <TableCell>
                <ActiveBadge active={product.active} draft={product.draft} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {product.availableAtAllStores ? (
                  <Badge tone="sky">All stores</Badge>
                ) : (
                  <span className="text-body-sm text-ink-muted">Per store</span>
                )}
              </TableCell>
              <TableCell className="hidden text-body-sm tabular text-ink-muted lg:table-cell">
                {formatDay(product.createdAt)}
              </TableCell>
            </TableRow>
          ))}
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
