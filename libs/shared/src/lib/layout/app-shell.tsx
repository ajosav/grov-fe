import {type ComponentType, type ReactNode, useState} from 'react';

import {Menu} from 'lucide-react';
import {Link, matchPath, NavLink, Outlet, useLocation} from 'react-router';

import {
  BottomNav,
  type BottomNavLink,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogTitle,
  Logo,
} from '@grov/ui';

import {type PermissionRequirement, usePermissions} from '../auth/access';

export interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{className?: string; 'aria-hidden'?: boolean}>;
  /** Hidden unless the signed-in admin holds these permissions. */
  requires?: PermissionRequirement;
  end?: boolean;
  /** Bottom nav only: the raised centre action (Plan). */
  center?: boolean;
}

export interface AppShellProps {
  nav: NavItem[];
  /** Right side of the top bar: store switcher, user menu … */
  headerEnd?: ReactNode;
  /** Small chip next to the logo, e.g. "Admin". */
  badge?: ReactNode;
  /**
   * Phones and tablets: `menu` opens the nav as a side sheet (admin);
   * `bottom` shows the floating bottom nav (customer app, IA6: five items max).
   */
  mobileNav?: 'menu' | 'bottom';
  children?: ReactNode;
}

const RouterLink: BottomNavLink = ({to, ...props}) => <Link to={to} {...props} />;

/** Sidebar (from `lg`) + top bar + content. On phones the nav opens as a side sheet. */
export function AppShell({nav, headerEnd, badge, mobileNav = 'menu', children}: AppShellProps) {
  const {check} = usePermissions();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const items = nav.filter(item => !item.requires || check(item.requires));
  const bottom = mobileNav === 'bottom';
  const active =
    items.find(item => matchPath({path: item.to, end: item.end ?? false}, location.pathname))?.to ??
    '';

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
            className={cn('lg:hidden', bottom && 'hidden')}
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
          className={cn(
            'mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8',
            bottom && 'pb-32 lg:pb-8'
          )}
        >
          {children ?? <Outlet />}
        </main>
      </div>

      {bottom ? (
        <BottomNav
          className="lg:hidden"
          active={active}
          link={RouterLink}
          items={items.map(({to, label, icon: Icon, center}) => ({
            key: to,
            href: to,
            label,
            center,
            icon: <Icon aria-hidden />,
          }))}
        />
      ) : null}

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
