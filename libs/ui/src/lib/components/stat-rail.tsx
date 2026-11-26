import type {ReactNode} from 'react';

import {Info} from 'lucide-react';

import {cn} from '../utils/cn';
import {Skeleton} from './skeleton';
import {ChangeBadge, type StatTone} from './stat-strip';
import {Tooltip} from './tooltip';

const DOT: Record<StatTone, string> = {
  flame: 'bg-flame',
  sky: 'bg-sky-strong',
  palm: 'bg-palm',
  leaf: 'bg-leaf',
  neutral: 'bg-ink-muted',
};

export interface RailRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** Longer explanation, shown on hover or focus of the label's info mark. */
  info?: ReactNode;
  /** One short line under the label. */
  hint?: ReactNode;
  /** A small coloured dot before the label. */
  tone?: StatTone;
  /** A small mark before the value that says what kind of value it is: a logo, ↻ for a renewal. */
  icon?: ReactNode;
  changeBps?: number | null;
  /** Falling is good for this number. */
  invert?: boolean;
  /** Makes the row a filter: it toggles the list beside the rail. */
  onSelect?: () => void;
  selected?: boolean;
}

/**
 * Related rows grouped in a card: a quiet sunken header (title, and a link on the right) over a
 * white body. The Cloudflare "Domain Registration" card.
 */
export interface RailCardProps {
  title: ReactNode;
  /** Right side of the header, usually a link ending in an arrow. */
  action?: ReactNode;
  rows: RailRow[];
  loading?: boolean;
  /** Shown in the body instead of rows when there are none. */
  empty?: ReactNode;
  className?: string;
}

/**
 * Nothing here yet, as a card: a sunken picture well with the icon between two dashed tiles,
 * then a title, one or two lines of help, and the action. The Cloudflare "No Workers" card.
 */
export interface RailEmptyProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Short `label: value` facts under a section title, e.g. "Setup: Full ⓘ". */
export interface RailFact {
  key: string;
  label: ReactNode;
  value: ReactNode;
  info?: ReactNode;
}

export interface RailSection {
  key: string;
  /** Leave out when the section is a single card that carries its own title. */
  title?: ReactNode;
  /** Quiet text on the right of the title: a period, a count, a link. */
  meta?: ReactNode;
  facts?: RailFact[];
  /** A card above the rows: a headline figure, a bar. */
  visual?: ReactNode;
  rows?: RailRow[];
  /** Plain links under the rows, one per line, split by hairlines. */
  links?: ReactNode[];
  /** Cards under the rows. */
  cards?: RailCardProps[];
  /** An empty card, shown after everything else. */
  empty?: RailEmptyProps;
  /** Muted explanation at the end. */
  note?: ReactNode;
}

export interface StatRailProps {
  sections: RailSection[];
  loading?: boolean;
  className?: string;
}

function InfoMark({info, children}: {info?: ReactNode; children: ReactNode}) {
  return info ? <Tooltip content={info}>{children}</Tooltip> : <>{children}</>;
}

function RailRowView({row, loading}: {row: RailRow; loading?: boolean}) {
  const label = (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-body-sm text-ink-muted">
      {row.tone ? (
        <span aria-hidden className={cn('size-2 shrink-0 rounded-pill', DOT[row.tone])} />
      ) : null}
      <span className="truncate">{row.label}</span>
      {row.info ? <Info aria-hidden className="size-3.5 shrink-0" /> : null}
    </span>
  );
  const body = (
    <>
      <span className="grid min-w-0 gap-0.5">
        <InfoMark info={row.info}>{label}</InfoMark>
        {row.hint ? (
          <span
            className={cn(
              'truncate text-chip font-normal tracking-normal text-ink-muted',
              row.tone && 'pl-3.5'
            )}
          >
            {row.hint}
          </span>
        ) : null}
      </span>
      {loading ? (
        <Skeleton className="h-5 w-14" />
      ) : (
        <span className="flex shrink-0 flex-wrap items-center justify-end gap-2 text-right text-body-sm font-medium text-ink tabular">
          {row.changeBps ? <ChangeBadge bps={row.changeBps} invert={row.invert} /> : null}
          {row.icon ? (
            <span
              aria-hidden
              className="flex shrink-0 items-center text-ink-muted [&_svg]:size-3.5"
            >
              {row.icon}
            </span>
          ) : null}
          {row.value}
        </span>
      )}
    </>
  );
  const base =
    '-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-4 rounded-sm px-2 py-2.5';
  return row.onSelect ? (
    <button
      type="button"
      aria-pressed={row.selected}
      onClick={row.onSelect}
      className={cn(
        base,
        'text-left transition-colors hover:bg-surface-sunken',
        row.selected && 'bg-flame-tint/50'
      )}
    >
      {body}
    </button>
  ) : (
    <div className={base}>{body}</div>
  );
}

function RailRows({rows, loading}: {rows: RailRow[]; loading?: boolean}) {
  return (
    <ul className="divide-y divide-line">
      {rows.map(row => (
        <li key={row.key}>
          <RailRowView row={row} loading={loading} />
        </li>
      ))}
    </ul>
  );
}

