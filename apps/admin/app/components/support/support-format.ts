import {differenceInMinutes, format, isToday} from 'date-fns';

/** "14:05" today, "21/11" before (WAT is the browser's zone for staff; DD/MM per D-local fit). */
export function messageTime(iso: string): string {
  const d = new Date(iso);
  return isToday(d) ? format(d, 'HH:mm') : format(d, 'dd/MM');
}

/** Short "12m", "3h", "2d" for list rows. */
export function ago(iso: string, now = Date.now()): string {
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  if (m < 60 * 24) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
}

/** "Reply due in 25 min" or "Reply 10 min late". */
export function dueLabel(iso: string, now = Date.now()): {text: string; late: boolean} {
  const m = differenceInMinutes(new Date(iso), new Date(now));
  const span = (n: number) => (n < 60 ? `${n} min` : `${Math.round(n / 60)} h`);
  return m >= 0
    ? {text: `Reply due in ${span(m)}`, late: false}
    : {text: `Reply ${span(-m)} late`, late: true};
}
