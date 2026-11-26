import {
  ArrowRightLeft,
  ClipboardCheck,
  Eye,
  MoreHorizontal,
  PackagePlus,
  Shuffle,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import {useNavigate} from 'react-router';

import {PERMISSIONS, type StockOverviewRow} from '@grov/models';
import {usePermissions} from '@grov/shared';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@grov/ui';

import {paths, productPath} from '../../paths';

export type StockActionKind = 'write_off' | 'status_move' | 'settings';

export interface StockAction {
  kind: StockActionKind;
  row: StockOverviewRow;
}

export interface StockRowActionsProps {
  row: StockOverviewRow;
  canWrite: boolean;
  onAction: (action: StockAction) => void;
}

/** What can be done to one product's stock: receive, count, transfer, hold, write off, plan. */
export function StockRowActions({row, canWrite, onAction}: StockRowActionsProps) {
  const navigate = useNavigate();
  const {can} = usePermissions();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.displayName}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => void navigate(productPath(row.productId, 'inventory'))}>
          <Eye aria-hidden /> Open inventory
        </DropdownMenuItem>
        {can(PERMISSIONS.STOCK.RECEIVE) ||
        can(PERMISSIONS.STOCK.COUNT) ||
        can(PERMISSIONS.STOCK.TRANSFER) ||
        canWrite ? (
          <DropdownMenuSeparator />
        ) : null}
        {can(PERMISSIONS.STOCK.RECEIVE) ? (
          <DropdownMenuItem
            onSelect={() => void navigate(`${paths.stockReceipts}?add=${row.productId}`)}
          >
            <PackagePlus aria-hidden /> Receive stock
          </DropdownMenuItem>
        ) : null}
        {can(PERMISSIONS.STOCK.COUNT) ? (
          <DropdownMenuItem
            onSelect={() => void navigate(`${paths.stockCounts}?product=${row.productId}`)}
          >
            <ClipboardCheck aria-hidden /> Count stock
          </DropdownMenuItem>
        ) : null}
        {can(PERMISSIONS.STOCK.TRANSFER) ? (
          <DropdownMenuItem
            onSelect={() => void navigate(`${paths.stockTransfers}?add=${row.productId}`)}
          >
            <ArrowRightLeft aria-hidden /> Transfer to a store
          </DropdownMenuItem>
        ) : null}
        {canWrite ? (
          <>
            <DropdownMenuItem onSelect={() => onAction({kind: 'status_move', row})}>
              <Shuffle aria-hidden /> Hold or reclassify
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAction({kind: 'write_off', row})}>
              <Trash2 aria-hidden /> Write off
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onAction({kind: 'settings', row})}>
              <SlidersHorizontal aria-hidden /> Planning settings
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
