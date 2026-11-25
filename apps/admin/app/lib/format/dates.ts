import {format} from 'date-fns';

export function formatDay(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy');
}

export function formatMoment(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy HH:mm');
}

export function formatMomentSeconds(iso: string): string {
  return format(new Date(iso), 'dd/MM/yyyy HH:mm:ss');
}
