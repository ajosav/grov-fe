import {Download, Eye, EyeOff, X} from 'lucide-react';

import {Button, Checkbox, cn, Label} from '@grov/ui';

export interface ProductsSelectionBarProps {
  /** Products selected on this page. */
  count: number;
  /** Products shown on this page: selection never spans pages. */
  pageCount: number;
  /** The table has its own select-all box in its header; cards and lens need this one. */
  showSelectAll: boolean;
  canManage: boolean;
  busy: boolean;
  onToggleAll: (checked: boolean) => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onExport: () => void;
  onClear: () => void;
  className?: string;
}

/**
 * The row above the products: select all on the left, and once something is
 * selected, its quick actions slide in on the right. It keeps its height, so the
 * list never jumps, and sticks to the top while the list scrolls.
 */
export function ProductsSelectionBar({
  count,
  pageCount,
  showSelectAll,
  canManage,
  busy,
  onToggleAll,
  onPublish,
  onUnpublish,
  onExport,
  onClear,
  className,
}: ProductsSelectionBarProps) {
  const all = pageCount > 0 && count === pageCount;
  const hasSelection = count > 0;

  return (
    <div
      role="region"
      aria-label="Selection"
      className={cn(
        'sticky top-0 z-20 flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface px-4 py-2',
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showSelectAll ? (
          <div className="flex items-center gap-3">
            <Checkbox
              id="products-select-all"
              checked={all ? true : hasSelection ? 'indeterminate' : false}
              onCheckedChange={checked => onToggleAll(checked === true)}
            />
            <Label htmlFor="products-select-all" className="cursor-pointer text-body-sm">
              Select all
            </Label>
          </div>
        ) : null}
        <span aria-live="polite" className="text-body-sm tabular">
          {hasSelection ? (
            <span className="font-semibold">
              {count} of {pageCount} selected
            </span>
          ) : showSelectAll ? null : (
            <span className="text-ink-muted">Select products to act on them together</span>
          )}
        </span>
      </div>

      {hasSelection ? (
        <div
          data-state="open"
          className="anim-pop ml-auto flex flex-wrap items-center justify-end gap-1"
        >
          {canManage ? (
            <>
              <Button size="sm" variant="outline" disabled={busy} onClick={onPublish}>
                <Eye aria-hidden /> Publish
              </Button>
              <Button size="sm" variant="accent" disabled={busy} onClick={onUnpublish}>
                <EyeOff aria-hidden /> Unpublish
              </Button>
            </>
          ) : null}
          <Button size="sm" variant="accent" disabled={busy} onClick={onExport}>
            <Download aria-hidden /> Export
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear}>
            <X aria-hidden /> Clear
          </Button>
        </div>
      ) : null}
    </div>
  );
}
