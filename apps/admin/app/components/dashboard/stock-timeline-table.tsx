import {Link} from 'react-router';

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@grov/ui';

import {formatQty} from '../../lib/catalogue/insight-format';
import {formatDaysLeft, type StockCover} from '../../lib/dashboard/stock-timeline';
import {productPath} from '../../paths';
import {CoverBadge} from './stock-cover-bar';

/** Every product that can be timed, soonest to run out first. */
export function StockTimelineTable({
  covers,
  periodDays,
}: {
  covers: StockCover[];
  periodDays: number | undefined;
}) {
  if (covers.length === 0) {
    return (
      <p className="text-body-sm text-ink-muted">
        Nothing to time yet. Products show here once stores count them and they sell.
      </p>
    );
  }
  return (
    <div className="grid gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Sells per day</TableHead>
            <TableHead>Lasts</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {covers.map(cover => (
            <TableRow key={cover.id}>
              <TableCell className="font-semibold">
                <Link
                  to={productPath(cover.id, 'inventory')}
                  className="underline-offset-4 hover:underline"
                >
                  {cover.name}
                </Link>
              </TableCell>
              <TableCell className="tabular">
                {formatQty(cover.available, cover.baseUnit)}
              </TableCell>
              <TableCell className="tabular text-ink-muted">
                {formatQty(cover.perDay, cover.baseUnit)}
              </TableCell>
              <TableCell className="tabular">{formatDaysLeft(cover.daysLeft)}</TableCell>
              <TableCell>
                <CoverBadge status={cover.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-body-sm text-ink-muted">
        Lasts = available stock ÷ average daily sales
        {periodDays ? ` over the last ${periodDays} days` : ''}. Change the period or store on the
        dashboard to re-time it. Order lead time isn’t set yet, so leave extra.
      </p>
    </div>
  );
}
