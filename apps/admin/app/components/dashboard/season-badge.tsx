import {Badge, type BadgeProps} from '@grov/ui';

import type {SeasonStatus} from '../../lib/dashboard/season';

const STATUS: Record<SeasonStatus, {label: string; tone: BadgeProps['tone']}> = {
  IN_SEASON: {label: 'In season', tone: 'leaf'},
  LEAVING: {label: 'Leaving soon', tone: 'palm'},
  COMING: {label: 'Coming soon', tone: 'sky'},
  OUT: {label: 'Out of season', tone: 'neutral'},
  YEAR_ROUND: {label: 'Year-round', tone: 'neutral'},
  UNSET: {label: 'No season set', tone: 'neutral'},
};

export function SeasonBadge({status}: {status: SeasonStatus}) {
  const {label, tone} = STATUS[status];
  return <Badge tone={tone}>{label}</Badge>;
}
