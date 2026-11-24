import {format} from 'date-fns';

/** DD/MM/YYYY, as everywhere in the product. */
export function formatDay(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy');
}

/** DD/MM/YYYY HH:mm, for things that happened at a time (sent, expires). */
export function formatMoment(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy HH:mm');
}
