import {type KeyboardEvent, type PointerEvent, useMemo, useState} from 'react';

import {cn} from '../utils/cn';
import {niceTicks, useWidth} from './charts';

export interface ColumnPoint {
  x: string;
  value: number;
}

export interface ColumnChartProps {
  points: ColumnPoint[];
  label: string;
  formatValue?: (value: number) => string;
  formatX: (x: string) => string;
  formatTitle?: (x: string) => string;
  height?: number;
  className?: string;
}

const PAD = {top: 12, right: 12, bottom: 28, left: 40};

export function ColumnChart({
  points,
  label,
  formatValue = value => value.toLocaleString('en-NG'),
  formatX,
  formatTitle = formatX,
  height = 220,
  className,
}: ColumnChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(0, ...points.map(p => p.value));
  const ticks = useMemo(() => niceTicks(max), [max]);
  const top = ticks.at(-1) ?? 1;
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const slot = points.length > 0 ? plotW / points.length : 0;
  const barW = Math.min(28, Math.max(2, slot * 0.7));
  const cx = (i: number) => PAD.left + slot * i + slot / 2;
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 96))));

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.floor((event.clientX - rect.left - PAD.left) / (slot || 1));
    setActive(Math.min(points.length - 1, Math.max(0, index)));
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setActive(current => {
      const from = current ?? (event.key === 'ArrowRight' ? -1 : points.length);
      return Math.min(points.length - 1, Math.max(0, from + (event.key === 'ArrowRight' ? 1 : -1)));
    });
  };
  const point = active === null ? undefined : points[active];

  return (
    <div className={cn('grid gap-3', className)}>
      <div ref={ref} className="relative" style={{height}}>
        {width > 0 ? (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${label} over time. Use the left and right arrow keys to read values.`}
            tabIndex={0}
            className="touch-none rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-flame/20"
            onPointerMove={pick}
            onPointerLeave={() => setActive(null)}
            onKeyDown={onKey}
            onBlur={() => setActive(null)}
          >
            {ticks.map(t => (
              <g key={t}>
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(t)}
                  y2={y(t)}
                  className="stroke-line"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 8}
                  y={y(t)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-ink-muted text-chip font-normal tabular"
                >
                  {t.toLocaleString('en-NG')}
                </text>
              </g>
            ))}
            {points.map((p, i) => {
              const h = p.value > 0 ? Math.max(2, (p.value / top) * plotH) : 0;
              return (
                <rect
                  key={p.x}
                  x={cx(i) - barW / 2}
                  y={PAD.top + plotH - h}
                  width={barW}
                  height={h}
                  rx={Math.min(3, barW / 2)}
                  className={cn('fill-chart-4', active !== null && active !== i && 'opacity-50')}
                />
              );
            })}
            {points.map((p, i) =>
              i % labelEvery === 0 ? (
                <text
                  key={p.x}
                  x={cx(i)}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-ink-muted text-chip font-normal tabular"
                >
                  {formatX(p.x)}
                </text>
              ) : null
            )}
          </svg>
        ) : null}
        {point && active !== null ? (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-md border border-line bg-surface-raised px-3 py-2 text-body-sm shadow-raised"
            style={{left: Math.min(Math.max(0, cx(active) + 12), Math.max(0, width - 168))}}
          >
            <div className="text-label text-ink-muted">{formatTitle(point.x)}</div>
            <div className="flex items-center justify-between gap-4">
              <span>{label}</span>
              <span className="font-semibold tabular">{formatValue(point.value)}</span>
            </div>
          </div>
        ) : null}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">{label}</th>
          </tr>
        </thead>
        <tbody>
          {points.map(p => (
            <tr key={p.x}>
              <td>{formatTitle(p.x)}</td>
              <td>{formatValue(p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
