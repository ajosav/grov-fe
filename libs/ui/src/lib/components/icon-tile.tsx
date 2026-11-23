import {type ReactNode} from 'react';

import {cn} from '../utils/cn';

const TONE = {
  flame: 'from-flame to-flame-strong text-on-bright',
  sky: 'from-sky-tint to-sky-strong text-on-night',
  palm: 'from-palm to-palm-strong text-on-bright',
  leaf: 'from-leaf to-leaf-strong text-on-bright',
  night: 'from-night-hi to-night text-on-night',
} as const;

export interface IconTileProps {
  icon: ReactNode;
  tone?: keyof typeof TONE;
  size?: number;
  className?: string;
}

export function IconTile({icon, tone = 'flame', size = 48, className}: IconTileProps) {
  return (
    <span
      aria-hidden
      style={{width: size, height: size}}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br shadow-glass [&_svg]:size-1/2',
        TONE[tone],
        className
      )}
    >
      {icon}
    </span>
  );
}
