import {BarChart3, Eye, MoreHorizontal, Pencil, Tag} from 'lucide-react';
import {useNavigate} from 'react-router';

import type {CatalogueRow} from '@grov/models';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@grov/ui';

import {productPath} from '../../../paths';
import type {CatalogueLayoutProps} from './products-cells';

export interface ProductRowActionsProps extends Pick<
  CatalogueLayoutProps,
  'canManage' | 'onPublish'
> {
  row: CatalogueRow;
}

/** Quick access to the workspace tabs and publishing. */
export function ProductRowActions({row, canManage, onPublish}: ProductRowActionsProps) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.displayName}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => void navigate(productPath(row.id))}>
          <Eye aria-hidden /> Open workspace
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void navigate(productPath(row.id, 'analytics'))}>
          <BarChart3 aria-hidden /> Analytics
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void navigate(productPath(row.id, 'pricing'))}>
          <Tag aria-hidden /> Pricing
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void navigate(productPath(row.id, 'information'))}>
          <Pencil aria-hidden /> {canManage ? 'Edit product' : 'Product information'}
        </DropdownMenuItem>
        {canManage ? <DropdownMenuSeparator /> : null}
        {canManage ? (
          row.active ? (
            <DropdownMenuItem onSelect={() => onPublish(row, false)}>Unpublish</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onSelect={() => onPublish(row, true)}>Publish</DropdownMenuItem>
          )
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
