import {Clock, Lock, PackageX, TrendingUp, Waves} from 'lucide-react';

import {Badge} from './badge';

export type PriceStatusKind = 'locked' | 'estimate' | 'updated' | 'changed' | 'out-of-stock';

export interface PriceStatusProps {
  status: PriceStatusKind;
  /** Extra words after the label: "₦4,100–₦4,600", "2h ago", "₦3,900 → ₦4,200". */
  detail?: string;
  className?: string;
}

const STATUS = {
  locked: {tone: 'leaf', label: 'Locked', Icon: Lock},
  estimate: {tone: 'palm', label: 'Estimate', Icon: Waves},
  updated: {tone: 'neutral', label: 'Updated', Icon: Clock},
  changed: {tone: 'flame', label: 'Price changed', Icon: TrendingUp},
  'out-of-stock': {tone: 'danger', label: 'Out of stock', Icon: PackageX},
} as const;

/** Every pre-payment price carries its status (DS5): icon + word, never colour alone. */
export function PriceStatus({status, detail, className}: PriceStatusProps) {
  const {tone, label, Icon} = STATUS[status];
  return (
    <Badge tone={tone} className={className}>
      <Icon aria-hidden />
      {label}
      {detail ? <span className="font-semibold">{detail}</span> : null}
    </Badge>
  );
}
