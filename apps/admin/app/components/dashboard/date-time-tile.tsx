import {useEffect, useState} from 'react';

import {compactNow} from '../../lib/dashboard/greeting';

/** A small calendar tile with today's date and the time in Lagos. Ticks once a minute. */
export function DateTimeTile() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  const {weekday, day, month, time} = compactNow(now);
  return (
    <time
      dateTime={now.toISOString()}
      className="grid w-16 shrink-0 justify-items-center overflow-hidden rounded-md border border-line bg-surface text-center"
    >
      <span className="w-full bg-flame-tint py-0.5 text-chip font-semibold uppercase text-flame-strong">
        {weekday}
      </span>
      <span className="text-title-md font-semibold leading-tight tabular">{day}</span>
      <span className="-mt-0.5 text-chip text-ink-muted">{month}</span>
      <span className="w-full border-t border-line py-0.5 text-chip font-semibold tabular">
        {time}
      </span>
    </time>
  );
}
