import {Download, Eye, EyeOff, X} from 'lucide-react';

import {Button} from '@grov/ui';

export interface ProductsBulkBarProps {
  count: number;
  canManage: boolean;
  busy: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onExport: () => void;
  onClear: () => void;
}

/** Actions on the selected products. Publishing needs products.manage. */
export function ProductsBulkBar({
  count,
  canManage,
  busy,
  onPublish,
  onUnpublish,
  onExport,
  onClear,
}: ProductsBulkBarProps) {
  if (count === 0) return null;
  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky top-2 z-20 mx-3 mt-3 flex flex-wrap items-center gap-2 rounded-md border border-line bg-night p-2 pl-4 text-on-night shadow-raised"
    >
      <span className="mr-2 text-body-sm font-semibold tabular">{count} selected</span>
      {canManage ? (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="text-on-night hover:bg-night-hi"
            disabled={busy}
            onClick={onPublish}
          >
            <Eye aria-hidden /> Publish
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-on-night hover:bg-night-hi"
            disabled={busy}
            onClick={onUnpublish}
          >
            <EyeOff aria-hidden /> Unpublish
          </Button>
        </>
      ) : null}
      <Button
        size="sm"
        variant="ghost"
        className="text-on-night hover:bg-night-hi"
        disabled={busy}
        onClick={onExport}
      >
        <Download aria-hidden /> Export selected
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        className="ml-auto text-on-night hover:bg-night-hi"
        aria-label="Clear selection"
        onClick={onClear}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}
