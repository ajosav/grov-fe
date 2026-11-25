import type {CityStatus, StoreStatus} from '@grov/models';
import {Badge, type BadgeProps} from '@grov/ui';

export const CITY_STATUS: Record<
  CityStatus,
  {label: string; tone: BadgeProps['tone']; hint: string}
> = {
  PLANNED: {label: 'Planned', tone: 'neutral', hint: 'Being set up. Customers can’t order yet.'},
  PILOT: {label: 'Pilot', tone: 'sky', hint: 'Open to a small group while we test.'},
  LIVE: {label: 'Live', tone: 'leaf', hint: 'Open to everyone in its stores’ zones.'},
  PAUSED: {label: 'Paused', tone: 'palm', hint: 'Temporarily closed to new orders.'},
};

export const CITY_STATUSES = Object.keys(CITY_STATUS) as CityStatus[];

export function CityStatusBadge({status}: {status: CityStatus}) {
  const {label, tone} = CITY_STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}

export function StoreStatusBadge({status}: {status: StoreStatus}) {
  return status === 'ACTIVE' ? (
    <Badge tone="leaf">Active</Badge>
  ) : (
    <Badge tone="neutral">Inactive</Badge>
  );
}
