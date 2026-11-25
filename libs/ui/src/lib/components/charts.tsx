import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {cn} from '../utils/cn';

/**
 * Small SVG charts for the admin, drawn with the chart tokens (no chart library).
 * One y-axis per chart; 2px lines; recessive grid; a crosshair tooltip on hover and
 * arrow keys; a hidden table for screen readers. Colour carries identity only, and
 * every value is also in text.
 */

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Round axis ticks: 0 and up to 4 steps of 1/2/2.5/5 × 10^n. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * magnitude).find(s => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Number(v.toFixed(6)));
  if ((ticks.at(-1) ?? 0) < max) ticks.push((ticks.at(-1) ?? 0) + step);
  return ticks;
}

export interface TrendPoint {
  /** YYYY-MM-DD or any label. */
  x: string;
  value: number;
  /** Same position in the previous period, for comparison. */
  previous?: number;
}

export interface TrendChartProps {
  points: TrendPoint[];
  /** What the line measures, e.g. "Revenue". Names the series in the legend and tooltip. */
  label: string;
  formatValue: (value: number) => string;
  formatAxis?: (value: number) => string;
  formatX: (x: string) => string;
  /** Label of the comparison line, when points carry `previous`. */
  previousLabel?: string;
  height?: number;
  className?: string;
}

const PAD = {top: 12, right: 12, bottom: 28, left: 56};

