import {useState} from 'react';

import type {OrderPattern} from '@grov/models';
import {ColumnChart, Panel, Segmented, Skeleton} from '@grov/ui';

import {formatCount} from '../../lib/catalogue/insight-format';
import {
  bucketLabel,
  bucketTitle,
  PATTERN_OPTIONS,
  type PatternScale,
  patternSentence,
} from '../../lib/dashboard/order-pattern';

export interface OrderPatternCardProps {
  pattern: OrderPattern | undefined;
}

/** When people order: by hour of the day, day of the week, or day of the month. */
export function OrderPatternCard({pattern}: OrderPatternCardProps) {
  const [scale, setScale] = useState<PatternScale>('week');
  const buckets = pattern?.[scale];
  return (
    <Panel
      title="When people order"
      actions={
        <Segmented
          size="sm"
          label="Group orders by"
          options={PATTERN_OPTIONS}
          value={scale}
          onChange={setScale}
        />
      }
    >
      {!buckets ? (
        <Skeleton className="h-56" />
      ) : (
        <div className="grid gap-3">
          <p className="text-body-sm text-ink-muted" aria-live="polite">
            {patternSentence(scale, buckets)}
          </p>
          <ColumnChart
            points={buckets.map(b => ({x: String(b.bucket), value: b.orders}))}
            label="Orders"
            height={220}
            formatValue={formatCount}
            formatX={x => bucketLabel(scale, Number(x))}
            formatTitle={x => bucketTitle(scale, Number(x))}
          />
        </div>
      )}
    </Panel>
  );
}
