const LAGOS = 'Africa/Lagos';

/** Morning until 12:00, afternoon until 17:00, then evening, on Lagos time (WAT). */
export function greetingFor(now: Date): 'Good morning' | 'Good afternoon' | 'Good evening' {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {hour: 'numeric', hourCycle: 'h23', timeZone: LAGOS}).format(
      now
    )
  );
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** "Wednesday 25/11/2026" on Lagos time (DD/MM/YYYY, non-negotiable 8). */
export function todayLabel(now: Date): string {
  const weekday = new Intl.DateTimeFormat('en-GB', {weekday: 'long', timeZone: LAGOS}).format(now);
  const day = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: LAGOS,
  }).format(now);
  return `${weekday} ${day}`;
}

export interface CompactNow {
  weekday: string;
  day: string;
  month: string;
  time: string;
}

/** "Wed", "25", "Nov", "8:41 pm" on Lagos time, for the small date and time tile. */
export function compactNow(now: Date): CompactNow {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', {...options, timeZone: LAGOS}).format(now);
  return {
    weekday: part({weekday: 'short'}),
    day: part({day: 'numeric'}),
    month: part({month: 'short'}),
    time: part({hour: 'numeric', minute: '2-digit', hour12: true}).replace(/\s/g, ' '),
  };
}