export function RailCard({title, action, rows, loading, empty, className}: RailCardProps) {
  return (
    <div className={cn('rounded-md border border-line bg-surface-sunken', className)}>
      <div className="flex h-10 items-center justify-between gap-3 px-4 text-body-sm text-ink-muted">
        <span className="truncate">{title}</span>
        {action ? (
          <span className="flex shrink-0 items-center gap-1 [&_svg]:size-4">{action}</span>
        ) : null}
      </div>
      {/* The body is its own card laid over the header's bottom edge, so it reads as inset. */}
      <div className="-m-px rounded-md border border-line bg-surface px-4 py-1">
        {rows.length > 0 || loading ? (
          <RailRows rows={rows} loading={loading} />
        ) : (
          <div className="py-2.5 text-body-sm text-ink-muted">{empty}</div>
        )}
      </div>
    </div>
  );
}

export function RailEmpty({icon, title, description, action, className}: RailEmptyProps) {
  const ghost = 'size-10 rounded-sm border border-dashed border-line-strong bg-surface/60';
  return (
    <div className={cn('rounded-md border border-line bg-surface p-2', className)}>
      <div
        aria-hidden
        className="flex h-36 items-center justify-center rounded-sm border border-line bg-surface-sunken"
      >
        <span className={ghost} />
        <span className="h-px w-4 bg-line-strong" />
        <span className="flex size-16 items-center justify-center rounded-md border border-line bg-surface text-flame shadow-[0_1px_2px_rgb(0_0_0/0.04)] [&_svg]:size-6">
          {icon}
        </span>
        <span className="h-px w-4 bg-line-strong" />
        <span className={ghost} />
      </div>
      <div className="grid gap-1 px-2 pt-4 pb-2">
        <h3 className="text-body font-semibold">{title}</h3>
        {description ? <p className="text-body-sm text-ink-muted">{description}</p> : null}
        {action ? <div className="mt-3 flex flex-wrap gap-2">{action}</div> : null}
      </div>
    </div>
  );
}

/**
 * Key numbers as label and value rows in titled groups, for the full-height rail beside a list
 * (the Cloudflare R2 / domain overview pattern). Plain rows sit straight on the canvas with
 * hairlines between them; a group that belongs together (with a link to more) is a `RailCard`;
 * nothing-yet is a `RailEmpty`. A row with `onSelect` filters the list.
 */
export function StatRail({sections, loading, className}: StatRailProps) {
  return (
    <div className={cn('grid', className)}>
      {sections.map(section => {
        const rows = section.rows ?? [];
        return (
          <section
            key={section.key}
            aria-label={typeof section.title === 'string' ? section.title : undefined}
            className="grid gap-4 border-b border-line p-6 last:border-b-0"
          >
            {section.title ? (
              <header className="flex items-baseline justify-between gap-3">
                <h2 className="text-body font-semibold">{section.title}</h2>
                {section.meta ? (
                  <span className="text-body-sm text-ink-muted">{section.meta}</span>
                ) : null}
              </header>
            ) : null}
            {section.facts?.length ? (
              <dl className="grid gap-1.5">
                {section.facts.map(fact => (
                  <div key={fact.key} className="flex items-center gap-1.5 text-body-sm">
                    <dt className="text-ink">{fact.label}:</dt>
                    <dd className="font-semibold text-ink">{loading ? '…' : fact.value}</dd>
                    {fact.info ? (
                      <InfoMark info={fact.info}>
                        <Info aria-label="More" className="size-3.5 text-ink-muted" />
                      </InfoMark>
                    ) : null}
                  </div>
                ))}
              </dl>
            ) : null}
            {section.visual ? (
              <div className="rounded-md border border-line bg-surface p-4">{section.visual}</div>
            ) : null}
            {rows.length > 0 ? <RailRows rows={rows} loading={loading} /> : null}
            {section.links?.length ? (
              <ul className="divide-y divide-line border-y border-line">
                {section.links.map((link, index) => (
                  <li
                    key={index}
                    className="py-2.5 text-body-sm font-medium text-ink [&_a]:underline-offset-4 [&_a:hover]:underline"
                  >
                    {link}
                  </li>
                ))}
              </ul>
            ) : null}
            {section.cards?.map((card, index) => (
              <RailCard key={index} loading={loading} {...card} />
            ))}
            {section.empty ? <RailEmpty {...section.empty} /> : null}
            {section.note ? (
              <div className="text-body-sm text-ink-muted">{section.note}</div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export interface Segment {
  key: string;
  label: string;
  value: number;
  tone: StatTone;
}

/** Parts of a whole as one stacked bar, with a small key under it. */
export function SegmentBar({segments, className}: {segments: Segment[]; className?: string}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className={cn('grid gap-3', className)}>
      <div
        role="img"
        aria-label={segments.map(s => `${s.label} ${s.value}`).join(', ')}
        className="flex h-2.5 overflow-hidden rounded-pill bg-surface-sunken"
      >
        {total > 0
          ? segments
              .filter(segment => segment.value > 0)
              .map(segment => (
                <span
                  key={segment.key}
                  className={cn('h-full', DOT[segment.tone])}
                  style={{width: `${(segment.value / total) * 100}%`}}
                />
              ))
          : null}
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-chip text-ink-muted">
        {segments.map(segment => (
          <li key={segment.key} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={cn('size-2 rounded-pill', DOT[segment.tone])} />
            {segment.label}
            <span className="tabular text-ink">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
