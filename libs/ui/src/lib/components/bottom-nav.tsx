import {type ComponentType, type ReactNode} from 'react';

import {cn} from '../utils/cn';

export interface BottomNavItem {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
  center?: boolean;
}

export type BottomNavLink = ComponentType<{
  to: string;
  className?: string;
  children: ReactNode;
  'aria-current'?: 'page';
}>;

export interface BottomNavProps {
  items: BottomNavItem[];
  active: string;
  link: BottomNavLink;
  className?: string;
}

export function BottomNav({items, active, link: Link, className}: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className={cn(
        'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-md rounded-pill glass-strong px-2',
        className
      )}
    >
      <ul className="grid grid-cols-5 items-end">
        {items.map(item => {
          const isActive = item.key === active;
          return (
            <li key={item.key} className="flex justify-center">
              <Link
                to={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 min-w-14 flex-col items-center justify-end gap-0.5 pb-2 text-chip transition-colors',
                  isActive ? 'text-flame-strong' : 'text-ink-muted hover:text-ink'
                )}
              >
                {item.center ? (
                  <span
                    className={cn(
                      '-mt-7 mb-0.5 flex size-[52px] items-center justify-center rounded-pill bg-night ring-4 ring-canvas shadow-raised [&_svg]:size-6',
                      isActive ? 'text-flame' : 'text-on-night'
                    )}
                  >
                    {item.icon}
                  </span>
                ) : (
                  <span className={cn('[&_svg]:size-6', isActive && 'text-flame')}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
