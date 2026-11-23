import {type ComponentType, type ReactNode, useState} from 'react';

import {Menu} from 'lucide-react';
import {NavLink, Outlet, useLocation} from 'react-router';

import {Button, cn, Dialog, DialogContent, DialogTitle, Logo} from '@grov/ui';

import {type PermissionRequirement, usePermissions} from '../auth/access';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{className?: string; 'aria-hidden'?: boolean}>;
  /** Hidden unless the signed-in admin holds these permissions. */
  requires?: PermissionRequirement;
  end?: boolean;
}

export interface AppShellProps {
  nav: NavItem[];
  /** Right side of the top bar: store switcher, user menu … */
  headerEnd?: ReactNode;
  /** Small chip next to the logo, e.g. "Admin". */
  badge?: ReactNode;
  children?: ReactNode;
}

/** Sidebar (from `lg`) + top bar + content. On phones the nav opens as a side sheet. */
export function AppShell({nav, headerEnd, badge, children}: AppShellProps) {
  const {check} = usePermissions();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const items = nav.filter(item => !item.requires || check(item.requires));

  const links = (
    <nav aria-label="Main" className="grid gap-1">
      {items.map(({to, label, icon: Icon, end}) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({isActive}) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-body font-semibold text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink',
              isActive &&
                'bg-flame-tint text-flame-strong hover:bg-flame-tint hover:text-flame-strong'
            )
          }
        >
          <Icon aria-hidden className="size-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2">
      <Logo />
      {badge ? (
        <span className="rounded-pill bg-surface-sunken px-2.5 py-1 text-chip">{badge}</span>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-8 border-r border-line bg-surface px-4 py-5 lg:flex">
        {brand}
        {links}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden />
          </Button>
          <span className="lg:hidden">{brand}</span>
          <div className="ml-auto flex items-center gap-2">{headerEnd}</div>
        </header>
        <main
          key={location.pathname}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8"
        >
          {children ?? <Outlet />}
        </main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent layout="side" className="max-w-xs gap-8 p-5">
          <DialogTitle className="sr-only">Menu</DialogTitle>
          {brand}
          {links}
        </DialogContent>
      </Dialog>
    </div>
  );
}
