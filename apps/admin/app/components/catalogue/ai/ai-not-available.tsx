import {Sparkles} from 'lucide-react';

import {Badge, EmptyState, Panel} from '@grov/ui';

const PLANNED = [
  'Why sales moved: stock-outs, fewer viewers, conversion, price or store mix, in naira',
  'How the product compares with its category and across your stores',
  'Suggested changes with the evidence behind them, applied only after you approve',
  'Answers to questions about a product, from its own data',
];

/** Where AI product intelligence will sit, until it is built (doc 38). */
export function AiNotAvailablePanel() {
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Sparkles aria-hidden className="size-4 text-flame" /> AI insights
        </span>
      }
      actions={<Badge>Not available yet</Badge>}
    >
      <p className="text-body-sm text-ink-muted">
        When AI is switched on, this will explain why this product’s numbers moved and what to do
        about it. Nothing is analysed until then.
      </p>
    </Panel>
  );
}

/** The catalogue-wide intelligence view, until it is built (doc 38). */
export function AiNotAvailableState() {
  return (
    <div className="rounded-lg border border-line bg-surface">
      <EmptyState
        icon={<Sparkles />}
        title="AI product intelligence isn’t available yet"
        description="It will be built once AI is approved. Until then, use Analytics and each product’s Performance, Stock and Pricing tabs."
      />
      <div className="mx-auto max-w-xl px-6 pb-10">
        <p className="mb-2 text-body-sm font-semibold">What it will do</p>
        <ul className="grid list-disc gap-1.5 pl-5 text-body-sm text-ink-muted">
          {PLANNED.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
