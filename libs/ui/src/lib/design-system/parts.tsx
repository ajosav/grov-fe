import {type ReactNode} from 'react';

export const SECTIONS = [
  'Colours',
  'Typography',
  'Buttons',
  'Fields',
  'More fields',
  'Selection',
  'Status',
  'Feedback',
  'Overlays',
  'Patterns',
  'Navigation',
  'Data',
  'Insights',
  'Layout',
] as const;

export type SectionTitle = (typeof SECTIONS)[number];

export const sectionId = (title: SectionTitle) => `ds-${title.toLowerCase().replace(/\s+/g, '-')}`;

export function Section({title, children}: {title: SectionTitle; children: ReactNode}) {
  const id = sectionId(title);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="grid scroll-mt-20 gap-5">
      <h2 id={`${id}-title`} className="border-b border-line pb-2 text-title-md">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Row({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="grid gap-2">
      <p className="text-chip uppercase tracking-wide text-ink-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
