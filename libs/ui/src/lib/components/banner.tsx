import {type ReactNode} from 'react';

import {CircleAlert, CircleCheck, Info, PiggyBank, WifiOff} from 'lucide-react';

import {cn} from '../utils/cn';

const TONE = {
  info: {box: 'bg-sky-tint', icon: 'text-sky-strong', Icon: Info},
  offline: {box: 'bg-surface-sunken', icon: 'text-ink-muted', Icon: WifiOff},
  success: {box: 'bg-leaf-tint', icon: 'text-leaf-strong', Icon: CircleCheck},
  error: {box: 'bg-danger-tint', icon: 'text-danger', Icon: CircleAlert},
  neutral: {box: 'bg-surface-sunken', icon: 'text-ink', Icon: Info},
  savings: {box: 'bg-palm-tint', icon: 'text-palm-strong', Icon: PiggyBank},
} as const;

export interface BannerProps {
  tone?: keyof typeof TONE;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function Banner({tone = 'info', title, children, actions, icon, className}: BannerProps) {
  const {box, icon: iconClass, Icon} = TONE[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex flex-wrap items-start gap-3 rounded-lg p-4 text-ink', box, className)}
    >
      <span aria-hidden className={cn('mt-0.5 [&_svg]:size-5', iconClass)}>
        {icon ?? <Icon />}
      </span>
      <div className="grid min-w-0 flex-1 gap-1">
        {title ? <p className="text-label">{title}</p> : null}
        {children ? <div className="text-body-sm text-ink-muted">{children}</div> : null}
      </div>
      {actions ? (
        <div className="flex w-full flex-wrap gap-2 pl-8 sm:w-auto sm:pl-0">{actions}</div>
      ) : null}
    </div>
  );
}
