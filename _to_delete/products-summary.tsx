import type {ReactNode} from 'react';

import {
  AlertTriangle,
  CircleSlash,
  FilePen,
  Layers,
  PackageCheck,
  PackageMinus,
} from 'lucide-react';

import type {CatalogueSummary} from '@grov/models';
import {cn, Skeleton} from '@grov/ui';

import type {CatalogueState} from '../../../lib/catalogue/catalogue-view';
import {formatCount} from '../../../lib/catalogue/insight-format';
import {Panel} from '../../common/panel';
import type {StatTone} from '../../common/stat-strip';

export interface ProductsSummaryProps {
  summary: CatalogueSummary | undefined;
  loading: boolean;
  state: CatalogueState;
  onPick: (patch: Partial<CatalogueState>) => void;
  className?: string;
}

const CHIP: Record<StatTone, string> = {
  flame: 'bg-flame-tint text-flame-strong',
  sky: 'bg-sky-tint text-sky-strong',
  palm: 'bg-palm-tint text-palm-strong',
  leaf: 'bg-leaf-tint text-leaf-strong',
  neutral: 'bg-surface-sunken text-ink-muted',
};

interface Tile {
  key: string;
  label: string;
  value: string;
  icon: ReactNode;
  tone: StatTone;
  hint?: string;
  patch: Partial<CatalogueState>;
  selected: boolean;
}

/** Catalogue counts as a side-rail card; each tile filters the list to what it counts. */
export function ProductsSummary({
  summary,
  loading,
  state,
  onPick,
  className,
}: ProductsSummaryProps) {
  const clear = {view: undefined, status: undefined, availability: undefined};
  const tiles: Tile[] = [
    {
      key: 'total',
      label: 'Total products',
      icon: <Layers />,
      tone: 'sky',
      value: formatCount(summary?.total),
      patch: clear,
      selected: !state.view && !state.status && !state.availability,
    },
    {
      key: 'published',
      label: 'Published',
      icon: <PackageCheck />,
      tone: 'leaf',
      value: formatCount(summary?.published),
      hint: summary ? `${formatCount(summary.inactive)} unpublished` : undefined,
      patch: {...clear, status: 'published'},
      selected: state.status === 'published',
    },
    {
      key: 'drafts',
      label: 'Drafts',
      icon: <FilePen />,
      tone: 'neutral',
      value: formatCount(summary?.drafts),
      patch: {...clear, status: 'draft'},
      selected: state.status === 'draft',
    },
    {
      key: 'low',
      label: 'Low stock',
      icon: <PackageMinus />,
      tone: 'palm',
      value: formatCount(summary?.lowStock),
      patch: {...clear, view: 'low_stock'},
      selected: state.view === 'low_stock',
    },
    {
      key: 'out',
      label: 'Out of stock',
      icon: <CircleSlash />,
      tone: 'flame',
      value: formatCount(summary?.outOfStock),
      patch: {...clear, view: 'out_of_stock'},
      selected: state.view === 'out_of_stock',
    },
    {
      key: 'attention',
      label: 'Need attention',
      icon: <AlertTriangle />,
      tone: 'flame',
      value: formatCount(summary?.needsAttention),
      hint: summary ? `${formatCount(summary.openRecommendations)} open recs` : undefined,
      patch: {...clear, view: 'needs_ai_attention'},
      selected: state.view === 'needs_ai_attention',
    },
  ];

  return (
    <Panel title="Catalogue statistics" className={className}>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map(tile => (
          <button
            key={tile.key}
            type="button"
            aria-pressed={tile.selected}
            onClick={() => onPick(tile.patch)}
            className={cn(
              'grid min-w-0 content-start gap-2 rounded-lg border bg-surface-sunken/50 p-3 text-left transition-colors hover:bg-surface-sunken',
              tile.selected ? 'border-flame bg-flame-tint/40' : 'border-line'
            )}
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-md [&_svg]:size-5',
                  CHIP[tile.tone]
                )}
              >
                {tile.icon}
              </span>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-title-lg tabular">{tile.value}</span>
              )}
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate text-body-sm text-ink-muted">{tile.label}</span>
              {tile.hint ? (
                <span className="truncate text-chip text-ink-muted">{tile.hint}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}