export function TrendChart({
  points,
  label,
  formatValue,
  formatAxis = formatValue,
  formatX,
  previousLabel = 'Previous period',
  height = 240,
  className,
}: TrendChartProps) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const hasPrevious = points.some(p => p.previous !== undefined);
  const max = Math.max(0, ...points.map(p => Math.max(p.value, p.previous ?? 0)));
  const ticks = useMemo(() => niceTicks(max), [max]);
  const top = ticks.at(-1) ?? 1;
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = height - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (points.length <= 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const path = (pick: (p: TrendPoint) => number | undefined) =>
    points
      .map((p, i) => {
        const v = pick(p);
        return v === undefined
          ? null
          : `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(' ');
  const line = path(p => p.value);
  const area =
    points.length > 1 ? `${line} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z` : '';
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 64))));

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left - PAD.left;
    const index = points.length <= 1 ? 0 : Math.round((px / plotW) * (points.length - 1));
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
      {hasPrevious ? (
        <div className="flex flex-wrap items-center gap-4 text-body-sm text-ink-muted" aria-hidden>
          <span className="inline-flex items-center gap-2">
            <span className="h-0.5 w-4 rounded-pill bg-chart-1" /> {label}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-0 w-4 border-t-2 border-dashed border-line-strong" /> {previousLabel}
          </span>
        </div>
      ) : null}
      <div ref={ref} className="relative" style={{height}}>
        {width > 0 ? (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${label} by day. Use the left and right arrow keys to read values.`}
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
                  {formatAxis(t)}
                </text>
              </g>
            ))}
            {points.map((p, i) =>
              (i % labelEvery === 0 && points.length - 1 - i >= labelEvery) ||
              i === points.length - 1 ? (
                <text
                  key={p.x}
                  x={x(i)}
                  y={height - 8}
                  textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                  className="fill-ink-muted text-chip font-normal tabular"
                >
                  {formatX(p.x)}
                </text>
              ) : null
            )}
            {area ? <path d={area} className="fill-chart-1 opacity-10" /> : null}
            {hasPrevious ? (
              <path
                d={path(p => p.previous)}
                fill="none"
                strokeWidth={2}
                strokeDasharray="4 4"
                className="stroke-line-strong"
              />
            ) : null}
            <path
              d={line}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="stroke-chart-1"
            />
            {point && active !== null ? (
              <g>
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={PAD.top}
                  y2={PAD.top + plotH}
                  className="stroke-line-strong"
                  strokeWidth={1}
                />
                <circle
                  cx={x(active)}
                  cy={y(point.value)}
                  r={4.5}
                  strokeWidth={2}
                  className="fill-chart-1 stroke-surface"
                />
              </g>
            ) : null}
          </svg>
        ) : null}
        {point && active !== null ? (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-36 rounded-md border border-line bg-surface-raised px-3 py-2 text-body-sm shadow-raised"
            style={{
              left: Math.min(Math.max(0, x(active) + 12), Math.max(0, width - 168)),
            }}
          >
            <div className="text-label text-ink-muted">{formatX(point.x)}</div>
            <div className="flex items-center justify-between gap-4">
              <span>{label}</span>
              <span className="font-semibold tabular">{formatValue(point.value)}</span>
            </div>
            {point.previous !== undefined ? (
              <div className="flex items-center justify-between gap-4 text-ink-muted">
                <span>{previousLabel}</span>
                <span className="tabular">{formatValue(point.previous)}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">{label}</th>
            {hasPrevious ? <th scope="col">{previousLabel}</th> : null}
          </tr>
        </thead>
        <tbody>
          {points.map(p => (
            <tr key={p.x}>
              <td>{formatX(p.x)}</td>
              <td>{formatValue(p.value)}</td>
              {hasPrevious ? (
                <td>{p.previous === undefined ? '—' : formatValue(p.previous)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface BarItem {
  key: string;
  label: ReactNode;
  value: number;
  /** Shown at the end of the bar instead of the formatted value. */
  detail?: ReactNode;
}

/** Ranked horizontal bars: magnitude by length, values always in text. */
export interface BarListProps {
  items: BarItem[];
  formatValue: (value: number) => string;
  empty?: string;
  className?: string;
}

export function BarList({
  items,
  formatValue,
  empty = 'Nothing in this period.',
  className,
}: BarListProps) {
  const max = Math.max(0, ...items.map(i => i.value));
  if (items.length === 0) return <p className="text-body-sm text-ink-muted">{empty}</p>;
  return (
    <ul className={cn('grid gap-3', className)}>
      {items.map(item => (
        <li key={item.key} className="grid gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-body-sm">
            <span className="min-w-0 truncate">{item.label}</span>
            <span className="shrink-0 font-semibold tabular">
              {item.detail ?? formatValue(item.value)}
            </span>
          </div>
          <div className="h-2 rounded-pill bg-surface-sunken" aria-hidden>
            <div
              className="h-2 rounded-pill bg-chart-4"
              style={{width: `${max > 0 ? Math.max(2, (item.value / max) * 100) : 0}%`}}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface FunnelStep {
  label: string;
  value: number | null;
  hint?: string;
}

/** Steps as bars against the first, with the step-to-step rate. Untracked steps say so. */
export interface FunnelProps {
  steps: FunnelStep[];
}

export function Funnel({steps}: FunnelProps) {
  const first = steps[0]?.value ?? 0;
  return (
    <ol className="grid gap-3">
      {steps.map((step, i) => {
        const rate =
          step.value !== null && first > 0 ? Math.round((step.value / first) * 1000) / 10 : null;
        return (
          <li key={step.label} className="grid gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-body-sm">
              <span>
                {step.label}
                {step.hint ? <span className="ml-2 text-ink-muted">{step.hint}</span> : null}
              </span>
              <span className="shrink-0 tabular">
                <span className="font-semibold">
                  {step.value === null ? 'Not tracked' : step.value.toLocaleString('en-NG')}
                </span>
                {rate !== null && i > 0 ? (
                  <span className="ml-2 text-ink-muted">
                    {rate}% of {steps[0]?.label.toLowerCase()}
                  </span>
                ) : null}
              </span>
            </div>
            <div className="h-3 rounded-pill bg-surface-sunken" aria-hidden>
              {step.value !== null ? (
                <div
                  className="h-3 rounded-pill bg-chart-1"
                  style={{width: `${first > 0 ? Math.max(1, (step.value / first) * 100) : 0}%`}}
                />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
