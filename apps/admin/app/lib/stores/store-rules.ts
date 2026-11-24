import type {AdminAccess, Pin} from '@grov/models';

/**
 * Where a city's map opens when it has no stores yet. Only a starting view for
 * dropping the first pin; the store's own location is what grov-be keeps.
 */
const CITY_VIEW: Record<string, Pin> = {
  LOS: {lat: 6.5244, lng: 3.3792},
  IBA: {lat: 7.3775, lng: 3.947},
};

export function cityView(code: string | undefined): Pin {
  return (code && CITY_VIEW[code]) || CITY_VIEW['LOS'] || {lat: 6.5244, lng: 3.3792};
}

/** Lower-case words joined by hyphens, as grov-be's slug rule expects. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

/** Only admins over every store can add one (grov-be refuses with STORE_OUT_OF_SCOPE). */
export function hasAllStores(admin: AdminAccess | null | undefined): boolean {
  return admin?.stores === 'ALL';
}

/** A store starts with a circle around its pin; ops can reshape it after. */
export const DEFAULT_RADIUS_KM = 3;
