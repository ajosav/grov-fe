import {useState} from 'react';

import {greetingFor, todayLabel} from '../../lib/dashboard/greeting';

export interface DashboardHeroProps {
  firstName?: string;
  /** Which stores the admin covers, in words: "All stores", "2 stores". */
  scope?: string;
}

/** The greeting. */
export function DashboardHero({firstName, scope}: DashboardHeroProps) {
  // Read once: the greeting should not change under someone's eyes mid-visit.
  const [now] = useState(() => new Date());
  return (
    <section
      aria-labelledby="dashboard-title"
      className="grid grid-cols-[minmax(0,1fr)] justify-items-center gap-6 pt-2"
    >
      <div className="grid gap-1.5 text-center">
        <h1 id="dashboard-title" className="text-title-lg sm:text-display-lg">
          {greetingFor(now)}
          {firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="text-body text-ink-muted">
          {todayLabel(now)}
          {scope ? ` · ${scope}` : ''}
        </p>
      </div>
    </section>
  );
}
