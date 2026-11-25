import {InsightCard} from './insight-card';

export interface ComingSoonCardProps {
  title: string;
  description: string;
  planned: string[];
  onViewAll: () => void;
}

/** A card for intelligence that needs data sources that aren't connected yet (doc 38). */
export function ComingSoonCard({title, description, planned, onViewAll}: ComingSoonCardProps) {
  return (
    <InsightCard title={title} tag="Coming soon" onViewAll={onViewAll} viewAllLabel="View more">
      <p className="text-body-sm text-ink-muted">{description}</p>
      <ul className="flex flex-wrap gap-2">
        {planned.map(item => (
          <li
            key={item}
            className="rounded-pill border border-dashed border-line-strong px-3 py-1 text-chip font-normal text-ink-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </InsightCard>
  );
}
